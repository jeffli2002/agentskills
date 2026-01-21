# MVP First Slice Design

**Date:** 2026-01-21
**Status:** Approved
**Scope:** End-to-end working slice of Agent Skills Marketplace

---

## Overview

This design covers the first working version of the Agent Skills Marketplace: a minimal but complete flow where users can browse curated skills, download them, and interact through favorites and ratings.

### Goals

- Prove the concept works end-to-end
- Deploy to production (Cloudflare)
- Enable user authentication and basic interactions
- Keep scope minimal for fast iteration

### Non-Goals (Deferred)

- GitHub scraping automation
- Written reviews
- Creator profiles and dashboards
- Enterprise features
- Payment/monetization

---

## Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, shadcn/ui, Wouter |
| API | Hono on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite-compatible) |
| ORM | Drizzle ORM |
| File Storage | Cloudflare R2 |
| Auth | Google OAuth |
| Deployment | Cloudflare Pages + Workers |

### Project Structure

```
agentskills/
├── apps/
│   ├── web/                 # React frontend (Cloudflare Pages)
│   │   ├── src/
│   │   │   ├── components/  # shadcn/ui + custom components
│   │   │   ├── pages/       # Route components
│   │   │   ├── lib/         # Utilities, API client
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   └── vite.config.ts
│   │
│   └── api/                 # Cloudflare Workers API
│       ├── src/
│       │   ├── routes/      # API route handlers
│       │   ├── db/          # Drizzle schema + migrations
│       │   ├── auth/        # Google OAuth logic
│       │   └── index.ts     # Hono app entry point
│       └── wrangler.toml    # Cloudflare config
│
├── packages/
│   └── shared/              # Shared types, validation schemas
│
├── drizzle.config.ts
├── pnpm-workspace.yaml
└── package.json
```

### Request Flow

```
Browser → Cloudflare Pages (static React app)
       → Cloudflare Workers API (/api/*)
       → Cloudflare D1 (SQLite)
       → Cloudflare R2 (file downloads)
```

---

## Database Schema

### Tables

```sql
-- users: authenticated via Google OAuth
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- sessions: auth session storage
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- skills: curated list of agent skills
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  github_url TEXT UNIQUE NOT NULL,
  stars_count INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  r2_file_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  download_count INTEGER DEFAULT 0,
  avg_rating REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- favorites: users saving skills
CREATE TABLE favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  skill_id TEXT NOT NULL REFERENCES skills(id),
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, skill_id)
);

-- ratings: 1-5 star ratings
CREATE TABLE ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  skill_id TEXT NOT NULL REFERENCES skills(id),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, skill_id)
);

-- downloads: track skill downloads
CREATE TABLE downloads (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  skill_id TEXT NOT NULL REFERENCES skills(id),
  created_at INTEGER NOT NULL
);
```

### Notes

- Text IDs (UUIDs) for portability when migrating to PostgreSQL
- Unix timestamps as integers (D1 lacks native datetime)
- `stars_count` is GitHub stars, separate from user ratings
- `avg_rating` and `rating_count` denormalized for quick display
- One rating per user per skill (update, not add multiple)

---

## API Routes

### Base URL: `/api`

#### Public Routes

```
GET  /api/skills              # List skills (search, filter, sort)
GET  /api/skills/:id          # Get single skill details
GET  /api/skills/:id/download # Download skill file (tracks download)
GET  /api/categories          # List available categories
```

#### Auth Routes

```
GET  /api/auth/google         # Initiate Google OAuth
GET  /api/auth/callback       # Google OAuth callback
GET  /api/auth/me             # Get current user
POST /api/auth/logout         # Clear session
```

#### Protected Routes

```
GET    /api/favorites           # List user's favorites
POST   /api/favorites/:skillId  # Add to favorites
DELETE /api/favorites/:skillId  # Remove from favorites

GET  /api/ratings             # List user's ratings
POST /api/ratings/:skillId    # Rate a skill (1-5)
PUT  /api/ratings/:skillId    # Update rating
```

### Query Parameters for `/api/skills`

- `?q=search` - Search by name/description
- `?category=coding` - Filter by category
- `?sort=stars|rating|downloads` - Sort order
- `?limit=20&offset=0` - Pagination

### Response Format

```json
{
  "data": { ... },
  "error": null
}
```

---

## Frontend

### Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Home - featured skills, search, categories | No |
| `/skills` | Browse all skills with filters | No |
| `/skills/:id` | Skill detail page | No |
| `/favorites` | User's saved skills | Yes |
| `/login` | Login with Google OAuth | No |

### Components

```
components/
├── layout/
│   ├── Header        # Logo, search, nav, auth button
│   └── Footer        # Links, copyright
│
├── skills/
│   ├── SkillCard     # Card: name, author, stars, rating, category
│   ├── SkillList     # Grid of SkillCards
│   ├── SkillDetail   # Full info, download button, rating widget
│   ├── SearchBar     # Search input with debounce
│   └── CategoryFilter # Category pills/dropdown
│
├── user/
│   ├── FavoriteButton  # Heart icon toggle
│   ├── RatingWidget    # 5-star clickable rating
│   └── UserMenu        # Avatar dropdown
│
└── ui/               # shadcn/ui components
```

### State Management

- React Context for auth state (current user)
- URL search params for filters/search (shareable)
- Local state for UI interactions

---

## Authentication Flow

```
1. User clicks "Sign in with Google"
2. Frontend redirects to /api/auth/google
3. API redirects to Google OAuth consent screen
4. User grants permission
5. Google redirects to /api/auth/callback?code=xxx
6. API exchanges code for tokens, fetches profile
7. API upserts user in D1
8. API creates session, sets HTTP-only cookie
9. API redirects to frontend
10. Frontend calls /api/auth/me for user data
```

### Security

- HTTPS only (Cloudflare provides)
- HTTP-only cookies (not JS accessible)
- Session expiry (7 days)
- SameSite cookie attribute for CSRF protection

---

## Key Feature Flows

### Download Flow

1. User clicks "Download" on skill page
2. Frontend calls `GET /api/skills/:id/download`
3. API logs download (with user_id if logged in)
4. API increments `skill.download_count`
5. API generates signed R2 URL (5 min expiry)
6. API returns `{ url: "https://..." }`
7. Frontend triggers browser download

### Favorite Flow

1. User clicks heart icon (must be logged in)
2. Frontend calls `POST /api/favorites/:skillId`
3. API verifies session, inserts/deletes favorite
4. API returns `{ favorited: true/false }`
5. Frontend updates heart icon

### Rating Flow

1. User clicks star 1-5 (must be logged in)
2. Frontend calls `POST /api/ratings/:skillId { score: 4 }`
3. API upserts rating
4. API recalculates skill's avg_rating
5. API returns `{ rating: 4, avgRating: 4.2 }`
6. Frontend updates display

---

## R2 Storage

### Bucket Structure

```
skills-bucket/
├── skills/
│   ├── {skill-id}/
│   │   ├── skill.zip        # Full skill package
│   │   └── metadata.json    # Cached GitHub metadata
```

### Initial Setup

For the 10-20 curated skills, manually upload zip files to R2 and seed the database with corresponding records.

---

## Cloudflare Free Tier Limits

| Service | Free Limit | Notes |
|---------|------------|-------|
| Workers | 100K requests/day | Plenty for MVP |
| D1 | 5M reads/day, 100K writes/day | Plenty for MVP |
| R2 | 10GB storage, 10M reads/month | Plenty for MVP |
| Pages | Unlimited requests | No limits |

---

## Next Steps

1. Set up monorepo with pnpm workspaces
2. Configure Cloudflare project (D1, R2, Workers)
3. Implement database schema with Drizzle
4. Build API routes with Hono
5. Build frontend with React + shadcn/ui
6. Set up Google OAuth
7. Curate and upload initial 10-20 skills
8. Deploy to Cloudflare
