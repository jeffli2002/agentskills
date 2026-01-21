# MVP First Slice Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an end-to-end working Agent Skills Marketplace with browse, search, download, favorites, and ratings.

**Architecture:** Cloudflare full-stack monorepo. React frontend on Pages, Hono API on Workers, D1 database, R2 file storage. Google OAuth for auth.

**Tech Stack:** React 19, Vite 7, Tailwind CSS 4, shadcn/ui, Wouter, Hono, Drizzle ORM, Cloudflare D1/R2/Workers/Pages, pnpm workspaces.

---

## Phase 1: Project Setup

### Task 1: Initialize Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.nvmrc`

**Step 1: Create root package.json**

```json
{
  "name": "agentskills",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    "build": "pnpm --filter web build",
    "build:api": "pnpm --filter api build",
    "db:generate": "pnpm --filter api db:generate",
    "db:migrate": "pnpm --filter api db:migrate",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
.wrangler/
.dev.vars
.env
.env.local
*.log
.DS_Store
```

**Step 4: Create .nvmrc**

```
22
```

**Step 5: Initialize pnpm**

Run: `pnpm install`
Expected: Creates pnpm-lock.yaml

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: initialize pnpm monorepo"
```

---

### Task 2: Create Shared Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types.ts`

**Step 1: Create packages/shared/package.json**

```json
{
  "name": "@agentskills/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

**Step 2: Create packages/shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/shared/src/types.ts**

```typescript
// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

// Skill types
export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  githubUrl: string;
  starsCount: number;
  category: string;
  r2FileKey: string;
  fileSize: number;
  downloadCount: number;
  avgRating: number;
  ratingCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface SkillWithUserData extends Skill {
  isFavorited?: boolean;
  userRating?: number;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Request types
export interface SkillsQueryParams {
  q?: string;
  category?: string;
  sort?: 'stars' | 'rating' | 'downloads';
  limit?: number;
  offset?: number;
}

export interface RatingRequest {
  score: number; // 1-5
}

// Categories
export const SKILL_CATEGORIES = [
  'coding',
  'data',
  'writing',
  'automation',
  'research',
  'devops',
  'testing',
  'other'
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];
```

**Step 4: Create packages/shared/src/index.ts**

```typescript
export * from './types';
```

**Step 5: Install and commit**

Run: `pnpm install`

```bash
git add -A
git commit -m "feat: add shared types package"
```

---

### Task 3: Create API Package Structure

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/wrangler.toml`
- Create: `apps/api/src/index.ts`

**Step 1: Create apps/api/package.json**

```json
{
  "name": "@agentskills/api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "build": "wrangler deploy --dry-run",
    "deploy": "wrangler deploy",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "wrangler d1 migrations apply agentskills-db --local",
    "db:migrate:prod": "wrangler d1 migrations apply agentskills-db --remote"
  },
  "dependencies": {
    "@agentskills/shared": "workspace:*",
    "hono": "^4.6.0",
    "drizzle-orm": "^0.38.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250109.0",
    "drizzle-kit": "^0.30.0",
    "typescript": "^5.7.0",
    "wrangler": "^3.99.0"
  }
}
```

**Step 2: Create apps/api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**Step 3: Create apps/api/wrangler.toml**

```toml
name = "agentskills-api"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "agentskills-db"
database_id = "local" # Replace with actual ID after creation

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "agentskills-skills"

[vars]
ENVIRONMENT = "development"

# Google OAuth - set in .dev.vars for local, dashboard for prod
# GOOGLE_CLIENT_ID = ""
# GOOGLE_CLIENT_SECRET = ""
# SESSION_SECRET = ""
```

**Step 4: Create apps/api/src/index.ts**

```typescript
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
```

**Step 5: Install dependencies**

Run: `cd apps/api && pnpm install`

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add API package with Hono setup"
```

---

### Task 4: Create Frontend Package Structure

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/index.css`
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`

**Step 1: Create apps/web/package.json**

```json
{
  "name": "@agentskills/web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@agentskills/shared": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "wouter": "^3.3.5",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

**Step 2: Create apps/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**Step 3: Create apps/web/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
```

**Step 4: Create apps/web/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agent Skills Marketplace</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create apps/web/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

body {
  @apply bg-background text-foreground antialiased;
}
```

**Step 6: Create apps/web/tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
```

**Step 7: Create apps/web/postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 8: Create apps/web/src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 9: Create apps/web/src/App.tsx**

```tsx
import { Route, Switch } from 'wouter';

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Agent Skills Marketplace</h1>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-2xl">404 - Page Not Found</h1>
        </div>
      </Route>
    </Switch>
  );
}
```

**Step 10: Install dependencies**

Run: `cd apps/web && pnpm install`

**Step 11: Test dev server**

Run: `pnpm dev`
Expected: Opens http://localhost:5173 with "Agent Skills Marketplace" heading

**Step 12: Commit**

```bash
git add -A
git commit -m "feat: add React frontend with Vite and Tailwind"
```

---

## Phase 2: Database Schema

### Task 5: Create Drizzle Schema

**Files:**
- Create: `apps/api/src/db/schema.ts`
- Create: `apps/api/drizzle.config.ts`

**Step 1: Create apps/api/src/db/schema.ts**

```typescript
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  author: text('author').notNull(),
  githubUrl: text('github_url').notNull().unique(),
  starsCount: integer('stars_count').notNull().default(0),
  category: text('category').notNull(),
  r2FileKey: text('r2_file_key').notNull(),
  fileSize: integer('file_size').notNull(),
  downloadCount: integer('download_count').notNull().default(0),
  avgRating: real('avg_rating').notNull().default(0),
  ratingCount: integer('rating_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => ({
  userSkillUnique: unique().on(table.userId, table.skillId),
}));

export const ratings = sqliteTable('ratings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => ({
  userSkillUnique: unique().on(table.userId, table.skillId),
}));

export const downloads = sqliteTable('downloads', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

// Type exports for use in routes
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Download = typeof downloads.$inferSelect;
```

**Step 2: Create apps/api/drizzle.config.ts**

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
});
```

**Step 3: Generate migrations**

Run: `cd apps/api && pnpm db:generate`
Expected: Creates `apps/api/migrations/` folder with SQL migration file

**Step 4: Create D1 database locally**

Run: `cd apps/api && wrangler d1 create agentskills-db`
Expected: Returns database ID - update wrangler.toml with this ID

**Step 5: Run migrations locally**

Run: `cd apps/api && pnpm db:migrate`
Expected: Creates tables in local D1

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Drizzle schema and migrations"
```

---

### Task 6: Create Database Utilities

**Files:**
- Create: `apps/api/src/db/index.ts`
- Create: `apps/api/src/lib/utils.ts`

**Step 1: Create apps/api/src/db/index.ts**

```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;

export * from './schema';
```

**Step 2: Create apps/api/src/lib/utils.ts**

```typescript
export function generateId(): string {
  return crypto.randomUUID();
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// 7 days in milliseconds
export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export function createSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DURATION);
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add database utilities"
```

---

## Phase 3: API Routes

### Task 7: Create Skills Routes

**Files:**
- Create: `apps/api/src/routes/skills.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: Create apps/api/src/routes/skills.ts**

```typescript
import { Hono } from 'hono';
import { eq, like, desc, asc, sql, and } from 'drizzle-orm';
import { createDb, skills } from '../db';
import type { ApiResponse, PaginatedResponse, Skill } from '@agentskills/shared';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

const skillsRouter = new Hono<{ Bindings: Bindings }>();

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

  // Generate signed URL for R2 object
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

// Get categories
skillsRouter.get('/meta/categories', async (c) => {
  const db = createDb(c.env.DB);

  const categories = await db.selectDistinct({ category: skills.category })
    .from(skills);

  return c.json<ApiResponse<string[]>>({
    data: categories.map(c => c.category),
    error: null
  });
});

export { skillsRouter };
```

**Step 2: Update apps/api/src/index.ts**

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { skillsRouter } from './routes/skills';

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

// Routes
app.route('/api/skills', skillsRouter);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Categories endpoint (alias for convenience)
app.get('/api/categories', async (c) => {
  const db = await import('./db').then(m => m.createDb(c.env.DB));
  const { skills } = await import('./db');

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
```

**Step 3: Test API locally**

Run: `cd apps/api && pnpm dev`
Then: `curl http://localhost:8787/api/health`
Expected: `{"status":"ok","timestamp":...}`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add skills API routes"
```

---

### Task 8: Create Auth Routes

**Files:**
- Create: `apps/api/src/routes/auth.ts`
- Create: `apps/api/src/middleware/auth.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: Create apps/api/src/routes/auth.ts**

```typescript
import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { createDb, users, sessions } from '../db';
import { generateId, generateSessionToken, createSessionExpiry } from '../lib/utils';
import type { ApiResponse, User } from '@agentskills/shared';

type Bindings = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  ENVIRONMENT: string;
};

type Variables = {
  user?: User;
};

const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

function getRedirectUri(c: any): string {
  const host = c.req.header('host') || 'localhost:8787';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/api/auth/callback`;
}

function getFrontendUrl(c: any): string {
  const host = c.req.header('host') || 'localhost:8787';
  if (host.includes('localhost')) {
    return 'http://localhost:5173';
  }
  return 'https://agentskills.pages.dev';
}

// Initiate Google OAuth
authRouter.get('/google', async (c) => {
  const redirectUri = getRedirectUri(c);

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return c.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

// Google OAuth callback
authRouter.get('/callback', async (c) => {
  const code = c.req.query('code');
  const error = c.req.query('error');
  const frontendUrl = getFrontendUrl(c);

  if (error || !code) {
    return c.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri(c),
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return c.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json() as { access_token: string };

    // Fetch user info
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return c.redirect(`${frontendUrl}/login?error=userinfo_failed`);
    }

    const googleUser = await userInfoResponse.json() as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    const db = createDb(c.env.DB);

    // Upsert user
    let user = await db.select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .get();

    const now = Date.now();

    if (!user) {
      user = {
        id: generateId(),
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
      await db.insert(users).values(user);
    } else {
      await db.update(users)
        .set({
          name: googleUser.name,
          avatarUrl: googleUser.picture,
          updatedAt: new Date(now),
        })
        .where(eq(users.id, user.id));
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = createSessionExpiry();

    await db.insert(sessions).values({
      id: sessionToken,
      userId: user.id,
      expiresAt,
      createdAt: new Date(now),
    });

    // Set session cookie
    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: !c.req.header('host')?.includes('localhost'),
      sameSite: 'Lax',
      path: '/',
      expires: expiresAt,
    });

    return c.redirect(frontendUrl);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return c.redirect(`${frontendUrl}/login?error=unknown`);
  }
});

// Get current user
authRouter.get('/me', async (c) => {
  const sessionToken = getCookie(c, 'session');

  if (!sessionToken) {
    return c.json<ApiResponse<null>>({ data: null, error: null });
  }

  const db = createDb(c.env.DB);

  const session = await db.select()
    .from(sessions)
    .where(eq(sessions.id, sessionToken))
    .get();

  if (!session || session.expiresAt < new Date()) {
    deleteCookie(c, 'session');
    return c.json<ApiResponse<null>>({ data: null, error: null });
  }

  const user = await db.select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user) {
    deleteCookie(c, 'session');
    return c.json<ApiResponse<null>>({ data: null, error: null });
  }

  return c.json<ApiResponse<User>>({ data: user, error: null });
});

// Logout
authRouter.post('/logout', async (c) => {
  const sessionToken = getCookie(c, 'session');

  if (sessionToken) {
    const db = createDb(c.env.DB);
    await db.delete(sessions).where(eq(sessions.id, sessionToken));
    deleteCookie(c, 'session');
  }

  return c.json<ApiResponse<{ success: boolean }>>({ data: { success: true }, error: null });
});

export { authRouter };
```

**Step 2: Create apps/api/src/middleware/auth.ts**

```typescript
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
```

**Step 3: Update apps/api/src/index.ts to add auth routes**

Add this import and route:

```typescript
import { authRouter } from './routes/auth';

// Add after skillsRouter route
app.route('/api/auth', authRouter);
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Google OAuth authentication"
```

---

### Task 9: Create Favorites Routes

**Files:**
- Create: `apps/api/src/routes/favorites.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: Create apps/api/src/routes/favorites.ts**

```typescript
import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { createDb, favorites, skills, type User } from '../db';
import { requireAuth } from '../middleware/auth';
import { generateId } from '../lib/utils';
import type { ApiResponse, Skill } from '@agentskills/shared';

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
```

**Step 2: Update apps/api/src/index.ts**

Add import and route:

```typescript
import { favoritesRouter } from './routes/favorites';

app.route('/api/favorites', favoritesRouter);
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add favorites API routes"
```

---

### Task 10: Create Ratings Routes

**Files:**
- Create: `apps/api/src/routes/ratings.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: Create apps/api/src/routes/ratings.ts**

```typescript
import { Hono } from 'hono';
import { eq, and, avg, count } from 'drizzle-orm';
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

  return c.json<ApiResponse<typeof userRatings>>({
    data: userRatings,
    error: null,
  });
});

// Rate a skill (create or update)
ratingsRouter.post('/:skillId', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');
  const skillId = c.req.param('skillId');

  const body = await c.req.json<{ score: number }>();
  const score = body.score;

  // Validate score
  if (!score || score < 1 || score > 5 || !Number.isInteger(score)) {
    return c.json<ApiResponse<null>>({
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
    return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
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

  if (existing) {
    // Update existing rating
    await db.update(ratings)
      .set({ score, updatedAt: new Date(now) })
      .where(eq(ratings.id, existing.id));
  } else {
    // Create new rating
    await db.insert(ratings).values({
      id: generateId(),
      userId: user.id,
      skillId,
      score,
    });
  }

  // Recalculate average rating for skill
  const stats = await db.select({
    avgRating: avg(ratings.score),
    ratingCount: count(ratings.id),
  })
    .from(ratings)
    .where(eq(ratings.skillId, skillId))
    .get();

  const avgRating = stats?.avgRating ? Number(stats.avgRating) : 0;
  const ratingCount = stats?.ratingCount || 0;

  await db.update(skills)
    .set({ avgRating, ratingCount, updatedAt: new Date(now) })
    .where(eq(skills.id, skillId));

  return c.json<ApiResponse<{ rating: number; avgRating: number; ratingCount: number }>>({
    data: { rating: score, avgRating, ratingCount },
    error: null,
  });
});

// Update rating (same as post, just for REST semantics)
ratingsRouter.put('/:skillId', async (c) => {
  // Delegate to POST handler
  return ratingsRouter.fetch(
    new Request(c.req.url, { ...c.req.raw, method: 'POST' }),
    c.env
  );
});

export { ratingsRouter };
```

**Step 2: Update apps/api/src/index.ts**

Add import and route:

```typescript
import { ratingsRouter } from './routes/ratings';

app.route('/api/ratings', ratingsRouter);
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ratings API routes"
```

---

## Phase 4: Frontend Components

### Task 11: Create UI Utilities and Base Components

**Files:**
- Create: `apps/web/src/lib/utils.ts`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/components/ui/button.tsx`
- Create: `apps/web/src/components/ui/card.tsx`
- Create: `apps/web/src/components/ui/input.tsx`
- Create: `apps/web/src/components/ui/badge.tsx`

**Step 1: Create apps/web/src/lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 2: Create apps/web/src/lib/api.ts**

```typescript
import type { ApiResponse, PaginatedResponse, Skill, SkillsQueryParams, User } from '@agentskills/shared';

const API_BASE = '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export async function getCurrentUser(): Promise<User | null> {
  const response = await fetchApi<ApiResponse<User>>('/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  await fetchApi('/auth/logout', { method: 'POST' });
}

// Skills
export async function getSkills(params?: SkillsQueryParams): Promise<PaginatedResponse<Skill>> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const query = searchParams.toString();
  return fetchApi<PaginatedResponse<Skill>>(`/skills${query ? `?${query}` : ''}`);
}

export async function getSkill(id: string): Promise<Skill | null> {
  const response = await fetchApi<ApiResponse<Skill>>(`/skills/${id}`);
  return response.data;
}

export async function getCategories(): Promise<string[]> {
  const response = await fetchApi<ApiResponse<string[]>>('/categories');
  return response.data || [];
}

export function getDownloadUrl(skillId: string): string {
  return `${API_BASE}/skills/${skillId}/download`;
}

// Favorites
export async function getFavorites(): Promise<Skill[]> {
  const response = await fetchApi<ApiResponse<Skill[]>>('/favorites');
  return response.data || [];
}

export async function addFavorite(skillId: string): Promise<boolean> {
  const response = await fetchApi<ApiResponse<{ favorited: boolean }>>(`/favorites/${skillId}`, {
    method: 'POST',
  });
  return response.data?.favorited || false;
}

export async function removeFavorite(skillId: string): Promise<boolean> {
  const response = await fetchApi<ApiResponse<{ favorited: boolean }>>(`/favorites/${skillId}`, {
    method: 'DELETE',
  });
  return !response.data?.favorited;
}

// Ratings
export async function rateSkill(skillId: string, score: number): Promise<{ avgRating: number; ratingCount: number }> {
  const response = await fetchApi<ApiResponse<{ rating: number; avgRating: number; ratingCount: number }>>(
    `/ratings/${skillId}`,
    {
      method: 'POST',
      body: JSON.stringify({ score }),
    }
  );
  return { avgRating: response.data?.avgRating || 0, ratingCount: response.data?.ratingCount || 0 };
}
```

**Step 3: Create apps/web/src/components/ui/button.tsx**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-border bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
```

**Step 4: Create apps/web/src/components/ui/card.tsx**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-background shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

**Step 5: Create apps/web/src/components/ui/input.tsx**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

**Step 6: Create apps/web/src/components/ui/badge.tsx**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'border border-border text-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add UI utilities and base components"
```

---

### Task 12: Create Auth Context and Layout

**Files:**
- Create: `apps/web/src/context/auth.tsx`
- Create: `apps/web/src/components/layout/Header.tsx`
- Create: `apps/web/src/components/layout/Layout.tsx`

**Step 1: Create apps/web/src/context/auth.tsx**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@agentskills/shared';
import { getCurrentUser, logout as apiLogout } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = () => {
    window.location.href = '/api/auth/google';
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Step 2: Create apps/web/src/components/layout/Header.tsx**

```tsx
import { Link } from 'wouter';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, loading, login, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="text-xl font-bold">Agent Skills</a>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/skills">
              <a className="text-sm text-muted-foreground hover:text-foreground">Browse</a>
            </Link>
            {user && (
              <Link href="/favorites">
                <a className="text-sm text-muted-foreground hover:text-foreground">Favorites</a>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm hidden sm:inline">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={login}>Sign in with Google</Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

**Step 3: Create apps/web/src/components/layout/Layout.tsx**

```tsx
import type { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Agent Skills Marketplace
        </div>
      </footer>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add auth context and layout components"
```

---

### Task 13: Create Skill Components

**Files:**
- Create: `apps/web/src/components/skills/SkillCard.tsx`
- Create: `apps/web/src/components/skills/SkillList.tsx`
- Create: `apps/web/src/components/skills/RatingWidget.tsx`
- Create: `apps/web/src/components/skills/FavoriteButton.tsx`
- Create: `apps/web/src/components/skills/SearchBar.tsx`
- Create: `apps/web/src/components/skills/CategoryFilter.tsx`

**Step 1: Create apps/web/src/components/skills/RatingWidget.tsx**

```tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RatingWidgetProps {
  rating: number;
  count?: number;
  userRating?: number;
  onRate?: (score: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

export function RatingWidget({
  rating,
  count,
  userRating,
  onRate,
  readonly = false,
  size = 'md'
}: RatingWidgetProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || userRating || rating;
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              'transition-colors',
              !readonly && 'cursor-pointer hover:scale-110'
            )}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => onRate?.(star)}
          >
            <svg
              className={cn(
                starSize,
                star <= displayRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-muted-foreground ml-1">
          ({count})
        </span>
      )}
    </div>
  );
}
```

**Step 2: Create apps/web/src/components/skills/FavoriteButton.tsx**

```tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth';
import { addFavorite, removeFavorite } from '@/lib/api';

interface FavoriteButtonProps {
  skillId: string;
  isFavorited?: boolean;
  onToggle?: (favorited: boolean) => void;
}

export function FavoriteButton({ skillId, isFavorited = false, onToggle }: FavoriteButtonProps) {
  const { user, login } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      login();
      return;
    }

    setLoading(true);
    try {
      if (favorited) {
        await removeFavorite(skillId);
        setFavorited(false);
        onToggle?.(false);
      } else {
        await addFavorite(skillId);
        setFavorited(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'p-2 rounded-full transition-colors',
        favorited ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
```

**Step 3: Create apps/web/src/components/skills/SkillCard.tsx**

```tsx
import { Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingWidget } from './RatingWidget';
import { FavoriteButton } from './FavoriteButton';

interface SkillCardProps {
  skill: Skill;
  isFavorited?: boolean;
}

export function SkillCard({ skill, isFavorited }: SkillCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link href={`/skills/${skill.id}`}>
            <a className="hover:underline">
              <CardTitle className="text-lg line-clamp-1">{skill.name}</CardTitle>
            </a>
          </Link>
          <FavoriteButton skillId={skill.id} isFavorited={isFavorited} />
        </div>
        <p className="text-sm text-muted-foreground">by {skill.author}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{skill.category}</Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {skill.starsCount}
          </span>
        </div>
        <RatingWidget rating={skill.avgRating} count={skill.ratingCount} readonly size="sm" />
      </CardFooter>
    </Card>
  );
}
```

**Step 4: Create apps/web/src/components/skills/SkillList.tsx**

```tsx
import type { Skill } from '@agentskills/shared';
import { SkillCard } from './SkillCard';

interface SkillListProps {
  skills: Skill[];
  loading?: boolean;
  favoriteIds?: Set<string>;
}

export function SkillList({ skills, loading, favoriteIds = new Set() }: SkillListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No skills found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          isFavorited={favoriteIds.has(skill.id)}
        />
      ))}
    </div>
  );
}
```

**Step 5: Create apps/web/src/components/skills/SearchBar.tsx**

```tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search skills...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
```

**Step 6: Create apps/web/src/components/skills/CategoryFilter.tsx**

```tsx
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'px-3 py-1.5 text-sm rounded-full transition-colors',
          selected === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-full transition-colors capitalize',
            selected === category
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add skill components"
```

---

### Task 14: Create Pages

**Files:**
- Create: `apps/web/src/pages/HomePage.tsx`
- Create: `apps/web/src/pages/SkillsPage.tsx`
- Create: `apps/web/src/pages/SkillDetailPage.tsx`
- Create: `apps/web/src/pages/FavoritesPage.tsx`
- Create: `apps/web/src/pages/LoginPage.tsx`
- Modify: `apps/web/src/App.tsx`

**Step 1: Create apps/web/src/pages/HomePage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getSkills } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';

export function HomePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkills({ limit: 6, sort: 'stars' })
      .then((response) => setSkills(response.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Agent Skills Marketplace</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover, download, and rate skills for your AI coding assistant.
          Built by the community, for the community.
        </p>
        <Link href="/skills">
          <Button size="lg">Browse All Skills</Button>
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Top Skills</h2>
          <Link href="/skills">
            <a className="text-sm text-muted-foreground hover:text-foreground">
              View all →
            </a>
          </Link>
        </div>
        <SkillList skills={skills} loading={loading} />
      </section>
    </div>
  );
}
```

**Step 2: Create apps/web/src/pages/SkillsPage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useSearch } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getSkills, getCategories, getFavorites } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { SkillList } from '@/components/skills/SkillList';
import { SearchBar } from '@/components/skills/SearchBar';
import { CategoryFilter } from '@/components/skills/CategoryFilter';
import { Button } from '@/components/ui/button';

type SortOption = 'stars' | 'rating' | 'downloads';

export function SkillsPage() {
  const { user } = useAuth();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState<string | null>(params.get('category'));
  const [sort, setSort] = useState<SortOption>((params.get('sort') as SortOption) || 'stars');
  const [offset, setOffset] = useState(0);
  const limit = 12;

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      getFavorites()
        .then((favs) => setFavoriteIds(new Set(favs.map((s) => s.id))))
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    getSkills({
      q: query || undefined,
      category: category || undefined,
      sort,
      limit,
      offset,
    })
      .then((response) => {
        setSkills(response.data);
        setTotal(response.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, category, sort, offset]);

  const hasMore = offset + limit < total;
  const hasPrev = offset > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Skills</h1>

      <div className="space-y-4 mb-8">
        <SearchBar value={query} onChange={(v) => { setQuery(v); setOffset(0); }} />
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={(c) => { setCategory(c); setOffset(0); }}
        />
        <div className="flex gap-2">
          {(['stars', 'rating', 'downloads'] as const).map((s) => (
            <Button
              key={s}
              variant={sort === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSort(s); setOffset(0); }}
            >
              {s === 'stars' ? 'GitHub Stars' : s === 'rating' ? 'Rating' : 'Downloads'}
            </Button>
          ))}
        </div>
      </div>

      <SkillList skills={skills} loading={loading} favoriteIds={favoriteIds} />

      {(hasPrev || hasMore) && (
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={!hasPrev}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={!hasMore}
            onClick={() => setOffset(offset + limit)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create apps/web/src/pages/SkillDetailPage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getSkill, getDownloadUrl, rateSkill } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingWidget } from '@/components/skills/RatingWidget';
import { FavoriteButton } from '@/components/skills/FavoriteButton';

export function SkillDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, login } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | undefined>();

  useEffect(() => {
    if (params.id) {
      getSkill(params.id)
        .then(setSkill)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleRate = async (score: number) => {
    if (!user) {
      login();
      return;
    }
    if (!skill) return;

    try {
      const result = await rateSkill(skill.id, score);
      setUserRating(score);
      setSkill({
        ...skill,
        avgRating: result.avgRating,
        ratingCount: result.ratingCount,
      });
    } catch (error) {
      console.error('Failed to rate:', error);
    }
  };

  const handleDownload = () => {
    if (skill) {
      window.location.href = getDownloadUrl(skill.id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Skill Not Found</h1>
        <Link href="/skills">
          <Button>Back to Skills</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/skills">
        <a className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← Back to Skills
        </a>
      </Link>

      <div className="bg-background border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
            <p className="text-muted-foreground">by {skill.author}</p>
          </div>
          <FavoriteButton skillId={skill.id} />
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Badge variant="secondary" className="capitalize">{skill.category}</Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {skill.starsCount} GitHub Stars
          </span>
          <span className="text-sm text-muted-foreground">
            {skill.downloadCount} downloads
          </span>
          <span className="text-sm text-muted-foreground">
            {(skill.fileSize / 1024).toFixed(1)} KB
          </span>
        </div>

        <p className="text-lg mb-6">{skill.description}</p>

        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Rating</p>
            <RatingWidget
              rating={skill.avgRating}
              count={skill.ratingCount}
              userRating={userRating}
              onRate={handleRate}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button size="lg" onClick={handleDownload}>
            Download Skill
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={skill.githubUrl} target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Create apps/web/src/pages/FavoritesPage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getFavorites } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { SkillList } from '@/components/skills/SkillList';

export function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getFavorites()
        .then(setSkills)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>
      <SkillList
        skills={skills}
        loading={loading}
        favoriteIds={new Set(skills.map((s) => s.id))}
      />
    </div>
  );
}
```

**Step 5: Create apps/web/src/pages/LoginPage.tsx**

```tsx
import { Redirect } from 'wouter';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';

export function LoginPage() {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-32 w-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to save favorites and rate skills
        </p>
        <Button size="lg" onClick={login}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
```

**Step 6: Update apps/web/src/App.tsx**

```tsx
import { Route, Switch } from 'wouter';
import { AuthProvider } from '@/context/auth';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { SkillsPage } from '@/pages/SkillsPage';
import { SkillDetailPage } from '@/pages/SkillDetailPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { LoginPage } from '@/pages/LoginPage';

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/skills" component={SkillsPage} />
          <Route path="/skills/:id" component={SkillDetailPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/login" component={LoginPage} />
          <Route>
            <div className="min-h-[60vh] flex items-center justify-center">
              <h1 className="text-2xl">404 - Page Not Found</h1>
            </div>
          </Route>
        </Switch>
      </Layout>
    </AuthProvider>
  );
}
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add all pages and wire up routing"
```

---

## Phase 5: Seed Data & Deployment

### Task 15: Create Seed Script

**Files:**
- Create: `apps/api/src/scripts/seed.ts`

**Step 1: Create apps/api/src/scripts/seed.ts**

```typescript
// Run with: wrangler d1 execute agentskills-db --local --file=./seed.sql

const SEED_SKILLS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Code Review Assistant',
    description: 'Automated code review with best practices suggestions, security checks, and performance tips.',
    author: 'anthropic',
    github_url: 'https://github.com/anthropics/code-review-skill',
    stars_count: 1250,
    category: 'coding',
    r2_file_key: 'skills/code-review-assistant/skill.zip',
    file_size: 15360,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Data Analysis Pro',
    description: 'Advanced data analysis skill with pandas, SQL generation, and visualization helpers.',
    author: 'datacraft',
    github_url: 'https://github.com/datacraft/analysis-skill',
    stars_count: 890,
    category: 'data',
    r2_file_key: 'skills/data-analysis-pro/skill.zip',
    file_size: 28672,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Technical Writer',
    description: 'Generate clear documentation, README files, and API docs from code.',
    author: 'docsmith',
    github_url: 'https://github.com/docsmith/tech-writer-skill',
    stars_count: 654,
    category: 'writing',
    r2_file_key: 'skills/technical-writer/skill.zip',
    file_size: 12288,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Test Generator',
    description: 'Automatically generate unit tests, integration tests, and test fixtures.',
    author: 'testcraft',
    github_url: 'https://github.com/testcraft/test-gen-skill',
    stars_count: 1100,
    category: 'testing',
    r2_file_key: 'skills/test-generator/skill.zip',
    file_size: 20480,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'CI/CD Pipeline Builder',
    description: 'Generate GitHub Actions, GitLab CI, and other CI/CD configurations.',
    author: 'devopstools',
    github_url: 'https://github.com/devopstools/cicd-skill',
    stars_count: 780,
    category: 'devops',
    r2_file_key: 'skills/cicd-builder/skill.zip',
    file_size: 18432,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'API Client Generator',
    description: 'Generate typed API clients from OpenAPI specs in multiple languages.',
    author: 'apitools',
    github_url: 'https://github.com/apitools/client-gen-skill',
    stars_count: 920,
    category: 'coding',
    r2_file_key: 'skills/api-client-gen/skill.zip',
    file_size: 25600,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'SQL Query Optimizer',
    description: 'Analyze and optimize SQL queries for better performance.',
    author: 'dbpro',
    github_url: 'https://github.com/dbpro/sql-optimizer-skill',
    stars_count: 567,
    category: 'data',
    r2_file_key: 'skills/sql-optimizer/skill.zip',
    file_size: 14336,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Git Workflow Helper',
    description: 'Assist with git operations, conflict resolution, and branch management.',
    author: 'gittools',
    github_url: 'https://github.com/gittools/workflow-skill',
    stars_count: 445,
    category: 'devops',
    r2_file_key: 'skills/git-workflow/skill.zip',
    file_size: 10240,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Research Assistant',
    description: 'Help with technical research, summarizing papers, and finding relevant resources.',
    author: 'researchai',
    github_url: 'https://github.com/researchai/research-skill',
    stars_count: 678,
    category: 'research',
    r2_file_key: 'skills/research-assistant/skill.zip',
    file_size: 16384,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Automation Scripts',
    description: 'Generate shell scripts, batch files, and automation workflows.',
    author: 'automate',
    github_url: 'https://github.com/automate/scripts-skill',
    stars_count: 523,
    category: 'automation',
    r2_file_key: 'skills/automation-scripts/skill.zip',
    file_size: 8192,
  },
];

// Generate SQL insert statements
const now = Date.now();
const insertStatements = SEED_SKILLS.map((skill) => `
INSERT INTO skills (id, name, description, author, github_url, stars_count, category, r2_file_key, file_size, download_count, avg_rating, rating_count, created_at, updated_at)
VALUES (
  '${skill.id}',
  '${skill.name.replace(/'/g, "''")}',
  '${skill.description.replace(/'/g, "''")}',
  '${skill.author}',
  '${skill.github_url}',
  ${skill.stars_count},
  '${skill.category}',
  '${skill.r2_file_key}',
  ${skill.file_size},
  0,
  0,
  0,
  ${now},
  ${now}
);
`).join('\n');

console.log(insertStatements);
```

**Step 2: Create seed.sql file**

Run: `cd apps/api && npx tsx src/scripts/seed.ts > seed.sql`

**Step 3: Run seed**

Run: `cd apps/api && wrangler d1 execute agentskills-db --local --file=./seed.sql`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add seed script with sample skills"
```

---

### Task 16: Configure Cloudflare Deployment

**Files:**
- Create: `apps/web/wrangler.toml` (for Pages config, optional)
- Create: `apps/api/.dev.vars.example`

**Step 1: Create apps/api/.dev.vars.example**

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=generate-a-random-32-char-string
```

**Step 2: Set up Google OAuth credentials**

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - http://localhost:8787/api/auth/callback (development)
   - https://agentskills-api.<your-subdomain>.workers.dev/api/auth/callback (production)
6. Copy Client ID and Secret to `.dev.vars`

**Step 3: Create R2 bucket**

Run: `wrangler r2 bucket create agentskills-skills`

**Step 4: Update wrangler.toml with real D1 database ID**

After running `wrangler d1 create agentskills-db`, update the database_id in wrangler.toml.

**Step 5: Deploy API to Cloudflare Workers**

Run: `cd apps/api && wrangler deploy`

**Step 6: Set production secrets**

Run:
```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put SESSION_SECRET
```

**Step 7: Deploy frontend to Cloudflare Pages**

Run: `cd apps/web && pnpm build`

Then connect repo to Cloudflare Pages:
1. Go to Cloudflare Dashboard → Pages
2. Create project → Connect to Git
3. Select repository
4. Build settings:
   - Build command: `cd apps/web && pnpm install && pnpm build`
   - Build output directory: `apps/web/dist`

**Step 8: Commit**

```bash
git add -A
git commit -m "docs: add deployment configuration"
```

---

## Summary

This implementation plan covers:

1. **Project Setup** (Tasks 1-4): Monorepo with pnpm workspaces, shared types, API and web packages
2. **Database** (Tasks 5-6): Drizzle schema with all tables, migrations, utilities
3. **API Routes** (Tasks 7-10): Skills, auth, favorites, ratings endpoints
4. **Frontend** (Tasks 11-14): UI components, auth context, pages with routing
5. **Deployment** (Tasks 15-16): Seed data, Cloudflare configuration

Each task is broken into 2-5 minute steps with exact file paths, complete code, and commit checkpoints.
