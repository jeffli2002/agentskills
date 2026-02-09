import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { createDb, skills, type Skill, type User } from '../db';
import { getSessionFromCookie } from '../middleware/auth';
import {
  sanitizeOpenClawName,
  validateOpenClawName,
  validateDescription,
  convertSkillToOpenClaw,
} from '../services/formatConverter';
import { createSkillZip } from '../services/zipBuilder';
import type { ApiResponse } from '@agentskills/shared';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

type Variables = {
  user?: User;
};

// ─── Types ─────────────────────────────────────────────────────────────────

interface ValidationCheck {
  field: string;
  passed: boolean;
  message: string;
  autoFixed: boolean;
}

interface ConversionResult {
  skillMd: string;
  resources: { path: string; content: string; description: string }[];
  validation: {
    score: number;
    checks: ValidationCheck[];
  };
  original: {
    source: 'paste' | 'github' | 'marketplace' | 'composer';
    name?: string;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { frontmatter: {}, body: content };

  const body = content.slice(match[0].length);
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }
  return { frontmatter, body };
}

function validateAndConvert(content: string, source: ConversionResult['original']['source'], sourceName?: string): ConversionResult {
  const checks: ValidationCheck[] = [];
  const { frontmatter, body } = parseFrontmatter(content);

  // Check: has frontmatter
  const hasFrontmatter = Object.keys(frontmatter).length > 0;
  checks.push({
    field: 'frontmatter',
    passed: hasFrontmatter,
    message: hasFrontmatter ? 'YAML frontmatter present' : 'No YAML frontmatter found — will be generated',
    autoFixed: !hasFrontmatter,
  });

  // Check: name field
  let name = frontmatter['name'] || '';
  const hadName = !!name;
  if (!name && sourceName) {
    name = sanitizeOpenClawName(sourceName);
  }
  if (!name) {
    // Try to extract from first heading
    const headingMatch = body.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      name = sanitizeOpenClawName(headingMatch[1]);
    }
  }
  if (!name) {
    name = 'untitled-skill';
  }

  const nameValidation = validateOpenClawName(name);
  const nameWasSanitized = !nameValidation.valid;
  if (nameWasSanitized) {
    name = sanitizeOpenClawName(name);
  }
  checks.push({
    field: 'name',
    passed: hadName && !nameWasSanitized,
    message: !hadName
      ? `Name missing — auto-generated: "${name}"`
      : nameWasSanitized
        ? `Name sanitized: "${name}"`
        : `Valid name: "${name}"`,
    autoFixed: !hadName || nameWasSanitized,
  });

  // Check: description field
  let description = frontmatter['description'] || '';
  const hadDescription = !!description;
  if (!description) {
    // Extract from first paragraph
    const bodyLines = body.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    description = bodyLines[0]?.trim().substring(0, 200) || 'An AI agent skill';
  }
  const descWasMultiline = description.includes('\n');
  if (descWasMultiline) {
    description = description.replace(/\n/g, ' ').trim();
  }
  const descWasTruncated = description.length > 1024;
  if (descWasTruncated) {
    description = description.substring(0, 1024);
  }
  const descValidation = validateDescription(description);
  checks.push({
    field: 'description',
    passed: hadDescription && descValidation.valid,
    message: !hadDescription
      ? 'Description missing — auto-extracted from content'
      : descWasTruncated
        ? 'Description truncated to 1024 characters'
        : descWasMultiline
          ? 'Multi-line description collapsed to single line'
          : 'Valid description',
    autoFixed: !hadDescription || descWasTruncated || descWasMultiline,
  });

  // Check: allowed-tools
  const hasAllowedTools = !!frontmatter['allowed-tools'];
  checks.push({
    field: 'allowed-tools',
    passed: hasAllowedTools,
    message: hasAllowedTools ? 'Allowed tools specified' : 'No allowed-tools field (optional)',
    autoFixed: false,
  });

  // Check: model
  const hasModel = !!frontmatter['model'];
  checks.push({
    field: 'model',
    passed: hasModel,
    message: hasModel ? `Model specified: ${frontmatter['model']}` : 'No model field (optional)',
    autoFixed: false,
  });

  // Check: has markdown body
  const hasBody = body.trim().length > 0;
  checks.push({
    field: 'body',
    passed: hasBody,
    message: hasBody ? 'Markdown body present' : 'No markdown body content',
    autoFixed: false,
  });

  // Check: has heading
  const hasHeading = /^#\s+/m.test(body);
  checks.push({
    field: 'heading',
    passed: hasHeading,
    message: hasHeading ? 'Has markdown heading' : 'No heading found (recommended)',
    autoFixed: false,
  });

  // Build the compliant SKILL.md
  const yamlLines = ['---'];
  yamlLines.push(`name: ${name}`);

  const escapedDesc = /[:"'#\[\]{}]/.test(description)
    ? `"${description.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    : description;
  yamlLines.push(`description: ${escapedDesc}`);

  if (frontmatter['allowed-tools']) {
    yamlLines.push(`allowed-tools: ${frontmatter['allowed-tools']}`);
  }
  if (frontmatter['model']) {
    yamlLines.push(`model: ${frontmatter['model']}`);
  }
  yamlLines.push('---');

  const skillMd = hasBody
    ? `${yamlLines.join('\n')}\n\n${body.trim()}\n`
    : `${yamlLines.join('\n')}\n\n# ${name}\n\n${description}\n`;

  // Calculate score
  const requiredChecks = checks.filter(c => ['frontmatter', 'name', 'description', 'body'].includes(c.field));
  const optionalChecks = checks.filter(c => !['frontmatter', 'name', 'description', 'body'].includes(c.field));
  const requiredScore = requiredChecks.filter(c => c.passed).length / requiredChecks.length * 70;
  const optionalScore = optionalChecks.filter(c => c.passed).length / optionalChecks.length * 30;
  const score = Math.round(requiredScore + optionalScore);

  return {
    skillMd,
    resources: [],
    validation: { score, checks },
    original: { source, name: sourceName },
  };
}

// ─── Routes ────────────────────────────────────────────────────────────────

const converterRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Convert from pasted/uploaded content
converterRouter.post('/paste', async (c) => {
  const { content, filename, resources } = await c.req.json<{
    content: string;
    filename?: string;
    resources?: { path: string; content: string; description: string }[];
  }>();

  if (!content || typeof content !== 'string') {
    return c.json<ApiResponse<null>>({ data: null, error: 'Content is required' }, 400);
  }

  const sourceName = filename?.replace(/\.(md|txt|yaml|yml)$/i, '');
  const result = validateAndConvert(content, 'paste', sourceName);

  if (resources && resources.length > 0) {
    result.resources = resources;
  }

  return c.json<ApiResponse<ConversionResult>>({ data: result, error: null });
});

// Convert from GitHub URL
converterRouter.post('/github', async (c) => {
  const { url, subpath } = await c.req.json<{ url: string; subpath?: string }>();

  if (!url || typeof url !== 'string') {
    return c.json<ApiResponse<null>>({ data: null, error: 'GitHub URL is required' }, 400);
  }

  // Parse GitHub URL
  const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!repoMatch) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Invalid GitHub URL. Expected: github.com/owner/repo' }, 400);
  }

  const owner = repoMatch[1];
  const repo = repoMatch[2].replace(/\.git$/, '');

  // Extract subpath from URL if not provided explicitly
  let effectiveSubpath = subpath || '';
  if (!effectiveSubpath) {
    const pathMatch = url.match(/\/tree\/[^\/]+\/(.+)$/);
    if (pathMatch) {
      effectiveSubpath = pathMatch[1];
    }
  }

  try {
    // Fetch repo tree
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    const treeRes = await fetch(treeUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'AgentSkills-Converter' },
    });

    if (!treeRes.ok) {
      if (treeRes.status === 404) {
        return c.json<ApiResponse<null>>({ data: null, error: 'Repository not found or is private. Only public repos are supported.' }, 404);
      }
      return c.json<ApiResponse<null>>({ data: null, error: `GitHub API error: ${treeRes.status}` }, 502);
    }

    const treeData = await treeRes.json() as { tree: { path: string; type: string; size?: number }[] };
    const files = treeData.tree.filter(f => f.type === 'blob');

    // Filter by subpath
    const filteredFiles = effectiveSubpath
      ? files.filter(f => f.path.startsWith(effectiveSubpath + '/') || f.path === effectiveSubpath)
      : files;

    // Find skill files: SKILL.md > README.md > other .md
    const skillMdFile = filteredFiles.find(f => {
      const basename = f.path.split('/').pop()?.toUpperCase();
      return basename === 'SKILL.MD';
    });
    const readmeMdFile = filteredFiles.find(f => {
      const basename = f.path.split('/').pop()?.toUpperCase();
      return basename === 'README.MD';
    });
    const otherMdFiles = filteredFiles.filter(f => f.path.endsWith('.md') && f !== skillMdFile && f !== readmeMdFile);

    const targetFile = skillMdFile || readmeMdFile;

    if (!targetFile && otherMdFiles.length === 0) {
      return c.json<ApiResponse<null>>({ data: null, error: 'No markdown files found in this repository' }, 404);
    }

    // If multiple candidates and no clear winner, return file list for picking
    if (!targetFile && otherMdFiles.length > 1) {
      return c.json<ApiResponse<{ files: string[]; needsPick: boolean }>>({
        data: {
          files: otherMdFiles.map(f => f.path),
          needsPick: true,
        },
        error: null,
      });
    }

    const fileToFetch = targetFile || otherMdFiles[0];

    // Fetch the content
    const contentUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${fileToFetch.path}`;
    const contentRes = await fetch(contentUrl);
    if (!contentRes.ok) {
      return c.json<ApiResponse<null>>({ data: null, error: 'Failed to fetch file content from GitHub' }, 502);
    }
    const content = await contentRes.text();

    // Collect resource files (scripts/, references/, assets/)
    const skillDir = fileToFetch.path.includes('/') ? fileToFetch.path.substring(0, fileToFetch.path.lastIndexOf('/')) : '';
    const resourceDirs = ['scripts/', 'references/', 'assets/'];
    const resourceFiles = filteredFiles.filter(f => {
      const relativePath = skillDir ? f.path.replace(skillDir + '/', '') : f.path;
      return resourceDirs.some(d => relativePath.startsWith(d)) && f.size && f.size < 100000;
    });

    // Fetch resource contents
    const resources: { path: string; content: string; description: string }[] = [];
    for (const rf of resourceFiles.slice(0, 10)) { // Limit to 10 resource files
      try {
        const rfUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${rf.path}`;
        const rfRes = await fetch(rfUrl);
        if (rfRes.ok) {
          const rfContent = await rfRes.text();
          const relativePath = skillDir ? rf.path.replace(skillDir + '/', '') : rf.path;
          resources.push({ path: relativePath, content: rfContent, description: '' });
        }
      } catch {
        // Skip files that can't be fetched
      }
    }

    const result = validateAndConvert(content, 'github', `${owner}/${repo}`);
    result.resources = resources;

    return c.json<ApiResponse<ConversionResult>>({ data: result, error: null });
  } catch (err) {
    return c.json<ApiResponse<null>>({ data: null, error: `Failed to fetch from GitHub: ${err instanceof Error ? err.message : String(err)}` }, 502);
  }
});

// Pick a specific file from GitHub repo
converterRouter.post('/github/pick', async (c) => {
  const { url, file } = await c.req.json<{ url: string; file: string }>();

  if (!url || !file) {
    return c.json<ApiResponse<null>>({ data: null, error: 'URL and file are required' }, 400);
  }

  const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!repoMatch) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Invalid GitHub URL' }, 400);
  }

  const owner = repoMatch[1];
  const repo = repoMatch[2].replace(/\.git$/, '');

  try {
    const contentUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file}`;
    const contentRes = await fetch(contentUrl);
    if (!contentRes.ok) {
      return c.json<ApiResponse<null>>({ data: null, error: 'Failed to fetch file from GitHub' }, 502);
    }
    const content = await contentRes.text();
    const result = validateAndConvert(content, 'github', `${owner}/${repo}`);
    return c.json<ApiResponse<ConversionResult>>({ data: result, error: null });
  } catch (err) {
    return c.json<ApiResponse<null>>({ data: null, error: `GitHub fetch failed: ${err instanceof Error ? err.message : String(err)}` }, 502);
  }
});

// Convert from existing marketplace skill
converterRouter.get('/skill/:id', async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');

  const skill = await db.select()
    .from(skills)
    .where(eq(skills.id, id))
    .get();

  if (!skill) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
  }

  const { skillMd, resources } = convertSkillToOpenClaw(skill);

  // Run validation on the converted output
  const result = validateAndConvert(skillMd, 'marketplace', skill.name);
  result.resources = resources;

  return c.json<ApiResponse<ConversionResult>>({ data: result, error: null });
});

// Validate content only (no conversion)
converterRouter.post('/validate', async (c) => {
  const { content } = await c.req.json<{ content: string }>();

  if (!content || typeof content !== 'string') {
    return c.json<ApiResponse<null>>({ data: null, error: 'Content is required' }, 400);
  }

  const result = validateAndConvert(content, 'paste');

  return c.json<ApiResponse<ConversionResult['validation']>>({
    data: result.validation,
    error: null,
  });
});

// Publish converted skill (requires auth)
converterRouter.post('/publish', async (c) => {
  const db = createDb(c.env.DB);
  const user = await getSessionFromCookie(c, db);

  if (!user) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Authentication required' }, 401);
  }

  const { content, resources, visibility } = await c.req.json<{
    content: string;
    resources?: { path: string; content: string; description: string }[];
    visibility: 'public' | 'private';
  }>();

  if (!content) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Content is required' }, 400);
  }

  // Parse the SKILL.md to extract name and description
  const { frontmatter } = parseFrontmatter(content);
  const name = frontmatter['name'] || 'untitled-skill';
  const description = frontmatter['description'] || 'An AI agent skill';

  const skillId = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = Date.now();

  await db.insert(skills).values({
    id: skillId,
    name: name,
    description: description,
    author: user.name,
    authorAvatarUrl: user.avatarUrl,
    githubUrl: skillId,
    starsCount: 0,
    forksCount: 0,
    category: 'other',
    r2FileKey: '',
    fileSize: content.length,
    downloadCount: 0,
    avgRating: 0,
    ratingCount: 0,
    lastCommitAt: null,
    filesJson: null,
    skillMdContent: content,
    skillMdParsed: JSON.stringify(frontmatter),
    resourcesJson: resources && resources.length > 0 ? JSON.stringify(resources) : null,
    creatorId: user.id,
    visibility: visibility || 'public',
    createdAt: now,
    updatedAt: now,
  });

  return c.json<ApiResponse<{ skillId: string; url: string }>>({
    data: { skillId, url: `/skills/${skillId}` },
    error: null,
  });
});

export { converterRouter };
