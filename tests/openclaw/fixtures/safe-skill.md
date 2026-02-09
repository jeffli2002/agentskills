---
name: commit-analyzer
description: "Analyzes git commit history and generates summary reports of changes, contributors, and trends over time."
allowed-tools: Bash, Read, Grep
requirements:
  bins:
    - git
  env:
    - GITHUB_TOKEN
metadata:
  openclaw:
    emoji: "\U0001F4CA"
    install:
      darwin:
        brew: git
      linux:
        apt: git
---

# Commit Analyzer

Analyze your Git commit history and generate insightful reports.

## When to Use

Use this skill when you want to:
- Summarize recent changes in a repository
- Identify top contributors over a time period
- Generate changelog entries from commit messages

## Workflow

1. Read the git log for the specified time range
2. Parse commit messages for conventional commit types
3. Group changes by type (feat, fix, chore, etc.)
4. Generate a formatted summary report

## Example Usage

```bash
git log --oneline --since="2026-01-01" --until="2026-02-01"
```

Output:
```
## Changes (January 2026)

### Features
- Add user authentication flow
- Implement search functionality

### Bug Fixes
- Fix pagination offset calculation
- Resolve CORS headers for API proxy
```
