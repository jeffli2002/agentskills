import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { createDb, sessions, users, type User } from '../db';

type Bindings = {
  DB: D1Database;
};

type Variables = {
  user: User | null;
};

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
    const sessionToken = getCookie(c, 'session');

    if (!sessionToken) {
      return c.json({ data: null, error: 'Unauthorized' }, 401);
    }

    const db = createDb(c.env.DB);

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
