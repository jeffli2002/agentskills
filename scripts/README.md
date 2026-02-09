# Scripts

Utility scripts for the Agent Skills Marketplace project.

## Available Scripts

### verify-build.sh

Verifies that the web app build artifacts contain all required files before deployment.

**Usage:**
```bash
bash scripts/verify-build.sh
```

**What it checks:**
- `dist/functions/` directory exists
- `dist/functions/api/[[path]].ts` exists (API proxy function)
- `dist/_routes.json` exists and includes `/api/*` route
- `dist/index.html` exists
- `dist/assets/` contains JavaScript and CSS files

**When to run:**
- Before every deployment to production
- As part of CI/CD pipeline (future)
- When troubleshooting deployment issues

**Example output:**
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

**Exit codes:**
- `0` - All checks passed
- `1` - One or more checks failed

## Integration with package.json

These scripts are integrated into the root `package.json`:

```json
{
  "scripts": {
    "verify:build": "bash scripts/verify-build.sh",
    "deploy:web": "pnpm --filter web build && pnpm verify:build && pnpm --filter web deploy"
  }
}
```

You can run them from the project root:
```bash
pnpm verify:build
pnpm deploy:web
```
