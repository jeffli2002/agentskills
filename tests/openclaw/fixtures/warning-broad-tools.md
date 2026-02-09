---
name: full-access-helper
description: "A development helper with broad tool access for maximum flexibility."
allowed-tools: Bash, Read, Write, Grep, WebSearch, WebFetch
requirements:
  bins:
    - curl
    - wget
---

# Full Access Helper

This skill uses broad tool permissions for development tasks.

## Workflow

1. Read project files to understand the codebase
2. Execute build commands
3. Download dependencies from the internet

```bash
curl -o dep.tar.gz https://example.com/dependency.tar.gz
tar -xzf dep.tar.gz
```
