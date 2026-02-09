#!/bin/bash
# Deployment Verification Script
# Verifies that all required files are present in the dist/ directory before deployment

set -e  # Exit on any error

echo "🔍 Verifying build artifacts..."

DIST_DIR="apps/web/dist"
ERRORS=0

# Check for functions directory
if [ ! -d "$DIST_DIR/functions" ]; then
  echo "❌ ERROR: $DIST_DIR/functions/ directory missing"
  ERRORS=$((ERRORS + 1))
else
  echo "✓ Functions directory exists"
fi

# Check for API proxy function
if [ ! -f "$DIST_DIR/functions/api/[[path]].js" ]; then
  echo "❌ ERROR: API proxy function missing at $DIST_DIR/functions/api/[[path]].js"
  ERRORS=$((ERRORS + 1))
else
  echo "✓ API proxy function exists"
fi

# Check for _routes.json
if [ ! -f "$DIST_DIR/_routes.json" ]; then
  echo "❌ ERROR: _routes.json missing"
  ERRORS=$((ERRORS + 1))
else
  echo "✓ _routes.json exists"

  # Validate _routes.json format
  if ! grep -q '"/api/\*"' "$DIST_DIR/_routes.json"; then
    echo "⚠️  WARNING: _routes.json doesn't include /api/* route"
    ERRORS=$((ERRORS + 1))
  else
    echo "✓ _routes.json includes /api/* route"
  fi
fi

# Check for index.html
if [ ! -f "$DIST_DIR/index.html" ]; then
  echo "❌ ERROR: index.html missing"
  ERRORS=$((ERRORS + 1))
else
  echo "✓ index.html exists"
fi

# Check for assets directory
if [ ! -d "$DIST_DIR/assets" ]; then
  echo "❌ ERROR: assets/ directory missing"
  ERRORS=$((ERRORS + 1))
else
  # Check for at least one JS and CSS file
  JS_COUNT=$(find "$DIST_DIR/assets" -name "*.js" | wc -l)
  CSS_COUNT=$(find "$DIST_DIR/assets" -name "*.css" | wc -l)

  if [ "$JS_COUNT" -eq 0 ]; then
    echo "❌ ERROR: No JavaScript files found in assets/"
    ERRORS=$((ERRORS + 1))
  else
    echo "✓ Found $JS_COUNT JavaScript file(s)"
  fi

  if [ "$CSS_COUNT" -eq 0 ]; then
    echo "❌ ERROR: No CSS files found in assets/"
    ERRORS=$((ERRORS + 1))
  else
    echo "✓ Found $CSS_COUNT CSS file(s)"
  fi
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ All checks passed! Build artifacts are ready for deployment."
  exit 0
else
  echo "❌ $ERRORS error(s) found. Fix the issues before deploying."
  exit 1
fi
