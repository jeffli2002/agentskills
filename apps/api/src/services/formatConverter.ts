import type { Skill } from '../db';

// ─── Name Validation & Sanitization ─────────────────────────────────────────

const OPENCLAW_NAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export function validateOpenClawName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length === 0) return { valid: false, error: 'Name is required' };
  if (name.length > 64) return { valid: false, error: 'Name must be 1-64 characters' };
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name)) {
    return { valid: false, error: 'Name must be lowercase alphanumeric with single hyphens, no leading/trailing hyphens' };
  }
  if (/--/.test(name)) return { valid: false, error: 'Name must not contain consecutive hyphens' };
  return { valid: true };
}

export function sanitizeOpenClawName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 64);
}

// ─── Description Validation ─────────────────────────────────────────────────

export function validateDescription(description: string): { valid: boolean; error?: string } {
  if (!description || description.length === 0) return { valid: false, error: 'Description is required' };
  if (description.length > 1024) return { valid: false, error: 'Description must be 1024 characters or fewer' };
  if (description.includes('\n')) return { valid: false, error: 'Description must be a single line' };
  return { valid: true };
}

// ─── YAML Frontmatter Helpers ───────────────────────────────────────────────

function escapeYamlString(value: string): string {
  if (/[:"'#\[\]{}&*?|>!%@`]/.test(value) || value.trim() !== value) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const body = content.slice(match[0].length);

  // Simple YAML parser for key-value pairs
  const frontmatter: Record<string, unknown> = {};
  const lines = match[1].split('\n');
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const line of lines) {
    // Check for list item
    if (currentKey && /^\s+-\s+/.test(line)) {
      if (!currentList) currentList = [];
      currentList.push(line.replace(/^\s+-\s+/, '').trim());
      continue;
    }

    // Flush previous list
    if (currentKey && currentList) {
      frontmatter[currentKey] = currentList;
      currentList = null;
      currentKey = null;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      if (!value) {
        // Could be a list or nested object starting next line
        currentKey = key;
        continue;
      }

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Handle comma-separated allowed-tools
      if (key === 'allowed-tools') {
        frontmatter[key] = value.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        frontmatter[key] = value;
      }
      currentKey = null;
    }
  }

  // Flush final list
  if (currentKey && currentList) {
    frontmatter[currentKey] = currentList;
  }

  return { frontmatter, body };
}

// ─── Main Converter ─────────────────────────────────────────────────────────

export function convertSkillToOpenClaw(skill: Pick<Skill, 'name' | 'description' | 'skillMdContent' | 'skillMdParsed'>): string {
  // 1. Sanitize name
  const name = sanitizeOpenClawName(skill.name);

  // 2. Prepare description: single-line, max 1024 chars
  let description = (skill.description || '').replace(/\n/g, ' ').trim();
  if (description.length > 1024) {
    description = description.substring(0, 1024);
  }

  // 3. Extract existing frontmatter fields to preserve
  let existingFrontmatter: Record<string, unknown> = {};
  let markdownBody = '';

  if (skill.skillMdParsed) {
    try {
      existingFrontmatter = JSON.parse(skill.skillMdParsed);
    } catch {
      // Ignore parse errors
    }
  }

  if (skill.skillMdContent) {
    const parsed = parseFrontmatter(skill.skillMdContent);
    markdownBody = parsed.body.trim();

    // If no parsed metadata, use frontmatter from content
    if (Object.keys(existingFrontmatter).length === 0) {
      existingFrontmatter = parsed.frontmatter;
    }
  }

  // 4. Build YAML frontmatter
  const yamlLines: string[] = ['---'];

  // Required fields
  yamlLines.push(`name: ${name}`);
  yamlLines.push(`description: ${escapeYamlString(description)}`);

  // Optional fields from existing frontmatter
  const allowedTools = existingFrontmatter['allowed-tools'];
  if (allowedTools) {
    if (Array.isArray(allowedTools)) {
      yamlLines.push(`allowed-tools: ${allowedTools.join(', ')}`);
    } else {
      yamlLines.push(`allowed-tools: ${allowedTools}`);
    }
  }

  const model = existingFrontmatter['model'];
  if (model) {
    yamlLines.push(`model: ${model}`);
  }

  yamlLines.push('---');

  // 5. Assemble final SKILL.md
  const frontmatterBlock = yamlLines.join('\n');

  if (markdownBody) {
    return `${frontmatterBlock}\n\n${markdownBody}\n`;
  }

  // Generate basic body when no existing content
  return `${frontmatterBlock}\n\n# ${name}\n\n${description}\n`;
}
