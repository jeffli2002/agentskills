import { Hono } from 'hono';
import { eq, desc, sql, and, asc } from 'drizzle-orm';
import { createDb, skills, users, type Skill, type User } from '../db';
import { getSessionFromCookie } from '../middleware/auth';
import { convertSkillToOpenClaw } from '../services/formatConverter';
import { createSkillZip } from '../services/zipBuilder';
import type { ApiResponse, PaginatedResponse } from '@agentskills/shared';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

type Variables = {
  user?: User;
};

const skillsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get categories with counts - must be defined before :id route to avoid conflicts
skillsRouter.get('/meta/categories', async (c) => {
  const db = createDb(c.env.DB);

  const categories = await db.select({
    category: skills.category,
    count: sql<number>`count(*)`
  })
    .from(skills)
    .where(eq(skills.visibility, 'public'))
    .groupBy(skills.category)
    .orderBy(sql`count(*) DESC`);

  return c.json<ApiResponse<{ category: string; count: number }[]>>({
    data: categories,
    error: null
  });
});

// Get user's created skills (requires auth)
skillsRouter.get('/my', async (c) => {
  const db = createDb(c.env.DB);

  // Get user from session
  const user = await getSessionFromCookie(c, db);
  if (!user) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Unauthorized' }, 401);
  }

  const userSkills = await db.select()
    .from(skills)
    .where(eq(skills.creatorId, user.id))
    .orderBy(desc(skills.createdAt));

  return c.json<ApiResponse<Skill[]>>({ data: userSkills, error: null });
});

// List all skills with search, filter, sort
skillsRouter.get('/', async (c) => {
  const db = createDb(c.env.DB);

  const q = c.req.query('q');
  const category = c.req.query('category');
  const sort = c.req.query('sort') || 'stars';
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  const offset = parseInt(c.req.query('offset') || '0');
  const minStarsQuery = c.req.query('minStars');
  const minStars = minStarsQuery ? parseInt(minStarsQuery) : undefined;

  // Build conditions
  const conditions = [];
  conditions.push(eq(skills.visibility, 'public'));
  if (minStars !== undefined) {
    conditions.push(sql`${skills.starsCount} >= ${minStars}`);
  }
  if (q) {
    conditions.push(
      sql`(${skills.name} LIKE ${'%' + q + '%'} OR ${skills.description} LIKE ${'%' + q + '%'})`
    );
  }
  if (category) {
    conditions.push(eq(skills.category, category));
  }

  // Build order
  let orderBy: ReturnType<typeof desc>[];
  const now = Date.now();
  switch (sort) {
    case 'trending':
      // Freshness-boosted stars: starsCount * max(0.2, 1 - daysSinceCommit/30)
      // Skills with recent commits get boosted, 30-day decay window
      // Secondary sort by name for deterministic ordering when scores tie
      orderBy = [
        desc(sql`${skills.starsCount} * MAX(0.2, 1.0 - ((${now} - COALESCE(${skills.lastCommitAt}, 0)) / (1000.0 * 60 * 60 * 24 * 30)))`),
        asc(skills.name)
      ];
      break;
    case 'rating':
      orderBy = [desc(skills.avgRating), asc(skills.name)];
      break;
    case 'downloads':
      orderBy = [desc(skills.downloadCount), asc(skills.name)];
      break;
    case 'stars':
    default:
      orderBy = [desc(skills.starsCount), asc(skills.name)];
  }

  // Query
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [results, countResult] = await Promise.all([
    db.select()
      .from(skills)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` })
      .from(skills)
      .where(whereClause),
  ]);

  const response: PaginatedResponse<Skill> = {
    data: results,
    total: countResult[0]?.count || 0,
    limit,
    offset,
  };

  return c.json(response);
});

// Export skill as OpenClaw-compliant SKILL.md
skillsRouter.get('/:id/export/openclaw', async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');

  const skill = await db.select()
    .from(skills)
    .where(eq(skills.id, id))
    .get();

  if (!skill) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
  }

  const { skillMd: openClawMd, resources } = convertSkillToOpenClaw(skill);
  const sanitizedName = skill.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  // If multi-file skill, return ZIP
  if (resources.length > 0) {
    const zipBuffer = createSkillZip(openClawMd, resources);
    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${sanitizedName}.zip"`,
        'X-OpenClaw-Name': sanitizedName,
        'X-OpenClaw-HasResources': 'true',
      },
    });
  }

  // Single-file skill, return plain markdown
  return new Response(openClawMd, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="SKILL.md"`,
      'X-OpenClaw-Name': sanitizedName,
      'X-OpenClaw-HasResources': 'false',
    },
  });
});

// Get single skill
skillsRouter.get('/:id', async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');

  const skill = await db.select()
    .from(skills)
    .where(eq(skills.id, id))
    .get();

  if (!skill) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
  }

  // Private skills are only visible to their creator
  if (skill.visibility === 'private') {
    const user = await getSessionFromCookie(c, db);
    if (!user || user.id !== skill.creatorId) {
      return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
    }
  }

  return c.json<ApiResponse<Skill>>({ data: skill, error: null });
});

// Get related skills (same category, excluding current skill)
skillsRouter.get('/:id/related', async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');
  const limit = Math.min(parseInt(c.req.query('limit') || '5'), 10);

  // First get the current skill to find its category
  const currentSkill = await db.select({ category: skills.category })
    .from(skills)
    .where(eq(skills.id, id))
    .get();

  if (!currentSkill) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
  }

  // Get related skills from the same category
  const relatedSkills = await db.select({
    id: skills.id,
    name: skills.name,
    author: skills.author,
    authorAvatarUrl: skills.authorAvatarUrl,
    starsCount: skills.starsCount,
  })
    .from(skills)
    .where(and(
      eq(skills.category, currentSkill.category),
      sql`${skills.id} != ${id}`
    ))
    .orderBy(desc(skills.starsCount))
    .limit(limit);

  return c.json<ApiResponse<typeof relatedSkills>>({ data: relatedSkills, error: null });
});

// Download skill
skillsRouter.get('/:id/download', async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');

  const skill = await db.select()
    .from(skills)
    .where(eq(skills.id, id))
    .get();

  if (!skill) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
  }

  // Increment download count
  await db.update(skills)
    .set({ downloadCount: skill.downloadCount + 1 })
    .where(eq(skills.id, id));

  // TODO: Log download to downloads table if user is logged in

  // Try to get object from R2 bucket first
  let object: R2ObjectBody | null = null;
  try {
    object = await c.env.BUCKET.get(skill.r2FileKey);
  } catch {
    // R2 not available (e.g., local development)
  }

  if (object) {
    // Return the file directly from R2
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${skill.name}.zip"`);
    headers.set('Content-Length', object.size.toString());
    return new Response(object.body, { headers });
  }

  // Fallback for user-created skills: generate ZIP on-the-fly from skillMdContent
  if (skill.skillMdContent) {
    // Parse resources if present
    const resources = skill.resourcesJson
      ? (() => { try { return JSON.parse(skill.resourcesJson); } catch { return undefined; } })()
      : undefined;

    const zipBuffer = createSkillZip(skill.skillMdContent, resources);

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${skill.name}.zip"`);
    headers.set('Content-Length', zipBuffer.length.toString());
    return new Response(zipBuffer, { headers });
  }

  // Fallback for GitHub skills: redirect to GitHub archive URL
  const repoMatch = skill.githubUrl.match(/^(https:\/\/github\.com\/[^\/]+\/[^\/]+)/);
  if (repoMatch) {
    const repoUrl = repoMatch[1];
    const githubArchiveUrl = `${repoUrl}/archive/refs/heads/main.zip`;
    return c.redirect(githubArchiveUrl, 302);
  }

  // If we can't serve the file, return an error
  return c.json<ApiResponse<null>>({ data: null, error: 'Download not available' }, 404);
});

export { skillsRouter };
