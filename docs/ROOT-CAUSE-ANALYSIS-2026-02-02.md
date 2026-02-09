# Root Cause Analysis & Prevention - Missing API Proxy Functions

## Executive Summary

**Issue**: Skills page showed empty results because API requests returned HTML instead of JSON data.

**Root Cause**: The Cloudflare Pages Functions directory (`functions/`) was not being deployed because the build process didn't copy it to the `dist/` directory.

**Impact**: Complete outage of skills browsing functionality.

**Resolution**: Updated build script to copy functions, added verification script, and created comprehensive deployment documentation.

## Root Cause

When the API proxy was added (commit `87dd5c0` on 2026-01-26), the following files were created:

```
apps/web/functions/api/[[path]].ts    <- Pages Function to proxy API requests
apps/web/public/_routes.json          <- Route configuration
```

However, the build script in `apps/web/package.json` was NOT updated to include the functions directory in the build output:

```json
// Before (incomplete)
"build": "tsc && vite build"

// After (correct)
"build": "tsc && vite build && node -e \"require('fs').cpSync('functions', 'dist/functions', {recursive: true})\""
```

**Why this happened**:
1. The API proxy feature was added without considering the deployment process
2. No verification step to check build artifacts
3. No automated testing of deployments
4. Manual deployment process without checklists

**Why it wasn't caught**:
1. No CI/CD pipeline to validate builds
2. No health checks or monitoring
3. Possibly worked during initial manual deployment but broke on subsequent deploys
4. No integration tests for API proxy functionality

## Timeline

| Date | Event |
|------|-------|
| 2026-01-26 | API proxy added (commit `87dd5c0`), build script not updated |
| 2026-01-26 | Likely manually deployed with `wrangler pages deploy dist` which may have worked temporarily |
| Unknown | Subsequent deployment(s) without functions directory |
| 2026-02-02 | User reported empty skills page |
| 2026-02-02 | Issue diagnosed and fixed within 2 hours |

## What We Did

### Immediate Fix (Production)

1. ✅ Updated `apps/web/package.json` build script to copy `functions/` to `dist/functions/`
2. ✅ Rebuilt web app: `pnpm build`
3. ✅ Deployed to Cloudflare Pages: `npx wrangler pages deploy dist --project-name agentskills`
4. ✅ Verified API is working: `curl https://agentskills.cv/api/skills?limit=1` returns JSON

### Prevention Measures (Long-term)

1. ✅ **Created deployment verification script** (`scripts/verify-build.sh`)
   - Checks all required files exist in `dist/` before deployment
   - Can be run manually or integrated into CI/CD

2. ✅ **Added deployment scripts** to package.json
   - `pnpm verify:build` - Run verification
   - `pnpm deploy:web` - Build, verify, and deploy (safe deployment)
   - `pnpm deploy:api` - Deploy API worker

3. ✅ **Created comprehensive documentation**
   - `docs/DEPLOYMENT.md` - Complete deployment guide with checklists
   - `docs/incident-postmortem-2026-02-02-missing-api-proxy.md` - Detailed post-mortem
   - `scripts/README.md` - Scripts documentation
   - Updated `CLAUDE.md` with deployment best practices

4. ✅ **Updated package.json across the monorepo**
   - Root: Added `verify:build`, `deploy:web`, `deploy:api`
   - Web: Added `deploy` script
   - API: Already had `deploy` script

## Verification

Run the verification script to ensure build is correct:

```bash
bash scripts/verify-build.sh
```

Expected output:
```
🔍 Verifying build artifacts...
✓ Functions directory exists
✓ API proxy function exists
✓ _routes.json exists
✓ _routes.json includes /api/* route
✓ index.html exists
✓ Found 1 JavaScript file(s)
✓ Found 1 CSS file(s)

✅ All checks passed! Build artifacts are ready for deployment.
```

## Going Forward

### Before Every Deployment

**ALWAYS** follow this checklist:

1. [ ] Run `pnpm build` (or `pnpm --filter web build`)
2. [ ] Run `pnpm verify:build` to check artifacts
3. [ ] If verification passes, deploy with `pnpm deploy:web`
4. [ ] Verify production: `curl https://agentskills.cv/api/skills?limit=1` (should return JSON)

### Recommended: Use Safe Deployment Script

Instead of manual steps, use the integrated deployment script:

```bash
# From project root
pnpm deploy:web

# This automatically:
# 1. Builds the web app
# 2. Verifies build artifacts
# 3. Deploys to Cloudflare Pages
# 4. Only proceeds if all steps pass
```

### Future Improvements

See `docs/incident-postmortem-2026-02-02-missing-api-proxy.md` for full list of action items, including:

- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add integration tests for API proxy
- [ ] Add health check endpoints
- [ ] Set up monitoring and alerts
- [ ] Automated deployment verification

## Key Takeaways

1. **Build process must match deployment requirements** - If you add new directories/files that need to be deployed, update the build process
2. **Verify before deploying** - Always check what you're deploying before it goes to production
3. **Document critical processes** - Deployment should have clear, documented steps
4. **Automate verification** - Scripts catch errors humans might miss
5. **Monitor production** - Issues should be detected automatically, not by user reports

## Files Changed

- `apps/web/package.json` - Updated build script to copy functions
- `package.json` - Added verify:build and deployment scripts
- `scripts/verify-build.sh` - NEW: Build verification script
- `docs/DEPLOYMENT.md` - NEW: Comprehensive deployment guide
- `docs/incident-postmortem-2026-02-02-missing-api-proxy.md` - NEW: Detailed post-mortem
- `scripts/README.md` - NEW: Scripts documentation
- `CLAUDE.md` - Updated with deployment best practices

## Contact

If you encounter deployment issues:
1. Check `docs/DEPLOYMENT.md` for troubleshooting
2. Run `bash scripts/verify-build.sh` to diagnose
3. Review `docs/incident-postmortem-2026-02-02-missing-api-proxy.md` for similar issues
