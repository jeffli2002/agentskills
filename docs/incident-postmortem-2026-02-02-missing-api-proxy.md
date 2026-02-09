# Incident Post-Mortem: Missing API Proxy Functions (2026-02-02)

## Summary

**Date**: 2026-02-02
**Duration**: Unknown start → ~2 hours to fix
**Impact**: Skills page showed empty results for all users
**Severity**: High (complete feature outage)
**Status**: Resolved

## What Happened

The `/skills` page at https://agentskills.cv was showing no skills despite having 661 skills in the database. Investigation revealed that API requests to `/api/skills` were returning the HTML homepage instead of JSON data.

## Timeline

| Time | Event |
|------|-------|
| Unknown | API proxy functions stopped being deployed |
| 2026-02-02 14:00 | User reported empty skills page |
| 2026-02-02 14:15 | Investigation began - tested API endpoint directly |
| 2026-02-02 14:20 | Root cause identified: missing `functions/` directory in deployment |
| 2026-02-02 14:30 | Fix implemented: updated build script |
| 2026-02-02 14:45 | Deployed and verified working |

## Root Cause Analysis

### The Problem

The Cloudflare Pages Functions (API proxy) were not being deployed because:

1. **The `functions/` directory was created on 2026-01-26** (commit `87dd5c0`)
2. **The build script was never updated** to copy `functions/` to `dist/`
3. **Cloudflare Pages only deploys what's in the `dist/` directory**
4. **Result**: API requests fell through to the static site, returning HTML instead of proxying to the API

### Why It Worked Before (If It Did)

There are two possibilities:

1. **It never fully worked in production** - the proxy was added but never properly deployed
2. **Manual deployment** - someone may have manually deployed using `wrangler pages deploy` which could have picked up the functions directory, but subsequent automated deployments (if any) would have lost it

### The Missing Step

When the API proxy was added in commit `87dd5c0`, the following was created:

```
apps/web/functions/api/[[path]].ts    <- API proxy function
apps/web/public/_routes.json          <- Routes config
```

But the build process was NOT updated:

```json
// apps/web/package.json (before fix)
"build": "tsc && vite build"  // Only builds to dist/, doesn't copy functions/
```

### Why This Wasn't Caught

1. **No automated tests** for deployment artifacts
2. **No CI/CD pipeline** to validate deployments
3. **No monitoring** to detect API proxy failures
4. **Manual deployment process** - no automated checks

## The Fix

### Immediate Fix

Updated `apps/web/package.json` build script:

```json
"build": "tsc && vite build && node -e \"require('fs').cpSync('functions', 'dist/functions', {recursive: true})\""
```

Then redeployed:

```bash
cd apps/web
pnpm build
npx wrangler pages deploy dist --project-name agentskills
```

### Verification

```bash
# Test API endpoint
curl "https://agentskills.cv/api/skills?limit=1"
# ✓ Returns JSON with skill data

# Check dist directory
ls -la dist/functions/api/
# ✓ Contains [[path]].ts
```

## Lessons Learned

### What Went Wrong

1. **Incomplete implementation** - Added functions directory without updating build process
2. **No deployment checklist** - No systematic verification of what gets deployed
3. **No automated testing** - Can't catch deployment issues before production
4. **No monitoring** - Issue went undetected until user report

### What Went Right

1. **Clear error symptoms** - Empty page made the issue obvious
2. **Fast diagnosis** - Testing API directly quickly identified the proxy issue
3. **Simple fix** - Once identified, fix was straightforward
4. **Good documentation** - CLAUDE.md had architecture details that helped

## Action Items

### 1. Prevent Similar Issues (CRITICAL)

- [ ] **Add deployment verification script** (`scripts/verify-build.sh`)
  ```bash
  #!/bin/bash
  # Verify dist/ contains all required files before deployment

  echo "Verifying build artifacts..."

  # Check for functions directory
  if [ ! -d "dist/functions" ]; then
    echo "❌ ERROR: dist/functions/ directory missing"
    exit 1
  fi

  if [ ! -f "dist/functions/api/[[path]].ts" ]; then
    echo "❌ ERROR: API proxy function missing"
    exit 1
  fi

  if [ ! -f "dist/_routes.json" ]; then
    echo "❌ ERROR: _routes.json missing"
    exit 1
  fi

  echo "✓ All required files present"
  ```

- [ ] **Update package.json** to run verification before deploy
  ```json
  "scripts": {
    "build": "tsc && vite build && node -e \"require('fs').cpSync('functions', 'dist/functions', {recursive: true})\"",
    "verify": "bash scripts/verify-build.sh",
    "predeploy": "pnpm build && pnpm verify",
    "deploy": "npx wrangler pages deploy dist --project-name agentskills"
  }
  ```

### 2. Add Automated Testing

- [ ] **Integration tests** for API proxy
  ```typescript
  // tests/integration/api-proxy.test.ts
  describe('API Proxy', () => {
    it('should proxy /api/skills to worker', async () => {
      const res = await fetch('https://agentskills.cv/api/skills?limit=1');
      expect(res.headers.get('content-type')).toContain('application/json');
      const data = await res.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
    });
  });
  ```

- [ ] **Build artifact tests**
  ```typescript
  // tests/build/artifacts.test.ts
  import fs from 'fs';

  describe('Build Artifacts', () => {
    it('should include functions directory', () => {
      expect(fs.existsSync('dist/functions')).toBe(true);
    });

    it('should include API proxy function', () => {
      expect(fs.existsSync('dist/functions/api/[[path]].ts')).toBe(true);
    });
  });
  ```

### 3. Add Monitoring

- [ ] **Health check endpoint** - Add `/api/health` that returns system status
- [ ] **Uptime monitoring** - Use service like UptimeRobot or Cloudflare Health Checks
- [ ] **Error tracking** - Add Sentry or similar for runtime errors
- [ ] **Deployment notifications** - Slack/email on successful/failed deployments

### 4. Improve Documentation

- [ ] **Deployment checklist** - Document manual deployment steps
  ```markdown
  ## Deployment Checklist

  Before deploying to production:

  - [ ] Run `pnpm build` locally
  - [ ] Verify `dist/functions/` exists
  - [ ] Run integration tests
  - [ ] Deploy to staging first
  - [ ] Smoke test staging
  - [ ] Deploy to production
  - [ ] Verify production health
  ```

- [ ] **Architecture diagram** - Visual diagram showing Pages → Functions → Worker flow
- [ ] **Troubleshooting guide** - Common issues and solutions

### 5. CI/CD Pipeline (Long-term)

- [ ] **GitHub Actions workflow** for automated deployments
  ```yaml
  # .github/workflows/deploy-web.yml
  name: Deploy Web App

  on:
    push:
      branches: [main]
      paths: ['apps/web/**']

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: pnpm/action-setup@v2
        - run: cd apps/web && pnpm install
        - run: cd apps/web && pnpm build
        - run: cd apps/web && pnpm verify
        - run: cd apps/web && pnpm deploy
          env:
            CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  ```

### 6. Better Build Process (Long-term)

Consider using a proper Cloudflare Pages adapter or build plugin:

- [ ] Investigate Vite plugin for Cloudflare Pages Functions
- [ ] Or use wrangler CLI as part of build process
- [ ] Ensure functions are automatically included in build output

## References

- Commit where proxy was added: `87dd5c0`
- CLAUDE.md section: "Architecture: API Proxy for OAuth Branding"
- Cloudflare Pages Functions docs: https://developers.cloudflare.com/pages/functions/

## Sign-off

**Incident Commander**: Claude
**Reviewed by**: _[To be filled]_
**Date**: 2026-02-02
