import { Hono, type Context } from 'hono';
import { eq, and } from 'drizzle-orm';
import { createDb, ratings, skills, type User } from '../db';
import { requireAuth } from '../middleware/auth';
import { generateId } from '../lib/utils';
import type { ApiResponse } from '@agentskills/shared';

type Bindings = {
  DB: D1Database;
};

type Variables = {
  user: User;
};

type RatingResponse = { rating: number; avgRating: number; ratingCount: number };
type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;

const ratingsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All ratings routes require auth
ratingsRouter.use('*', requireAuth);

// List user's ratings
ratingsRouter.get('/', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');

  const userRatings = await db.select()
    .from(ratings)
    .where(eq(ratings.userId, user.id));

  return c.json({
    data: userRatings,
    error: null,
  });
});

// Shared handler for rating a skill (used by both POST and PUT)
async function handleRateSkill(c: AppContext): Promise<Response> {
  const db = createDb(c.env.DB);
  const user = c.get('user');
  const skillId = c.req.param('skillId');

  let body: { score: number };
  try {
    body = await c.req.json();
  } catch {
    return c.json({
      data: null,
      error: 'Invalid JSON body'
    }, 400);
  }

  const score = body.score;

  // Validate score
  if (typeof score !== 'number' || score < 1 || score > 5 || !Number.isInteger(score)) {
    return c.json({
      data: null,
      error: 'Score must be an integer between 1 and 5'
    }, 400);
  }

  // Check skill exists
  const skill = await db.select()
    .from(skills)
    .where(eq(skills.id, skillId))
    .get();

  if (!skill) {
    return c.json({ data: null, error: 'Skill not found' }, 404);
  }

  // Check if already rated
  const existing = await db.select()
    .from(ratings)
    .where(and(
      eq(ratings.userId, user.id),
      eq(ratings.skillId, skillId)
    ))
    .get();

  const now = Date.now();

  // Get current skill stats (includes seeded values)
  const currentAvg = skill.avgRating || 0;
  const currentCount = skill.ratingCount || 0;

  let avgRating: number;
  let ratingCount: number;

  if (existing) {
    // Update existing rating - adjust average by removing old score and adding new
    const oldScore = existing.score;
    if (currentCount > 0) {
      avgRating = (currentAvg * currentCount - oldScore + score) / currentCount;
    } else {
      avgRating = score;
    }
    ratingCount = currentCount;

    await db.update(ratings)
      .set({ score, updatedAt: new Date(now) })
      .where(eq(ratings.id, existing.id));
  } else {
    // Create new rating - add to existing average
    avgRating = (currentAvg * currentCount + score) / (currentCount + 1);
    ratingCount = currentCount + 1;

    await db.insert(ratings).values({
      id: generateId(),
      userId: user.id,
      skillId,
      score,
    });
  }

  await db.update(skills)
    .set({ avgRating, ratingCount, updatedAt: new Date(now) })
    .where(eq(skills.id, skillId));

  return c.json({
    data: { rating: score, avgRating, ratingCount },
    error: null,
  });
}

// Rate a skill (create or update)
ratingsRouter.post('/:skillId', handleRateSkill);

// Update rating (same as POST for REST semantics)
ratingsRouter.put('/:skillId', handleRateSkill);

export { ratingsRouter };
