import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { createDb, favorites, skills, type User, type Skill } from '../db';
import { requireAuth } from '../middleware/auth';
import { generateId } from '../lib/utils';
import type { ApiResponse } from '@agentskills/shared';

type Bindings = {
  DB: D1Database;
};

type Variables = {
  user: User;
};

const favoritesRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All favorites routes require auth
favoritesRouter.use('*', requireAuth);

// List user's favorites
favoritesRouter.get('/', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');

  const userFavorites = await db.select({
    skill: skills,
  })
    .from(favorites)
    .innerJoin(skills, eq(favorites.skillId, skills.id))
    .where(eq(favorites.userId, user.id));

  return c.json<ApiResponse<Skill[]>>({
    data: userFavorites.map(f => f.skill),
    error: null,
  });
});

// Add to favorites
favoritesRouter.post('/:skillId', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');
  const skillId = c.req.param('skillId');

  // Check skill exists
  const skill = await db.select()
    .from(skills)
    .where(eq(skills.id, skillId))
    .get();

  if (!skill) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
  }

  // Check if already favorited
  const existing = await db.select()
    .from(favorites)
    .where(and(
      eq(favorites.userId, user.id),
      eq(favorites.skillId, skillId)
    ))
    .get();

  if (existing) {
    return c.json<ApiResponse<{ favorited: boolean }>>({
      data: { favorited: true },
      error: null,
    });
  }

  // Add favorite
  await db.insert(favorites).values({
    id: generateId(),
    userId: user.id,
    skillId,
  });

  return c.json<ApiResponse<{ favorited: boolean }>>({
    data: { favorited: true },
    error: null,
  });
});

// Remove from favorites
favoritesRouter.delete('/:skillId', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');
  const skillId = c.req.param('skillId');

  await db.delete(favorites)
    .where(and(
      eq(favorites.userId, user.id),
      eq(favorites.skillId, skillId)
    ));

  return c.json<ApiResponse<{ favorited: boolean }>>({
    data: { favorited: false },
    error: null,
  });
});

export { favoritesRouter };
