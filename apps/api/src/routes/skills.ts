import { Hono } from 'hono';
import { eq, desc, sql, and, asc } from 'drizzle-orm';
import { createDb, skills, users, type Skill, type User } from '../db';
import { getSessionFromCookie } from '../middleware/auth';
import { convertSkillToOpenClaw } from '../services/formatConverter';
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

  const openClawMd = convertSkillToOpenClaw(skill);
  const sanitizedName = skill.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  return new Response(openClawMd, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="SKILL.md"`,
      'X-OpenClaw-Name': sanitizedName,
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
    const skillMdBytes = new TextEncoder().encode(skill.skillMdContent);
    const filename = 'SKILL.md';
    const filenameBytes = new TextEncoder().encode(filename);
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

    // CRC32 calculation
    const crc32Table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crc32Table[i] = c;
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < skillMdBytes.length; i++) {
      crc = crc32Table[(crc ^ skillMdBytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;

    // Local file header
    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, skillMdBytes.length, true);
    localView.setUint32(22, skillMdBytes.length, true);
    localView.setUint16(26, filenameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(filenameBytes, 30);

    // Central directory header
    const centralHeader = new Uint8Array(46 + filenameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, skillMdBytes.length, true);
    centralView.setUint32(24, skillMdBytes.length, true);
    centralView.setUint16(28, filenameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, 0, true);
    centralHeader.set(filenameBytes, 46);

    // End of central directory
    const centralDirOffset = localHeader.length + skillMdBytes.length;
    const centralDirSize = centralHeader.length;
    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, 1, true);
    endView.setUint16(10, 1, true);
    endView.setUint32(12, centralDirSize, true);
    endView.setUint32(16, centralDirOffset, true);
    endView.setUint16(20, 0, true);

    // Combine all parts
    const zipBuffer = new Uint8Array(localHeader.length + skillMdBytes.length + centralHeader.length + endRecord.length);
    let offset = 0;
    zipBuffer.set(localHeader, offset); offset += localHeader.length;
    zipBuffer.set(skillMdBytes, offset); offset += skillMdBytes.length;
    zipBuffer.set(centralHeader, offset); offset += centralHeader.length;
    zipBuffer.set(endRecord, offset);

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
