# Deployment Guide

This guide covers deploying both the API (Cloudflare Worker) and Web (Cloudflare Pages) components.

## Prerequisites

- Cloudflare account with Workers and Pages enabled
- Wrangler CLI installed (`pnpm add -g wrangler`)
- Cloudflare API token with appropriate permissions

## Architecture Overview

```
Browser
  ↓
agentskills.cv (Cloudflare Pages)
  ├── Static assets (HTML, CSS, JS)
  └── /api/* → Pages Function (proxy)
        ↓
        agentskills-api.jefflee2002.workers.dev (Cloudflare Worker)
          ↓
          D1 Database, R2 Storage
```

## Deployment Checklist

### Before Every Deployment

- [ ] Ensure you're on the correct branch (usually `main`)
- [ ] All tests pass locally
- [ ] Code is committed (or use `--commit-dirty=true`)
- [ ] Environment variables are set correctly

### API Worker Deployment

1. **Navigate to API directory**
   ```bash
   cd apps/api
   ```

2. **Install dependencies** (if needed)
   ```bash
   pnpm install
   ```

3. **Run database migrations** (if needed)
   ```bash
   # Local database
   pnpm db:migrate

   # Production database
   pnpm db:migrate:prod
   ```

4. **Deploy to Cloudflare Workers**
   ```bash
   npx wrangler deploy
   ```

5. **Verify deployment**
   ```bash
   curl "https://agentskills-api.jefflee2002.workers.dev/api/skills?limit=1"
   # Should return JSON with skills data
   ```

### Web App Deployment

1. **Navigate to web directory**
   ```bash
   cd apps/web
   ```

2. **Install dependencies** (if needed)
   ```bash
   pnpm install
   ```

3. **Build the application**
   ```bash
   pnpm build
   ```

4. **Verify build artifacts** (CRITICAL)
   ```bash
   bash ../../scripts/verify-build.sh
   ```

   This checks:
   - `dist/functions/` directory exists
   - `dist/functions/api/[[path]].ts` exists (API proxy)
   - `dist/_routes.json` exists and includes `/api/*`
   - `dist/index.html` exists
   - `dist/assets/` contains JS and CSS files

5. **Deploy to Cloudflare Pages**
   ```bash
   npx wrangler pages deploy dist --project-name agentskills
   ```

6. **Verify deployment**
   ```bash
   # Wait a few seconds for propagation
   sleep 5

   # Test API proxy
   curl "https://agentskills.cv/api/skills?limit=1"
   # Should return JSON (not HTML)

   # Test homepage
   curl -I "https://agentskills.cv"
   # Should return 200 OK with text/html
   ```

## Common Issues

### Issue: API returns HTML instead of JSON

**Symptom**: Requests to `/api/*` return the homepage HTML instead of API responses.

**Cause**: Pages Functions not deployed (missing `dist/functions/` directory).

**Solution**:
1. Check if `dist/functions/` exists after build
2. Run `bash scripts/verify-build.sh`
3. If missing, rebuild with updated package.json build script
4. Redeploy

### Issue: OAuth shows worker domain instead of agentskills.cv

**Symptom**: Google OAuth consent screen shows `jefflee2002.workers.dev` instead of `agentskills.cv`.

**Cause**: API proxy not working (same as above issue).

**Solution**: Same as above - ensure Pages Functions are deployed.

### Issue: CORS errors in browser console

**Symptom**: Browser shows CORS errors when calling API.

**Cause**: Worker CORS configuration not allowing Pages domain.

**Solution**:
1. Check `apps/api/src/index.ts` CORS middleware
2. Ensure `agentskills.cv` is in allowed origins
3. Redeploy API worker

### Issue: 404 on skill downloads

**Symptom**: Clicking download button returns 404.

**Cause**: R2 bucket not accessible or files not uploaded.

**Solution**:
1. Check R2 bucket bindings in `apps/api/wrangler.toml`
2. Verify files exist in R2 bucket
3. Check R2 permissions

## Environment Variables

### API Worker Secrets

Set these using `wrangler secret put <NAME>`:

```bash
cd apps/api

# Google OAuth
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

# DeepSeek AI
wrangler secret put DEEPSEEK_BASE_URL
wrangler secret put DEEPSEEK_API_KEY
```

### Local Development

Create `apps/api/.dev.vars`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=your_api_key
```

## Rollback Procedure

If a deployment causes issues:

### Rollback Web App

1. Go to Cloudflare Pages dashboard
2. Navigate to "Deployments" tab
3. Find the last working deployment
4. Click "Rollback to this deployment"

### Rollback API Worker

1. Get list of recent deployments:
   ```bash
   cd apps/api
   npx wrangler deployments list
   ```

2. Rollback to specific deployment:
   ```bash
   npx wrangler rollback --message "Rolling back to version X"
   ```

## Automated Deployment (Future)

When CI/CD is set up, deployments will happen automatically on push to `main`:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    # Deploy API worker
    ...

  deploy-web:
    # Deploy web app
    ...
```

## Monitoring

### Health Checks

- API health: `curl https://agentskills-api.jefflee2002.workers.dev/health`
- Web health: `curl https://agentskills.cv`

### Logs

View logs in real-time:

```bash
# API Worker logs
cd apps/api
npx wrangler tail

# Pages Functions logs
cd apps/web
npx wrangler pages deployment tail
```

### Analytics

- Cloudflare Analytics dashboard
- Worker Analytics for API traffic
- Pages Analytics for web traffic

## Support

If deployment issues persist:

1. Check Cloudflare status page
2. Review Wrangler documentation
3. Check project issues on GitHub
4. Contact team lead
