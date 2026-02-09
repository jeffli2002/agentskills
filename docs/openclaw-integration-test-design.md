# OpenClaw Integration Test Design

## 1. Overview

This document defines the integration testing strategy for the OpenClaw skill import system. Tests cover the full pipeline: fetching skills from ClawHub, running security audits, converting formats, storing in D1/R2, and handling failures.

### 1.1 Test Framework

**Vitest** -- the project uses Vite 7 for the web app and the API runs on Cloudflare Workers. Vitest provides native ESM support, TypeScript support without config, and fast execution. It is the natural choice for this stack.

### 1.2 Test Location

```
tests/openclaw/
  fetcher.test.ts           # ClawHub API interaction tests
  security-audit.test.ts    # Security scanner rule tests
  format-converter.test.ts  # Format conversion + validation tests
  import-pipeline.test.ts   # End-to-end import pipeline tests
  fixtures/                 # Sample SKILL.md files
    safe-skill.md           # Clean skill with all valid fields
    minimal-valid.md        # Minimal valid frontmatter (name + description only)
    no-frontmatter.md       # SKILL.md with no YAML frontmatter
    invalid-yaml.md         # Malformed YAML frontmatter
    warning-broad-tools.md  # Skill with overly broad allowed-tools
    malicious-base64.md     # Base64 decode-and-execute payload
    malicious-credential-harvester.md  # SSH/AWS/env credential theft + Telegram exfil
    malicious-password-zip.md          # Password-protected ZIP download
    malicious-reverse-shell.md         # /dev/tcp and mkfifo reverse shells
    malicious-prompt-injection.md      # Prompt injection + role reassignment
    malicious-persistence.md           # Crontab + LaunchAgent persistence
    malicious-obfuscated.md            # eval, variable concat, PowerShell IEX
```

### 1.3 Dependencies

```json
{
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

Add to root `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:openclaw": "vitest run tests/openclaw/"
  }
}
```

---

## 2. Test Categories

### 2.1 Skill Fetching Tests (`fetcher.test.ts`)

Tests the `clawHubClient.ts` service that communicates with the ClawHub API.

| Test | What It Validates | Mock Strategy |
|------|-------------------|---------------|
| Fetch default page of skills | API request format, response parsing | Mock `fetch()` with JSON response |
| Filter by minStars | Query parameter construction | Mock `fetch()` |
| Filter by author | Query parameter construction | Mock `fetch()` |
| Filter by tags | Query parameter construction | Mock `fetch()` |
| Multi-page pagination | Follow `hasMore` flag across pages | Sequential mock responses |
| Page size limit (max 100) | Client enforces max page size | Mock `fetch()` |
| Rate limiting (429 retry) | Exponential backoff with Retry-After | Sequential 429 then 200 responses |
| Max retries exceeded | Throws after N retries | All-429 responses |
| Fetch SKILL.md content | Content retrieval from ClawHub | Mock `fetch()` |
| Missing SKILL.md (404) | Graceful handling | Mock 404 response |
| Network timeout | Error wrapping | Mock rejected promise |
| YAML frontmatter parsing | Correct field extraction | Real fixture files |
| Missing frontmatter | Returns null | `no-frontmatter.md` fixture |
| Invalid YAML | Graceful error, no crash | `invalid-yaml.md` fixture |
| Nested YAML (requirements, metadata) | Proper nested object parsing | `safe-skill.md` fixture |
| Quoted vs unquoted description | Both parse correctly | Inline test strings |

**Mock approach**: Replace global `fetch()` with `vi.fn()`. No real network calls.

### 2.2 Security Audit Tests (`security-audit.test.ts`)

Tests the `securityAnalyzer.ts` static analysis engine against all 93 detection rules defined in `docs/openclaw-security-audit-design.md`.

#### Rule coverage by category:

| Category | Rules | Fixture(s) Used | Key Assertions |
|----------|-------|-----------------|----------------|
| Base64 detection | SA-001..005 | `malicious-base64.md`, inline | Detect `base64 -d`, `atob()`, `FromBase64String`, long base64 blobs, decode-and-execute |
| Suspicious URLs | SA-010..016 | `malicious-base64.md`, `malicious-credential-harvester.md`, inline | Detect paste sites, IP URLs, shorteners, ngrok, Discord webhooks, Telegram bot API |
| Download commands | SA-020..027 | `malicious-obfuscated.md`, inline | Detect `curl|bash`, `wget`, PowerShell IWR/IEX, certutil, bitsadmin |
| Password archives | SA-030..032 | `malicious-password-zip.md` | Detect `unzip -P`, `7z x -p`, combined download+extract |
| Credential harvesting | SA-040..047 | `malicious-credential-harvester.md` | Detect SSH key, AWS creds, browser profile, .env, .npmrc, crypto wallets |
| Obfuscation | SA-050..056 | `malicious-obfuscated.md`, inline | Detect eval, hex/octal encoding, variable concat, openssl decrypt |
| Persistence | SA-060..064 | `malicious-persistence.md`, inline | Detect crontab, LaunchAgent, systemd, schtasks, shell profile modification |
| Reverse shells | SA-070..074 | `malicious-reverse-shell.md`, inline | Detect /dev/tcp, mkfifo+nc, Python socket, PHP fsockopen |
| YAML analysis | SA-080..083 | `warning-broad-tools.md`, inline | Flag broad allowed-tools, Read+network combo, typosquatting |
| Prompt injection | SA-090..093 | `malicious-prompt-injection.md` | Detect override phrases, role reassignment, system markers, safety bypass |

#### Scoring system tests:

| Score | Trigger Condition | Test Strategy |
|-------|-------------------|---------------|
| `malicious` | Critical severity + high confidence | Use `malicious-reverse-shell.md` |
| `dangerous` | Critical + non-high confidence, or 2+ high | Synthetic content |
| `warning` | Single high, or 3+ medium | Use `warning-broad-tools.md` |
| `low_risk` | Medium, or 2+ low | Synthetic content |
| `safe` | No findings or only info/low | Use `safe-skill.md`, `minimal-valid.md` |

#### Additional security tests:

- Bundled file scanning (scripts/ directory)
- Empty content handling
- Large content handling (100KB+)
- False positive avoidance (data URIs, legitimate base64)
- Rule skip option (`skipRules` parameter)
- Cross-file finding aggregation

### 2.3 Format Conversion Tests (`format-converter.test.ts`)

Tests `skillImporter.ts` conversion functions and validation logic.

#### Name validation (OpenClaw convention rules):

| Input | Expected | Reason |
|-------|----------|--------|
| `commit-analyzer` | Valid | Standard kebab-case |
| `a` | Valid | Single char OK |
| `Commit-Analyzer` | Invalid | Uppercase not allowed |
| `-leading` | Invalid | No leading hyphens |
| `trailing-` | Invalid | No trailing hyphens |
| `double--hyphen` | Invalid | No consecutive hyphens |
| `a` * 65 | Invalid | Max 64 chars |
| `a` * 64 | Valid | Exactly 64 chars |
| `name_underscore` | Invalid | Only hyphens, no underscores |
| `name.dots` | Invalid | No dots |
| `name spaces` | Invalid | No spaces |
| (empty) | Invalid | Required |

#### Name sanitization:

| Input | Expected Output |
|-------|----------------|
| `Commit-Analyzer` | `commit-analyzer` |
| `my_skill name` | `my-skill-name` |
| `name---hyphens` | `name-hyphens` |
| `-leading-` | `leading` |
| `a` * 100 | `a` * 64 |
| `!!!` | `` (empty) |

#### Description validation:

| Input | Expected | Reason |
|-------|----------|--------|
| `A simple description.` | Valid | Normal case |
| `A` * 1024 | Valid | Max length |
| `A` * 1025 | Invalid | Over max |
| `Line one\nLine two` | Invalid | Multi-line |
| (empty) | Invalid | Required |

#### Category mapping:

| Tags | Expected Category |
|------|-------------------|
| `['git']` | `coding` |
| `['huggingface']` | `data` |
| `['docx']` | `writing` |
| `['docker']` | `devops` |
| `['testing']` | `testing` |
| `['unknown']` | `other` |
| `[]` | `other` |
| `['docker', 'testing']` | `devops` (first match) |
| `['GIT']` | `coding` (case-insensitive) |

#### Import conversion (OpenClaw -> AgentSkills):

- All required field mappings from ClawHub metadata
- Frontmatter preserved in `skillMdParsed` as JSON
- `filesJson` built from file listing
- Frontmatter name preferred over API metadata name
- Default values for local-only fields (avgRating=0, ratingCount=0, creatorId=null)

#### Export conversion (AgentSkills -> OpenClaw):

- Valid SKILL.md with `---` delimiters
- Name sanitized for OpenClaw compliance
- Description truncated to 1024 chars, single line
- Existing `allowed-tools` preserved
- Markdown body preserved when replacing frontmatter
- Basic SKILL.md generated when no existing content

#### Quality score calculation:

- Star score: 0-30 pts (max at 100+ stars)
- Download score: 0-25 pts (max at 500+ downloads)
- Recency score: 0-20 pts (based on lastUpdated)
- Author score: 15 pts verified, 5 pts unverified
- Completeness: 0-10 pts (description length, tags, tools, model, prerequisites)

### 2.4 Import Pipeline Tests (`import-pipeline.test.ts`)

End-to-end tests for the full import pipeline with mock D1 and R2.

#### Happy path:

| Scenario | Security Score | Expected Outcome |
|----------|---------------|------------------|
| Safe skill import | `safe` | Inserted into skills + skill_imports, R2 upload |
| Low-risk skill import | `low_risk` | Inserted, no review queued |
| Warning-level import | `warning` | Inserted AND review queued |

#### Blocked imports:

| Scenario | Security Score | Expected Outcome |
|----------|---------------|------------------|
| Dangerous skill | `dangerous` | Blocked, quarantined, review queued |
| Malicious skill | `malicious` | Blocked, quarantined, auto-reject |
| Blocklisted hash | N/A | Blocked before scan, quarantined |

#### Database verification:

- `skills` table: all fields mapped correctly
- `skill_imports` table: source, sourceId, qualityScore, auditStatus
- `security_scans` table: scan results persisted
- `security_reviews` table: created for warning+ scores
- `quarantined_skills` table: created for blocked imports

#### R2 verification:

- ZIP uploaded to `imported/clawhub/{author}/{name}/skill.zip`
- `metadata.json` uploaded alongside ZIP
- Valid ZIP structure containing SKILL.md

#### Duplicate detection:

- Source ID match -> skip
- Content hash match -> flag as fork
- Name collision -> disambiguate with suffix

#### Rollback:

- Single skill rollback (delete skill, import record, R2 objects)
- Batch job rollback (rollback all skills in a job)
- Partial rollback failure handling (collect errors, continue)

#### Batch job tracking:

- Job record created with `pending` status
- Counters updated during processing
- Final status `completed` or `failed`
- Job cancellation support

#### Edge cases:

- No SKILL.md (skip)
- Invalid YAML (use metadata fallback)
- Large bundled files (>10MB)
- Network timeout on fetch
- Concurrent duplicate imports
- D1 database errors

---

## 3. Fixture Design

### 3.1 Safe Fixtures

| File | Purpose | Key Properties |
|------|---------|----------------|
| `safe-skill.md` | Clean skill with full frontmatter | name, description, allowed-tools, requirements.bins, requirements.env, metadata.openclaw |
| `minimal-valid.md` | Minimum valid SKILL.md | Only name and description in frontmatter |
| `no-frontmatter.md` | No YAML at all | Plain markdown, tests parser null return |
| `invalid-yaml.md` | Broken YAML syntax | Tests parser error handling |
| `warning-broad-tools.md` | Overly permissive tools | 6 tools including Bash + network tools |

### 3.2 Malicious Fixtures

Each fixture is designed to trigger specific security audit rules. All payloads reference fake/nonexistent URLs and are purely for pattern matching -- they are not executable.

| File | Attack Vector | Rules Triggered |
|------|---------------|-----------------|
| `malicious-base64.md` | Base64 decode-and-execute, glot.io URL | SA-001, SA-005, SA-010 |
| `malicious-credential-harvester.md` | SSH/AWS/env reading + Telegram exfil | SA-040, SA-044, SA-016 |
| `malicious-password-zip.md` | Password-protected ZIP download | SA-020, SA-030 |
| `malicious-reverse-shell.md` | /dev/tcp + mkfifo reverse shells | SA-071, SA-073 |
| `malicious-prompt-injection.md` | Instruction override + role swap | SA-090, SA-091, SA-092, SA-093 |
| `malicious-persistence.md` | Crontab + LaunchAgent | SA-022, SA-060, SA-061 |
| `malicious-obfuscated.md` | eval, variable concat, IEX | SA-050, SA-054, SA-024 |

### 3.3 Fixture Safety

All malicious fixtures are safe test data:
- URLs point to nonexistent domains (`evil.example.com`, `example.com`)
- No real credentials or tokens
- No executable code (base64 strings decode to fake URLs)
- Files are read-only test input, never executed

---

## 4. Mock Strategy

### 4.1 External API (ClawHub)

Replace global `fetch()` with `vi.fn()` in `beforeEach`. No real network calls. Mock responses follow the `ClawHubListResponse` and `ClawHubSkillMeta` interfaces from the import design.

### 4.2 D1 Database

Create a mock object with `insert()`, `select()`, `update()`, `delete()` methods backed by in-memory arrays. This avoids needing a real D1 instance or wrangler dev mode.

For future integration testing with real D1, use:
```bash
wrangler d1 execute agentskills-db --local --command "..."
```

### 4.3 R2 Bucket

Create a mock object with `put()`, `get()`, `delete()` backed by an in-memory `Map<string, Uint8Array>`. Validates key paths and content without real object storage.

### 4.4 Security Analyzer

For `import-pipeline.test.ts`, the security analyzer is called as part of the pipeline. Two approaches:

1. **Unit tests** (`security-audit.test.ts`): Test the analyzer directly with fixture content
2. **Pipeline tests** (`import-pipeline.test.ts`): Use the real analyzer or mock it to return predetermined scores per fixture

---

## 5. Vitest Configuration

Add a `vitest.config.ts` at the project root:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['apps/api/src/services/**'],
      reporter: ['text', 'lcov'],
    },
  },
});
```

---

## 6. Test Execution Plan

### 6.1 Running Tests

```bash
# Run all OpenClaw tests
pnpm test:openclaw

# Run specific test file
npx vitest run tests/openclaw/security-audit.test.ts

# Watch mode during development
npx vitest tests/openclaw/

# With coverage
npx vitest run tests/openclaw/ --coverage
```

### 6.2 CI Integration

Add to CI pipeline:

```yaml
- name: Run OpenClaw integration tests
  run: pnpm test:openclaw
```

### 6.3 Test Implementation Order

1. **format-converter.test.ts** -- Most tests are pure functions with no mocking. Many tests already pass with the inline helper functions. Implement first.

2. **security-audit.test.ts** -- Requires `securityAnalyzer.ts` to be implemented. Current tests use a stub that returns empty reports. Each test has structural assertions on fixtures that pass now and functional assertions (commented `TODO`) that will pass when the analyzer is built.

3. **fetcher.test.ts** -- Requires `clawHubClient.ts` to be implemented. Mock strategy is established; tests validate API contract and error handling.

4. **import-pipeline.test.ts** -- Requires all other modules. Tests the full orchestration with mock D1 and R2. Implement last.

---

## 7. Coverage Targets

| Module | Target | Rationale |
|--------|--------|-----------|
| `securityAnalyzer.ts` | 95%+ | Security-critical; every rule must be tested |
| `skillImporter.ts` | 90%+ | Format conversion correctness is essential |
| `clawHubClient.ts` | 85%+ | Network code with error handling paths |
| Import pipeline | 80%+ | Integration code with many branches |

---

## 8. Relationship to Design Documents

| Test File | Primary Design Reference | Key Sections |
|-----------|-------------------------|--------------|
| `fetcher.test.ts` | `docs/openclaw-skill-import-design.md` | Sections 2 (API), 3 (Quality) |
| `security-audit.test.ts` | `docs/openclaw-security-audit-design.md` | Sections 2 (Rules), 4 (Scoring) |
| `format-converter.test.ts` | `docs/openclaw-skill-format-comparison.md`, `docs/openclaw-skill-import-design.md` | Format Comparison Section 1, Import Design Section 4 |
| `import-pipeline.test.ts` | `docs/openclaw-skill-import-design.md` | Sections 5 (Audit Gate), 6 (Schema), 7 (R2), 9 (Duplicates), 10 (Rollback) |

---

## 9. Current Test Status

All test files are created as scaffolding with:

- **Structural assertions** that pass now (verifying fixture content has expected patterns)
- **Functional assertions** marked with `TODO` comments that require implementation of the actual modules (`securityAnalyzer.ts`, `clawHubClient.ts`, `skillImporter.ts`)

Total test cases across all files: **100+**

| File | Test Suites | Test Cases | Status |
|------|-------------|------------|--------|
| `fetcher.test.ts` | 5 | 17 | Scaffolded, TODO stubs |
| `security-audit.test.ts` | 12 | 42 | Scaffolded, stub analyzer |
| `format-converter.test.ts` | 8 | 35 | Scaffolded, inline helpers pass |
| `import-pipeline.test.ts` | 10 | 30 | Scaffolded, mock DB/R2 |
