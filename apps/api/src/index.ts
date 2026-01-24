import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { skillsRouter } from './routes/skills';
import { authRouter } from './routes/auth';
import { favoritesRouter } from './routes/favorites';
import { ratingsRouter } from './routes/ratings';
import { createDb, skills } from './db';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  ENVIRONMENT: string;
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
    // Allow custom domain
    if (origin === 'https://agentskills.cv') return origin;
    return null;
  },
  credentials: true,
}));

// Routes
app.route('/api/skills', skillsRouter);
app.route('/api/auth', authRouter);
app.route('/api/favorites', favoritesRouter);
app.route('/api/ratings', ratingsRouter);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
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
