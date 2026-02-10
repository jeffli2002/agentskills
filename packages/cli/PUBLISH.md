# Publishing agentskills CLI to npm

## Prerequisites

1. Create an npm account at https://www.npmjs.com/signup if you don't have one
2. Verify your email address

## Steps to Publish

```bash
# 1. Navigate to CLI package
cd packages/cli

# 2. Login to npm (interactive - will open browser or prompt for credentials)
npm login

# 3. Verify you're logged in
npm whoami

# 4. Build the package
pnpm build

# 5. Test the package locally
node dist/cli.js --version
node dist/cli.js search notebooklm

# 6. Publish to npm (--access public is required for scoped packages)
npm publish --access public

# 7. Verify it's published
npm view agentskills
```

## Post-Publish Verification

Test installation on your VPS:

```bash
# On OpenClaw VPS
npx agentskills install notebooklm --global
```

## Updating the Package

When you need to publish updates:

```bash
# 1. Update version in package.json (following semver)
npm version patch  # or minor, or major

# 2. Build
pnpm build

# 3. Publish
npm publish
```

## Troubleshooting

- **Error: Package name taken**: Change the name in package.json to a scoped package like `@yourusername/agentskills`
- **Error: Authentication required**: Run `npm login` again
- **Error: 2FA required**: Enter your OTP when prompted during publish
