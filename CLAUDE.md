# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agent Skills Marketplace** - a community-driven marketplace for AI agent skills targeting Claude Code, Codex CLI, and similar tools. The platform is **LIVE** at [agentskills.cv](https://agentskills.cv).

## Repository Structure

```
agentskills/
├── apps/
│   ├── api/                    # Hono API on Cloudflare Workers
│   │   ├── src/
│   │   │   ├── db/             # Drizzle ORM schema
│   │   │   ├── middleware/     # Auth middleware
│   │   │   ├── routes/         # API endpoints (auth, skills, composer, etc.)
│   │   │   └── services/       # AI Skill Composer service
│   │   ├── migrations/         # D1 database migrations
│   │   └── wrangler.toml       # Cloudflare Workers config
│   └── web/                    # React SPA
│       ├── src/
│       │   ├── components/     # UI components (layout, skills, skill-composer)
│       │   ├── context/        # React contexts (auth)
│       │   ├── lib/            # API client, utilities
│       │   └── pages/          # Route pages
│       └── tailwind.config.js  # Tailwind with custom gold theme
├── packages/
│   └── shared/                 # Shared types between API and web
└── docs/                       # Design and planning documents
```

## Technical Stack (Implemented)

**Frontend**: React 19, Tailwind CSS 4, shadcn/ui, Wouter, Vite 7
**Backend**: Hono (Cloudflare Workers), Drizzle ORM, TypeScript
**Database**: Cloudflare D1 (SQLite)
**File Storage**: Cloudflare R2
**AI**: DeepSeek API (for AI Skill Composer)
**Auth**: Google OAuth 2.0
**Package Manager**: pnpm (monorepo)

## Implemented Features

### Core Marketplace
- Browse and search 770+ skills from GitHub
- Skill detail pages with SKILL.md preview
- Category filtering and sorting
- Star/fork counts, ratings display
- Download ZIP functionality

### User Features
- Google OAuth authentication
- Favorites system
- 5-star rating system
- User profiles with avatars

### AI Skill Composer (NEW)
- Natural language skill creation
- Clarifying questions flow (2+ rounds)
- Real-time streaming generation
- Step-by-step workflow display
- SKILL.md preview with YAML frontmatter
- Edit and regenerate with feedback
- Publish (public/private) to marketplace
- My Skills page for managing created skills

### Pages
- `/` - Homepage with hero, featured skills, categories, FAQ
- `/skills` - Browse all skills
- `/skills/:id` - Skill detail page
- `/create` - AI Skill Composer
- `/my-skills` - User's created skills
- `/favorites` - User's favorited skills
- `/login` - Google OAuth login
- `/privacy` - Privacy Policy
- `/terms` - Terms of Use

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev servers (API + Web)
pnpm build            # Production build

# Deployment
pnpm verify:build     # Verify build artifacts before deployment
pnpm deploy:web       # Build, verify, and deploy web app
pnpm deploy:api       # Deploy API worker

# API specific
cd apps/api
pnpm dev              # Start API dev server
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Apply local migrations
pnpm db:migrate:prod  # Apply production migrations (--remote)
pnpm deploy           # Deploy to Cloudflare

# Web specific
cd apps/web
pnpm dev              # Start Vite dev server
pnpm build            # Build for production (includes functions copy)
pnpm deploy           # Deploy to Cloudflare Pages
```

**IMPORTANT**: Always run `pnpm verify:build` before deploying web app to ensure all required files are present.

## Environment Variables

### API (.dev.vars)
```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=xxx
```

### Production Secrets (wrangler secret)
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DEEPSEEK_BASE_URL
DEEPSEEK_API_KEY
```

## Database Schema

Key tables:
- `users` - User accounts (Google OAuth)
- `sessions` - Auth sessions
- `skills` - Skill entries (GitHub + user-created)
- `favorites` - User favorites
- `ratings` - User ratings
- `skill_creations` - AI Composer drafts
- `skill_creation_outputs` - Generated SKILL.md versions
- `skill_creation_steps` - Workflow step tracking

## API Endpoints

### Auth
- `GET /api/auth/google` - Start OAuth flow
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Skills
- `GET /api/skills` - List skills (paginated, filterable)
- `GET /api/skills/:id` - Get skill details
- `GET /api/skills/:id/download` - Download skill ZIP
- `GET /api/skills/my` - Get user's created skills

### Composer
- `POST /api/composer/clarify` - Get clarifying questions
- `POST /api/composer/generate/stream` - Stream skill generation
- `POST /api/composer/:id/regenerate` - Regenerate with feedback
- `POST /api/composer/:id/publish` - Publish to marketplace

### Favorites & Ratings
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/:id` - Add favorite
- `DELETE /api/favorites/:id` - Remove favorite
- `POST /api/ratings/:id` - Rate skill

## Design System

- Dark metallic theme with gold accent (#D4AF37)
- Custom gold gradient: `from-gold-dark via-gold to-gold-light`
- Terminal-style code blocks with traffic light dots
- Responsive design with mobile support

## Architecture: API Proxy for OAuth Branding

Google OAuth consent screen displays the **redirect_uri domain**, not the app name configured in Google Cloud Console. To show `agentskills.cv` instead of `jefflee2002.workers.dev`, we proxy API requests through Cloudflare Pages.

### How It Works

```
Browser → agentskills.cv/api/* → Pages Function → agentskills-api.jefflee2002.workers.dev
```

1. **Frontend uses relative API path** (`apps/web/src/lib/api.ts`):
   ```typescript
   export const API_BASE = '/api';  // NOT absolute worker URL
   ```

2. **Pages Function proxies requests** (`apps/web/functions/api/[[path]].ts`):
   - Catches all `/api/*` requests
   - Forwards to the Worker with `X-Forwarded-Host` header
   - Returns response to browser

3. **Auth route reads forwarded host** (`apps/api/src/routes/auth.ts`):
   ```typescript
   const forwardedHost = c.req.header('x-forwarded-host');
   const host = forwardedHost || c.req.header('host');
   ```

4. **_routes.json tells Pages which paths invoke Functions** (`apps/web/public/_routes.json`):
   ```json
   { "version": 1, "include": ["/api/*"], "exclude": [] }
   ```

### Key Files

| File | Purpose |
|------|---------|
| `apps/web/functions/api/[[path]].ts` | Proxy function |
| `apps/web/public/_routes.json` | Route config for Pages Functions |
| `apps/web/src/lib/api.ts` | Frontend API base URL |
| `apps/api/src/routes/auth.ts` | OAuth with X-Forwarded-Host support |

### Lessons Learned

1. **OAuth branding = redirect_uri domain** - Google shows the domain from redirect_uri, not app name
2. **Use relative API paths** - Hardcoded worker URLs bypass the proxy
3. **X-Forwarded-Host is essential** - Backend needs to know the original host for redirects
4. **_routes.json controls Functions** - Must explicitly include paths for Functions to handle
5. **Deployments need propagation** - Wait a few seconds after deploy for changes to take effect
6. **Build process must copy functions/** - Pages Functions won't deploy if not in `dist/` directory
7. **Always verify build artifacts** - Run `pnpm verify:build` before every deployment

See `docs/incident-postmortem-2026-02-02-missing-api-proxy.md` for detailed root cause analysis.

## Deployment

For detailed deployment instructions, see `docs/DEPLOYMENT.md`.

**Quick deployment checklist**:
1. Run `pnpm build` (web app)
2. Run `pnpm verify:build` to check artifacts
3. Run `pnpm deploy:web` or manually `npx wrangler pages deploy dist --project-name agentskills`
4. Verify API proxy: `curl https://agentskills.cv/api/skills?limit=1` (should return JSON)

**Critical**: The build process must copy `functions/` to `dist/functions/` or the API proxy won't work.

## Business Context

- **Live URL**: https://agentskills.cv
- **API URL**: https://agentskills-api.jefflee2002.workers.dev (also proxied via agentskills.cv/api)
- **Status**: MVP launched with AI Skill Composer
- **Skills**: 770+ aggregated from GitHub + user-created
- **Differentiators**: AI-powered skill creation, community ratings, SKILL.md standard
