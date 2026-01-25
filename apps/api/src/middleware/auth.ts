import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { createDb, sessions, users, type User } from '../db';

type Bindings = {
  DB: D1Database;
  ENVIRONMENT?: string;
};

type Variables = {
  user: User | null;
};

// Mock user for development testing
const MOCK_USER_DATA = {
  id: 'test-123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
};

// Ensure mock user exists in database (for dev mode)
async function ensureMockUser(db: ReturnType<typeof createDb>): Promise<User> {
  // Check by email (unique constraint) instead of ID
  const existing = await db.select().from(users).where(eq(users.email, MOCK_USER_DATA.email)).get();
  if (existing) return existing;

  const now = new Date();
  await db.insert(users).values({
    id: MOCK_USER_DATA.id,
    email: MOCK_USER_DATA.email,
    name: MOCK_USER_DATA.name,
    avatarUrl: MOCK_USER_DATA.avatarUrl,
    createdAt: now,
    updatedAt: now,
  });

  return (await db.select().from(users).where(eq(users.email, MOCK_USER_DATA.email)).get())!;
}

// Optional auth - sets user if logged in, but doesn't require it
export const optionalAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
  async (c, next) => {
    const sessionToken = getCookie(c, 'session');

    if (!sessionToken) {
      c.set('user', null);
      return next();
    }

    const db = createDb(c.env.DB);

    const session = await db.select()
      .from(sessions)
      .where(eq(sessions.id, sessionToken))
      .get();

    if (!session || session.expiresAt < new Date()) {
      c.set('user', null);
      return next();
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    c.set('user', user || null);
    return next();
  }
);

// Required auth - returns 401 if not logged in
export const requireAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
  async (c, next) => {
    const db = createDb(c.env.DB);

    // In development mode, use mock user
    if (c.env.ENVIRONMENT === 'development') {
      const mockUser = await ensureMockUser(db);
      c.set('user', mockUser);
      return next();
    }

    const sessionToken = getCookie(c, 'session');

    if (!sessionToken) {
      return c.json({ data: null, error: 'Unauthorized' }, 401);
    }

    const session = await db.select()
      .from(sessions)
      .where(eq(sessions.id, sessionToken))
      .get();

    if (!session || session.expiresAt < new Date()) {
      return c.json({ data: null, error: 'Session expired' }, 401);
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    if (!user) {
      return c.json({ data: null, error: 'User not found' }, 401);
    }

    c.set('user', user);
    return next();
  }
);

// Helper function to get user from session cookie (for use outside middleware)
export async function getSessionFromCookie(
  c: { req: { raw: Request }; env: { DB: D1Database; ENVIRONMENT?: string } },
  db: ReturnType<typeof createDb>
): Promise<User | null> {
  // In development mode, use mock user
  if (c.env.ENVIRONMENT === 'development') {
    return await ensureMockUser(db);
  }

  // Get cookie from request
  const cookieHeader = c.req.raw.headers.get('cookie');
  if (!cookieHeader) return null;

  // Parse session cookie
  const sessionMatch = cookieHeader.match(/session=([^;]+)/);
  if (!sessionMatch) return null;

  const sessionToken = sessionMatch[1];

  const session = await db.select()
    .from(sessions)
    .where(eq(sessions.id, sessionToken))
    .get();

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const user = await db.select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  return user || null;
}
