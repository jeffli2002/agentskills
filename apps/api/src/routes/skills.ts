import { Hono } from 'hono';
import { eq, desc, sql, and } from 'drizzle-orm';
import { createDb, skills, type Skill } from '../db';
import type { ApiResponse, PaginatedResponse } from '@agentskills/shared';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

const skillsRouter = new Hono<{ Bindings: Bindings }>();

// Get categories - must be defined before :id route to avoid conflicts
skillsRouter.get('/meta/categories', async (c) => {
  const db = createDb(c.env.DB);

  const categories = await db.selectDistinct({ category: skills.category })
    .from(skills);

  return c.json<ApiResponse<string[]>>({
    data: categories.map(cat => cat.category),
    error: null
  });
});

// List all skills with search, filter, sort
skillsRouter.get('/', async (c) => {
  const db = createDb(c.env.DB);

  const q = c.req.query('q');
  const category = c.req.query('category');
  const sort = c.req.query('sort') || 'stars';
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  const offset = parseInt(c.req.query('offset') || '0');

  // Build conditions
  const conditions = [];
  if (q) {
    conditions.push(
      sql`(${skills.name} LIKE ${'%' + q + '%'} OR ${skills.description} LIKE ${'%' + q + '%'})`
    );
  }
  if (category) {
    conditions.push(eq(skills.category, category));
  }

  // Build order
  let orderBy;
  switch (sort) {
    case 'rating':
      orderBy = desc(skills.avgRating);
      break;
    case 'downloads':
      orderBy = desc(skills.downloadCount);
      break;
    case 'stars':
    default:
      orderBy = desc(skills.starsCount);
  }

  // Query
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [results, countResult] = await Promise.all([
    db.select()
      .from(skills)
      .where(whereClause)
      .orderBy(orderBy)
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

  // Get object from R2 bucket
  const object = await c.env.BUCKET.get(skill.r2FileKey);

  if (!object) {
    return c.json<ApiResponse<null>>({ data: null, error: 'File not found' }, 404);
  }

  // Return the file directly
  const headers = new Headers();
  headers.set('Content-Type', 'application/zip');
  headers.set('Content-Disposition', `attachment; filename="${skill.name}.zip"`);
  headers.set('Content-Length', object.size.toString());

  return new Response(object.body, { headers });
});

export { skillsRouter };
