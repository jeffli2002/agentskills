import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { skillsRouter } from './routes/skills';
import { authRouter } from './routes/auth';
import { favoritesRouter } from './routes/favorites';
import { ratingsRouter } from './routes/ratings';
import { composerRouter } from './routes/composer';
import { converterRouter } from './routes/converter';
import { createDb, skills } from './db';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  ENVIRONMENT: string;
  ANTHROPIC_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS for frontend
app.use('/api/*', cors({
  origin: (origin) => {
    // Allow localhost for dev
    if (origin?.startsWith('http://localhost:')) return origin;
    // Allow all agentskills.pages.dev subdomains
    if (origin?.endsWith('.agentskills.pages.dev')) return origin;
    // Allow main Pages domain
    if (origin === 'https://agentskills.pages.dev') return origin;
    // Allow custom domain (with and without www)
    if (origin === 'https://agentskills.cv') return origin;
    if (origin === 'https://www.agentskills.cv') return origin;
    return null;
  },
  credentials: true,
}));

// Routes
app.route('/api/skills', skillsRouter);
app.route('/api/auth', authRouter);
app.route('/api/favorites', favoritesRouter);
app.route('/api/ratings', ratingsRouter);
app.route('/api/composer', composerRouter);
app.route('/api/converter', converterRouter);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Test outbound fetch
app.get('/api/test-fetch', async (c) => {
  try {
    console.log('Testing outbound fetch...');
    const response = await fetch('https://httpbin.org/get');
    console.log('Fetch response status:', response.status);
    const data = await response.json();
    return c.json({ status: 'ok', data });
  } catch (err) {
    console.error('Fetch error:', err);
    return c.json({
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});

// Test Google OAuth token endpoint
app.get('/api/test-google-fetch', async (c) => {
  try {
    console.log('Testing Google OAuth fetch...');
    // This will fail with invalid_grant but should NOT throw a network error
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'test',
        client_secret: 'test',
        code: 'test',
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:5180/api/auth/callback',
      }),
    });
    console.log('Google fetch response status:', response.status);
    const data = await response.json();
    return c.json({ status: 'ok', httpStatus: response.status, data });
  } catch (err) {
    console.error('Google fetch error:', err);
    return c.json({
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 500);
  }
});

// D1 test endpoint
app.get('/api/test-d1', async (c) => {
  try {
    const d1 = c.env.DB;

    // Test 1: Basic query
    const test1 = await d1.prepare('SELECT 1 as num').first();

    // Test 2: Check tables
    const tables = await d1.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();

    // Test 3: Try inserting a test user
    const testId = 'test-' + Date.now();
    const now = Date.now();
    const insertResult = await d1.prepare(
      'INSERT INTO users (id, email, name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(testId, `test-${testId}@example.com`, 'Test User', null, now, now).run();

    // Test 4: Read back the user
    const user = await d1.prepare('SELECT * FROM users WHERE id = ?').bind(testId).first();

    // Test 5: Delete the test user
    await d1.prepare('DELETE FROM users WHERE id = ?').bind(testId).run();

    return c.json({
      status: 'ok',
      test1,
      tables: tables.results,
      insertResult,
      user,
    });
  } catch (err) {
    return c.json({
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 500);
  }
});

// Test OAuth callback simulation
app.get('/api/test-oauth', async (c) => {
  try {
    const d1 = c.env.DB;

    // Simulate Google user data
    const googleUser = {
      id: 'google-123',
      email: 'testuser@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg',
    };

    // Step 1: Check existing user
    const existingUser = await d1.prepare(
      'SELECT id, email, name, avatar_url, created_at, updated_at FROM users WHERE email = ?'
    ).bind(googleUser.email).first();

    const now = Date.now();
    let userId: string;

    if (!existingUser) {
      // Step 2a: Create new user
      const newUserId = 'usr_' + Date.now();
      await d1.prepare(
        'INSERT INTO users (id, email, name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(newUserId, googleUser.email, googleUser.name, googleUser.picture, now, now).run();
      userId = newUserId;
    } else {
      // Step 2b: Update existing user
      await d1.prepare(
        'UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?'
      ).bind(googleUser.name, googleUser.picture, now, existingUser.id).run();
      userId = existingUser.id as string;
    }

    // Step 3: Create session
    const sessionToken = 'sess_' + Date.now();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await d1.prepare(
      'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
    ).bind(sessionToken, userId, expiresAt, now).run();

    // Step 4: Fetch user
    const user = await d1.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first();

    return c.json({
      status: 'ok',
      userId,
      sessionToken,
      user,
    });
  } catch (err) {
    return c.json({
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 500);
  }
});

// Categories endpoint (alias for convenience)
app.get('/api/categories', async (c) => {
  const db = createDb(c.env.DB);

  const categories = await db.selectDistinct({ category: skills.category })
    .from(skills);

  return c.json({ data: categories.map(cat => cat.category), error: null });
});

// 404 handler
app.notFound((c) => {
  return c.json({ data: null, error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ data: null, error: 'Internal server error' }, 500);
});

export default app;
