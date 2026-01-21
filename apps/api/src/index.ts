import { Hono } from 'hono';
import { cors } from 'hono/cors';

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
  origin: ['http://localhost:5173', 'https://agentskills.pages.dev'],
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
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
