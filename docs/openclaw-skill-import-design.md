# OpenClaw Skill Import/Transfer System Design

## 1. Overview

This document describes the bidirectional import/transfer system between the AgentSkills marketplace and the OpenClaw/ClawHub ecosystem. The system enables:

- **Import**: Fetching proven, high-quality skills from ClawHub into our D1 database and R2 storage
- **Export**: Converting our marketplace skills to OpenClaw-compatible SKILL.md format
- **Sync**: Periodic re-import to track upstream updates (stars, forks, versions)

All imported skills pass through a mandatory security audit gate (see `docs/openclaw-security-audit-design.md`) before becoming visible in the marketplace.

---

## 2. ClawHub API Integration

### 2.1 Fetching Skills from ClawHub

ClawHub exposes a public REST API and a Git-based skill registry. Skills are stored as Git repositories with a `SKILL.md` at the root.

**Primary data sources:**

| Source | URL Pattern | Data Available |
|--------|-------------|----------------|
| ClawHub API | `https://api.clawhub.ai/v1/skills` | Metadata, stats, author info |
| ClawHub Skill Page | `https://clawhub.ai/skills/{author}/{skill-name}` | SKILL.md content, files |
| GitHub Mirror | `https://github.com/{author}/{skill-repo}` | Full repo, commit history |
| NPM Registry | `https://www.npmjs.com/package/skills` | Package metadata |

**Fetching strategy:**

```typescript
// Service: apps/api/src/services/clawHubClient.ts

interface ClawHubSkillMeta {
  id: string;
  name: string;            // 1-64 chars, lowercase alphanumeric + hyphens
  description: string;     // max 1024 chars, single-line
  author: string;
  authorVerified: boolean;
  stars: number;
  forks: number;
  downloads: number;
  lastUpdated: string;     // ISO 8601
  tags: string[];
  allowedTools: string[];
  model?: string;
  hasScripts: boolean;
  prerequisites: string[];
  version: string;
}

interface ClawHubListResponse {
  skills: ClawHubSkillMeta[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

async function fetchClawHubSkills(options: {
  page?: number;
  pageSize?: number;        // default 50, max 100
  sort?: 'stars' | 'downloads' | 'updated';
  minStars?: number;
  author?: string;
  tags?: string[];
}): Promise<ClawHubListResponse>;

async function fetchSkillContent(author: string, skillName: string): Promise<{
  skillMd: string;
  files: { path: string; content: string; size: number }[];
}>;
```

### 2.2 Pagination and Rate Limiting

- Paginate with cursor-based pagination (page + pageSize)
- Respect ClawHub API rate limits (estimated 100 req/min for authenticated, 30 req/min unauthenticated)
- Use exponential backoff on 429 responses
- Cache API responses in D1 for 1 hour to avoid redundant fetches during batch imports

### 2.3 Authentication

Store a ClawHub API token as a Cloudflare Worker secret:

```bash
wrangler secret put CLAWHUB_API_TOKEN
```

Add to worker bindings in `wrangler.toml`:

```toml
[vars]
# ... existing vars

# Secret (set via wrangler secret put):
# CLAWHUB_API_TOKEN
```

---

## 3. Quality Criteria and Filtering

### 3.1 What Makes a Skill "Proven"

A skill is considered proven and eligible for import when it meets **all** of the following minimum thresholds:

| Criterion | Minimum Threshold | Rationale |
|-----------|-------------------|-----------|
| Stars | >= 10 | Community endorsement |
| Downloads | >= 50 | Actual usage signal |
| Author Verified | true | Reduces supply chain risk |
| Last Updated | Within 6 months | Not abandoned |
| Security Audit | Pass | Must clear security gate |
| No Known Vulnerabilities | true | Per security audit system |

### 3.2 Quality Scoring Algorithm

Skills that pass the minimum thresholds receive a quality score (0-100):

```typescript
function calculateQualityScore(skill: ClawHubSkillMeta): number {
  const starScore = Math.min(skill.stars / 100, 1) * 30;       // 0-30 pts
  const downloadScore = Math.min(skill.downloads / 500, 1) * 25; // 0-25 pts
  const recencyScore = calculateRecency(skill.lastUpdated) * 20;  // 0-20 pts
  const authorScore = skill.authorVerified ? 15 : 5;              // 5-15 pts
  const completenessScore = calculateCompleteness(skill) * 10;    // 0-10 pts

  return Math.round(starScore + downloadScore + recencyScore + authorScore + completenessScore);
}

function calculateRecency(lastUpdated: string): number {
  const daysSince = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 7) return 1.0;
  if (daysSince <= 30) return 0.8;
  if (daysSince <= 90) return 0.6;
  if (daysSince <= 180) return 0.3;
  return 0.1;
}

function calculateCompleteness(skill: ClawHubSkillMeta): number {
  let score = 0;
  if (skill.description.length > 50) score += 0.3;
  if (skill.tags.length > 0) score += 0.2;
  if (skill.allowedTools.length > 0) score += 0.2;
  if (skill.model) score += 0.1;
  if (skill.prerequisites.length > 0) score += 0.2; // documents dependencies
  return score;
}
```

### 3.3 Category Mapping

Map ClawHub tags to our existing `SKILL_CATEGORIES`:

```typescript
const CLAWHUB_TAG_TO_CATEGORY: Record<string, string> = {
  // Development
  'git': 'coding',
  'github': 'coding',
  'code-review': 'coding',
  'commit': 'coding',
  'debugging': 'coding',
  'refactoring': 'coding',

  // Data & ML
  'huggingface': 'data',
  'datasets': 'data',
  'ml': 'data',
  'training': 'data',
  'evaluation': 'data',

  // Writing & Documents
  'docx': 'writing',
  'pptx': 'writing',
  'pdf': 'writing',
  'xlsx': 'writing',
  'markdown': 'writing',
  'notion': 'writing',

  // Automation
  'automation': 'automation',
  'whatsapp': 'automation',
  'slack': 'automation',
  'email': 'automation',

  // Research & Search
  'search': 'research',
  'tavily': 'research',
  'perplexity': 'research',
  'serpapi': 'research',
  'web-scraping': 'research',

  // DevOps
  'docker': 'devops',
  'ci-cd': 'devops',
  'deployment': 'devops',
  'sentry': 'devops',
  'monitoring': 'devops',

  // Testing
  'testing': 'testing',
  'unit-test': 'testing',
  'e2e': 'testing',

  // UI/UX
  'ui-audit': 'coding',
  'design-system': 'coding',
  'accessibility': 'coding',
};

function mapCategory(tags: string[]): string {
  for (const tag of tags) {
    const mapped = CLAWHUB_TAG_TO_CATEGORY[tag.toLowerCase()];
    if (mapped) return mapped;
  }
  return 'other';
}
```

---

## 4. Format Conversion Pipeline

### 4.1 OpenClaw to AgentSkills (Import)

**OpenClaw SKILL.md format (from format comparison, Task #1):**

The Agent Skill Convention supports a richer frontmatter than our current platform. The full format is:

```yaml
---
name: skill-name-here
description: "One-line description of what the skill does"
allowed-tools: Bash, Read, Grep, Write
requirements:
  bins:
    - gh
    - docker
  env:
    - GITHUB_TOKEN
  config:
    - git.user.name
model: claude-opus-4
metadata:
  openclaw:
    emoji: "\U0001F50D"
    install:
      darwin:
        brew: gh
      linux:
        apt: gh
---

# Skill Title

Instructions for the AI agent...
```

**Key format differences identified in Task #1:**
- Convention enforces strict naming (1-64 chars, lowercase alphanumeric + single hyphens, no start/end hyphens, must match parent directory name)
- `allowed-tools` provides sandboxing/permission control
- `requirements` declares prerequisites (bins, env, config)
- `metadata` supports platform-specific extensions
- Convention `description` is designed for agent context loading (token-efficient relevance matching)
- Distinguishes between auto-invoked skills and user-invoked slash commands

**AgentSkills database fields (from `apps/api/src/db/schema.ts`):**

| OpenClaw Field | AgentSkills Column | Transformation |
|----------------|-------------------|----------------|
| `name` (frontmatter) | `skills.name` | Direct copy, validate 1-64 chars, lowercase + hyphens |
| `description` (frontmatter) | `skills.description` | Direct copy, validate max 1024 chars, single-line |
| Full SKILL.md content | `skills.skillMdContent` | Store raw content |
| Parsed frontmatter JSON | `skills.skillMdParsed` | `JSON.stringify(frontmatter)` including `allowed-tools`, `requirements`, `metadata` |
| ClawHub author | `skills.author` | ClawHub username |
| ClawHub avatar URL | `skills.authorAvatarUrl` | From ClawHub profile |
| ClawHub stars | `skills.starsCount` | Direct copy |
| ClawHub forks | `skills.forksCount` | Direct copy |
| ClawHub downloads | `skills.downloadCount` | Direct copy |
| Mapped category | `skills.category` | Via `mapCategory()` |
| ClawHub URL | `skills.githubUrl` | `https://clawhub.ai/skills/{author}/{name}` |
| R2 ZIP key | `skills.r2FileKey` | `imported/clawhub/{author}/{name}/skill.zip` |
| ZIP size | `skills.fileSize` | Calculated after ZIP creation |
| File tree JSON | `skills.filesJson` | Built from skill directory listing |
| Last commit timestamp | `skills.lastCommitAt` | From ClawHub `lastUpdated` |
| `allowed-tools` | `skills.skillMdParsed` (JSON) | Preserved in parsed frontmatter |
| `requirements.bins` | `skills.skillMdParsed` (JSON) | Preserved in parsed frontmatter |
| `requirements.env` | `skills.skillMdParsed` (JSON) | Preserved in parsed frontmatter |
| N/A | `skills.creatorId` | `null` (not a local user) |
| N/A | `skills.visibility` | `'public'` |
| N/A | `skills.avgRating` | `0` (no local ratings yet) |
| N/A | `skills.ratingCount` | `0` |
| N/A | `skills.viewCount` | `0` |

**Conversion function:**

```typescript
// Service: apps/api/src/services/skillImporter.ts

import { generateId } from '../lib/utils';
import type { NewSkill } from '../db/schema';

interface ParsedFrontmatter {
  name: string;
  description: string;
  'allowed-tools'?: string[] | string;   // Can be array or comma-separated string
  model?: string;
  requirements?: {
    bins?: string[];
    env?: string[];
    config?: string[];
  };
  metadata?: {
    openclaw?: {
      emoji?: string;
      bins?: string[];
      install?: Record<string, Record<string, string>>;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Validate name against Agent Skill Convention rules (from Task #1 format comparison)
function validateOpenClawName(name: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (name.length < 1 || name.length > 64) {
    errors.push(`Name must be 1-64 characters (got ${name.length})`);
  }
  if (name !== name.toLowerCase()) {
    errors.push('Name must be lowercase');
  }
  if (!/^[a-z0-9]/.test(name)) {
    errors.push('Name must start with lowercase letter or digit');
  }
  if (!/[a-z0-9]$/.test(name)) {
    errors.push('Name must end with lowercase letter or digit');
  }
  if (/[^a-z0-9-]/.test(name)) {
    errors.push('Name can only contain lowercase letters, digits, and hyphens');
  }
  if (/--/.test(name)) {
    errors.push('Name cannot contain consecutive hyphens');
  }

  return { valid: errors.length === 0, errors };
}

function parseSkillMdFrontmatter(skillMd: string): ParsedFrontmatter | null {
  const match = skillMd.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  // Simple YAML parser for frontmatter (no external deps on CF Workers)
  // Handles nested structures (requirements, metadata)
  const lines = match[1].split('\n');
  const result: Record<string, unknown> = {};
  let currentKey = '';
  let currentIndent = 0;
  let parentStack: { key: string; obj: Record<string, unknown>; indent: number }[] = [];

  for (const line of lines) {
    if (line.trim() === '') continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Handle list items (- value)
    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2).trim();
      const target = parentStack.length > 0 ? parentStack[parentStack.length - 1].obj : result;
      if (currentKey && Array.isArray(target[currentKey])) {
        (target[currentKey] as string[]).push(value);
      }
      continue;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    let value = trimmed.substring(colonIndex + 1).trim();

    // Pop parent stack if indentation decreased
    while (parentStack.length > 0 && indent <= parentStack[parentStack.length - 1].indent) {
      parentStack.pop();
    }

    const target = parentStack.length > 0 ? parentStack[parentStack.length - 1].obj : result;

    if (value === '' || value === null) {
      // Start of nested object or list
      const newObj: Record<string, unknown> = {};
      target[key] = newObj;
      parentStack.push({ key, obj: newObj, indent });
      currentKey = key;
      currentIndent = indent;
    } else {
      // Handle quoted strings
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Handle inline arrays [a, b, c]
      if (value.startsWith('[')) {
        try {
          target[key] = JSON.parse(value);
        } catch {
          // Try comma-separated
          target[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      } else if (key === 'allowed-tools' && value.includes(',')) {
        // Handle comma-separated allowed-tools
        target[key] = value.split(',').map(s => s.trim());
      } else {
        target[key] = value;
      }
      currentKey = key;
    }
  }

  // Initialize list values that were empty
  for (const key of Object.keys(result)) {
    if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      const nested = result[key] as Record<string, unknown>;
      for (const subKey of Object.keys(nested)) {
        if (nested[subKey] && typeof nested[subKey] === 'object' && !Array.isArray(nested[subKey])) {
          // Check if this should be a list (next lines were list items)
        }
      }
    }
  }

  return result as ParsedFrontmatter;
}

function convertClawHubToSkill(
  meta: ClawHubSkillMeta,
  skillMdContent: string,
  files: { path: string; content: string; size: number }[]
): NewSkill {
  const frontmatter = parseSkillMdFrontmatter(skillMdContent);
  const skillId = generateId();

  return {
    id: skillId,
    name: frontmatter?.name || meta.name,
    description: frontmatter?.description || meta.description,
    author: meta.author,
    authorAvatarUrl: null, // Fetched separately from ClawHub profile
    creatorId: null,
    visibility: 'public',
    githubUrl: `https://clawhub.ai/skills/${meta.author}/${meta.name}`,
    starsCount: meta.stars,
    forksCount: meta.forks,
    category: mapCategory(meta.tags),
    r2FileKey: `imported/clawhub/${meta.author}/${meta.name}/skill.zip`,
    fileSize: 0, // Set after ZIP creation
    downloadCount: meta.downloads,
    viewCount: 0,
    avgRating: 0,
    ratingCount: 0,
    lastCommitAt: new Date(meta.lastUpdated),
    filesJson: JSON.stringify(files.map(f => ({
      path: f.path,
      name: f.path.split('/').pop() || f.path,
      size: f.size,
      type: 'file' as const,
    }))),
    skillMdContent,
    skillMdParsed: frontmatter ? JSON.stringify(frontmatter) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
```

### 4.2 AgentSkills to OpenClaw (Export)

For exporting our skills to OpenClaw format, we must produce convention-compliant SKILL.md files. Per the format comparison (Task #1), the convention enforces strict naming and supports richer frontmatter than our platform currently generates.

```typescript
function convertSkillToOpenClaw(skill: Skill): string {
  // Parse existing frontmatter if present
  const existing = skill.skillMdParsed ? JSON.parse(skill.skillMdParsed) : {};

  // Build OpenClaw-compliant frontmatter
  const name = sanitizeOpenClawName(skill.name);
  const nameValidation = validateOpenClawName(name);
  if (!nameValidation.valid) {
    console.warn(`Name validation warnings for "${name}":`, nameValidation.errors);
  }

  const description = skill.description
    .substring(0, 1024)
    .replace(/\n/g, ' ')
    .replace(/"/g, '\\"');

  let frontmatter = `---\nname: ${name}\ndescription: "${description}"`;

  // Preserve allowed-tools from original frontmatter
  if (existing['allowed-tools']) {
    const tools = Array.isArray(existing['allowed-tools'])
      ? existing['allowed-tools'].join(', ')
      : existing['allowed-tools'];
    frontmatter += `\nallowed-tools: ${tools}`;
  }

  // Preserve model from original frontmatter
  if (existing.model) {
    frontmatter += `\nmodel: ${existing.model}`;
  }

  // Preserve requirements from original frontmatter
  if (existing.requirements) {
    frontmatter += '\nrequirements:';
    if (existing.requirements.bins?.length) {
      frontmatter += '\n  bins:';
      for (const bin of existing.requirements.bins) {
        frontmatter += `\n    - ${bin}`;
      }
    }
    if (existing.requirements.env?.length) {
      frontmatter += '\n  env:';
      for (const env of existing.requirements.env) {
        frontmatter += `\n    - ${env}`;
      }
    }
    if (existing.requirements.config?.length) {
      frontmatter += '\n  config:';
      for (const cfg of existing.requirements.config) {
        frontmatter += `\n    - ${cfg}`;
      }
    }
  }

  frontmatter += '\n---';

  // If skill already has SKILL.md content, replace frontmatter
  if (skill.skillMdContent) {
    const bodyMatch = skill.skillMdContent.match(/^---[\s\S]*?---\s*\n([\s\S]*)$/);
    if (bodyMatch) {
      return `${frontmatter}\n\n${bodyMatch[1]}`;
    }
    return `${frontmatter}\n\n${skill.skillMdContent}`;
  }

  // Generate basic SKILL.md from metadata
  return `${frontmatter}\n\n# ${skill.name}\n\n${skill.description}\n`;
}

function sanitizeOpenClawName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')  // Replace invalid chars with hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
    .substring(0, 64);             // Enforce max length
}
```

### 4.3 Conversion Pipeline Flow

```
ClawHub API
     |
     v
[Fetch Metadata] --> Quality Filter (section 3) --> [Fetch SKILL.md + Files]
                                                          |
                                                          v
                                                [Name Validation]
                                                (1-64 chars, lowercase,
                                                 no consecutive hyphens)
                                                          |
                                                          v
                                              [Threat Intel Blocklist]
                                              (SHA-256 vs threat_indicators
                                               table, Clawdex cross-ref)
                                               /               \
                                            CLEAN           BLOCKED
                                              |                |
                                              v                v
                                    [Full Static Analysis]  [Auto-Quarantine]
                                    (93 rules from Task #2)
                                     /        |        \
                                  safe/    warning   dangerous/
                                 low_risk    |       malicious
                                   |         |          |
                                   v         v          v
                          [Format Convert] [Import +  [Quarantine +
                                   |       Flag for   Manual Review]
                                   |       Review]
                                   v         |
                          [Create ZIP -> R2] |
                                   |         |
                                   v         v
                          [Insert into D1 with
                           security_score cached]
                                   |
                                   v
                          [Available in Marketplace
                           with security badge]
```

---

## 5. Security Audit Integration Point

> This section integrates with the security audit system designed in `docs/openclaw-security-audit-design.md` (Task #2, completed).

### 5.1 Integration Architecture

The import pipeline calls the `analyzeSkill()` function from `apps/api/src/services/securityAnalyzer.ts` as a mandatory gate. The security audit system uses these types (from the security audit design):

```typescript
// From apps/api/src/services/securityAnalyzer.ts (Task #2)

interface Finding {
  ruleId: string;         // e.g., "SA-001"
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;       // e.g., "payload-delivery", "credential-harvesting"
  title: string;
  description: string;
  evidence: string;       // The matched content (truncated)
  line?: number;          // Line number in SKILL.md
  filePath?: string;      // If in a bundled file
  confidence: 'high' | 'medium' | 'low';
}

type RiskScore = 'safe' | 'low_risk' | 'warning' | 'dangerous' | 'malicious';

interface SecurityReport {
  skillId: string;
  scanVersion: string;       // Engine version for re-scan tracking
  scannedAt: Date;
  overallScore: RiskScore;
  findings: Finding[];
  metadata: {
    rulesChecked: number;
    contentLength: number;
    bundledFileCount: number;
    scanDurationMs: number;
  };
}

async function analyzeSkill(
  skillMdContent: string,
  bundledFiles?: { path: string; content: string }[],
  options?: { skipRules?: string[] }
): Promise<SecurityReport>;
```

### 5.2 Import Gate Logic

The import pipeline uses the security audit's risk scoring:

- **`safe` or `low_risk`**: Import proceeds automatically
- **`warning`**: Import proceeds but skill is flagged for manual review (enters the `security_reviews` queue)
- **`dangerous`**: Import blocked, skill sent to quarantine, manual review required before import
- **`malicious`**: Import blocked permanently, skill sent to quarantine, auto-reject

```typescript
async function importSkillWithAudit(
  meta: ClawHubSkillMeta,
  skillMd: string,
  files: { path: string; content: string; size: number }[],
  db: Database,
  bucket: R2Bucket
): Promise<{ success: boolean; skillId?: string; report: SecurityReport }> {

  // Step 1: Cross-reference against threat_indicators table (Clawdex blocklist)
  const contentHash = await computeSha256(skillMd);
  const isBlocked = await checkThreatIndicators(db, contentHash, meta.name);
  if (isBlocked) {
    const blockedReport = createBlockedReport(meta, 'Matched known threat indicator');
    await recordQuarantinedSkill(db, meta, blockedReport);
    return { success: false, report: blockedReport };
  }

  // Step 2: Run full static analysis
  const bundledFiles = files.map(f => ({ path: f.path, content: f.content }));
  const report = await analyzeSkill(skillMd, bundledFiles);

  // Step 3: Record scan result in security_scans table
  const scanId = generateId();
  const now = new Date();
  await db.insert(securityScans).values({
    id: scanId,
    skillId: meta.id, // temporary; updated after skill insert
    scanVersion: report.scanVersion,
    overallScore: report.overallScore,
    findingsJson: JSON.stringify(report.findings),
    findingsCount: report.findings.length,
    criticalCount: report.findings.filter(f => f.severity === 'critical').length,
    highCount: report.findings.filter(f => f.severity === 'high').length,
    mediumCount: report.findings.filter(f => f.severity === 'medium').length,
    lowCount: report.findings.filter(f => f.severity === 'low').length,
    scanDurationMs: report.metadata.scanDurationMs,
    scannedAt: now,
  });

  // Step 4: Gate on risk score
  if (report.overallScore === 'malicious') {
    await recordQuarantinedSkill(db, meta, report);
    return { success: false, report };
  }

  if (report.overallScore === 'dangerous') {
    await recordQuarantinedSkill(db, meta, report);
    // Create review entry so admin can manually approve
    await db.insert(securityReviews).values({
      id: generateId(),
      skillId: meta.id,
      scanId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    return { success: false, report };
  }

  // Step 5: Import the skill (safe, low_risk, or warning)
  const skill = convertClawHubToSkill(meta, skillMd, files);
  // ... create ZIP, upload to R2, insert into D1 ...

  // Step 6: If warning, queue for review but still import
  if (report.overallScore === 'warning') {
    await db.insert(securityReviews).values({
      id: generateId(),
      skillId: skill.id,
      scanId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
  }

  return { success: true, skillId: skill.id, report };
}
```

### 5.3 Quarantine Integration

Skills that fail the security audit use the `quarantined_skills` table (also defined in section 6). Additionally, the security audit system adds `is_quarantined`, `quarantined_at`, and `quarantine_reason` columns to the main `skills` table (per the security audit design).

For imported skills that are quarantined before insertion into the `skills` table, the `quarantined_skills` table serves as a holding area. When an admin approves a quarantined import via `POST /api/security/reviews/:id` with status `approved`, the import pipeline resumes and inserts the skill into the `skills` table.

### 5.4 Re-Audit on Version Sync

When re-syncing an imported skill (section 9.2), if the upstream SKILL.md content has changed, the new version must pass a fresh security audit before the local copy is updated. If the new version fails, the existing imported version is preserved but flagged with a `version_audit_failed` status.

---

## 6. Database Schema Additions

### 6.1 New Tables

Add the following tables to `apps/api/src/db/schema.ts`:

```typescript
// Track imported skills and their source
export const skillImports = sqliteTable('skill_imports', {
  id: text('id').primaryKey(),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  source: text('source').notNull().default('clawhub'),  // 'clawhub', 'github', etc.
  sourceId: text('source_id').notNull(),                 // ID on the source platform
  sourceUrl: text('source_url').notNull(),
  sourceAuthor: text('source_author').notNull(),
  sourceStars: integer('source_stars').notNull().default(0),
  sourceForks: integer('source_forks').notNull().default(0),
  sourceDownloads: integer('source_downloads').notNull().default(0),
  sourceVersion: text('source_version'),
  qualityScore: integer('quality_score').notNull().default(0),  // 0-100
  auditStatus: text('audit_status').notNull().default('pending'), // 'pending', 'passed', 'failed', 'quarantined'
  auditResultJson: text('audit_result_json'),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp_ms' }),
  importedAt: integer('imported_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => ({
  sourceUnique: unique().on(table.source, table.sourceId),
}));

// Quarantined skills that failed security audit
export const quarantinedSkills = sqliteTable('quarantined_skills', {
  id: text('id').primaryKey(),
  source: text('source').notNull().default('clawhub'),
  sourceId: text('source_id').notNull(),
  sourceUrl: text('source_url').notNull(),
  author: text('author').notNull(),
  name: text('name').notNull(),
  skillMdContent: text('skill_md_content'),
  auditScore: text('audit_score').notNull(),            // 'warning' or 'dangerous'
  auditFindingsJson: text('audit_findings_json'),
  reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp_ms' }),
  reviewDecision: text('review_decision'),              // 'approved', 'rejected', 'needs-changes'
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

// Import job tracking (batch imports)
export const importJobs = sqliteTable('import_jobs', {
  id: text('id').primaryKey(),
  initiatedBy: text('initiated_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  source: text('source').notNull().default('clawhub'),
  status: text('status').notNull().default('pending'),  // 'pending', 'running', 'completed', 'failed', 'cancelled'
  totalSkills: integer('total_skills').notNull().default(0),
  importedCount: integer('imported_count').notNull().default(0),
  failedCount: integer('failed_count').notNull().default(0),
  quarantinedCount: integer('quarantined_count').notNull().default(0),
  skippedCount: integer('skipped_count').notNull().default(0),  // duplicates
  filterCriteria: text('filter_criteria'),               // JSON of quality filters used
  errorLog: text('error_log'),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});
```

### 6.2 New Type Exports

```typescript
export type SkillImport = typeof skillImports.$inferSelect;
export type NewSkillImport = typeof skillImports.$inferInsert;
export type QuarantinedSkill = typeof quarantinedSkills.$inferSelect;
export type ImportJob = typeof importJobs.$inferSelect;
```

### 6.3 Migration SQL

```sql
-- migrations/0005_skill_imports.sql

CREATE TABLE skill_imports (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'clawhub',
  source_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_author TEXT NOT NULL,
  source_stars INTEGER NOT NULL DEFAULT 0,
  source_forks INTEGER NOT NULL DEFAULT 0,
  source_downloads INTEGER NOT NULL DEFAULT 0,
  source_version TEXT,
  quality_score INTEGER NOT NULL DEFAULT 0,
  audit_status TEXT NOT NULL DEFAULT 'pending',
  audit_result_json TEXT,
  last_synced_at INTEGER,
  imported_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  UNIQUE(source, source_id)
);

CREATE TABLE quarantined_skills (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'clawhub',
  source_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  author TEXT NOT NULL,
  name TEXT NOT NULL,
  skill_md_content TEXT,
  audit_score TEXT NOT NULL,
  audit_findings_json TEXT,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at INTEGER,
  review_decision TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE import_jobs (
  id TEXT PRIMARY KEY,
  initiated_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'clawhub',
  status TEXT NOT NULL DEFAULT 'pending',
  total_skills INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  quarantined_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  filter_criteria TEXT,
  error_log TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Indexes for common queries
CREATE INDEX idx_skill_imports_source ON skill_imports(source, source_id);
CREATE INDEX idx_skill_imports_skill ON skill_imports(skill_id);
CREATE INDEX idx_skill_imports_audit ON skill_imports(audit_status);
CREATE INDEX idx_quarantined_review ON quarantined_skills(review_decision);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
```

---

## 7. R2 Storage Plan for Bundled Assets

### 7.1 Storage Layout

```
R2 Bucket (BUCKET)
├── user-created/                    # Existing: user-composed skills
│   └── {skillId}/
│       └── skill.zip
├── imported/                        # NEW: imported skills
│   └── clawhub/
│       └── {author}/
│           └── {skill-name}/
│               ├── skill.zip        # Full skill package
│               └── metadata.json    # Import metadata snapshot
└── exports/                         # NEW: exported skill packages
    └── {skillId}/
        └── openclaw-skill.zip
```

### 7.2 ZIP Package Structure

Imported skill ZIPs follow this structure:

```
{skill-name}.zip
├── SKILL.md                         # Main skill file
├── scripts/                         # Optional: executable scripts
│   ├── helper.py
│   └── validate.sh
├── references/                      # Optional: reference docs
│   └── api-schema.md
├── assets/                          # Optional: templates, configs
│   └── config.yaml
└── .import-metadata.json            # Import tracking data
```

The `.import-metadata.json` contains:

```json
{
  "source": "clawhub",
  "sourceUrl": "https://clawhub.ai/skills/author/skill-name",
  "importedAt": "2026-02-07T10:00:00Z",
  "sourceVersion": "1.2.3",
  "qualityScore": 85,
  "auditPassed": true
}
```

### 7.3 Storage Operations

```typescript
// Upload imported skill ZIP to R2
async function uploadImportedSkill(
  bucket: R2Bucket,
  author: string,
  skillName: string,
  zipData: Uint8Array,
  metadata: Record<string, string>
): Promise<string> {
  const r2Key = `imported/clawhub/${author}/${skillName}/skill.zip`;

  await bucket.put(r2Key, zipData, {
    httpMetadata: { contentType: 'application/zip' },
    customMetadata: metadata,
  });

  // Also store metadata JSON for quick lookup
  const metadataKey = `imported/clawhub/${author}/${skillName}/metadata.json`;
  await bucket.put(metadataKey, JSON.stringify(metadata), {
    httpMetadata: { contentType: 'application/json' },
  });

  return r2Key;
}
```

---

## 8. API Endpoints for Import Management

### 8.1 Route Structure

New route file: `apps/api/src/routes/imports.ts`

Mounted at `/api/imports` in `apps/api/src/index.ts`.

### 8.2 Endpoints

```typescript
const importsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All import routes require auth + admin role (future: role-based access)
importsRouter.use('*', requireAuth);
```

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/imports/preview` | Preview skills available for import with quality scores | Admin |
| `POST` | `/api/imports/start` | Start a batch import job | Admin |
| `GET` | `/api/imports/jobs` | List import jobs with status | Admin |
| `GET` | `/api/imports/jobs/:id` | Get import job details and progress | Admin |
| `POST` | `/api/imports/jobs/:id/cancel` | Cancel a running import job | Admin |
| `GET` | `/api/imports/quarantine` | List quarantined skills | Admin |
| `POST` | `/api/imports/quarantine/:id/review` | Approve or reject quarantined skill | Admin |
| `POST` | `/api/imports/single` | Import a single skill by URL | Admin |
| `GET` | `/api/imports/stats` | Import statistics (counts by source, audit status) | Admin |
| `POST` | `/api/imports/sync` | Re-sync metadata for imported skills | Admin |
| `POST` | `/api/exports/:skillId` | Export a skill to OpenClaw format | Auth |
| `GET` | `/api/exports/:skillId/download` | Download exported OpenClaw package | Auth |

### 8.3 Key Endpoint Implementations

**Preview available skills:**

```typescript
importsRouter.post('/preview', async (c) => {
  const body = await c.req.json<{
    minStars?: number;
    minDownloads?: number;
    tags?: string[];
    limit?: number;
  }>();

  const clawHubSkills = await fetchClawHubSkills({
    sort: 'stars',
    minStars: body.minStars || 10,
    pageSize: body.limit || 50,
    tags: body.tags,
  });

  // Check which are already imported
  const db = createDb(c.env.DB);
  const existingImports = await db.select({ sourceId: skillImports.sourceId })
    .from(skillImports)
    .where(eq(skillImports.source, 'clawhub'));

  const existingIds = new Set(existingImports.map(i => i.sourceId));

  const preview = clawHubSkills.skills.map(skill => ({
    ...skill,
    qualityScore: calculateQualityScore(skill),
    alreadyImported: existingIds.has(skill.id),
    category: mapCategory(skill.tags),
  }));

  return c.json<ApiResponse<typeof preview>>({
    data: preview.filter(s => !s.alreadyImported),
    error: null,
  });
});
```

**Start batch import:**

```typescript
importsRouter.post('/start', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    skillIds: string[];      // ClawHub skill IDs to import
    filterCriteria?: {
      minStars?: number;
      minDownloads?: number;
      requireVerifiedAuthor?: boolean;
    };
  }>();

  const db = createDb(c.env.DB);
  const jobId = generateId();

  await db.insert(importJobs).values({
    id: jobId,
    initiatedBy: user.id,
    source: 'clawhub',
    status: 'pending',
    totalSkills: body.skillIds.length,
    filterCriteria: JSON.stringify(body.filterCriteria || {}),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Process imports asynchronously using Cloudflare Workers waitUntil
  // (c.executionCtx.waitUntil for background processing)
  c.executionCtx.waitUntil(processImportJob(jobId, body.skillIds, db, c.env.BUCKET, c.env));

  return c.json<ApiResponse<{ jobId: string }>>({
    data: { jobId },
    error: null,
  });
});
```

**Export skill to OpenClaw:**

```typescript
importsRouter.post('/exports/:skillId', async (c) => {
  const db = createDb(c.env.DB);
  const skillId = c.req.param('skillId');

  const skill = await db.select()
    .from(skills)
    .where(eq(skills.id, skillId))
    .get();

  if (!skill) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Skill not found' }, 404);
  }

  const openClawMd = convertSkillToOpenClaw(skill);

  // Create export ZIP
  const zipBuffer = createSkillZip(openClawMd);
  const r2Key = `exports/${skillId}/openclaw-skill.zip`;

  await c.env.BUCKET.put(r2Key, zipBuffer, {
    httpMetadata: { contentType: 'application/zip' },
  });

  return c.json<ApiResponse<{ downloadUrl: string; skillMd: string }>>({
    data: {
      downloadUrl: `/api/exports/${skillId}/download`,
      skillMd: openClawMd,
    },
    error: null,
  });
});
```

---

## 9. Duplicate Detection and Versioning

### 9.1 Duplicate Detection

Duplicates are detected at multiple levels:

**Level 1: Source ID match** -- Exact match on `(source, sourceId)` unique constraint in `skill_imports`:

```typescript
async function isDuplicate(db: Database, source: string, sourceId: string): Promise<boolean> {
  const existing = await db.select({ id: skillImports.id })
    .from(skillImports)
    .where(and(
      eq(skillImports.source, source),
      eq(skillImports.sourceId, sourceId)
    ))
    .get();
  return !!existing;
}
```

**Level 2: Content similarity** -- Detect skills that are forks or renamed copies by comparing SKILL.md content:

```typescript
function calculateContentHash(skillMd: string): string {
  // Strip frontmatter and whitespace for content-only comparison
  const body = skillMd.replace(/^---[\s\S]*?---\s*/, '').trim();
  // Use simple hash (Web Crypto API available in CF Workers)
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
}
```

**Level 3: Name collision** -- Skills with the same name from different authors:

```typescript
async function checkNameCollision(db: Database, name: string): Promise<Skill | null> {
  return db.select()
    .from(skills)
    .where(eq(skills.name, name))
    .get();
}
```

When a collision is detected:
1. **Same source + same ID**: Skip (already imported)
2. **Same source + different ID + similar content**: Flag as fork, skip if quality score is lower
3. **Different source + same name**: Import with disambiguated name (`{name}-clawhub`)

### 9.2 Versioning Strategy

Imported skills track their upstream version:

```typescript
async function syncImportedSkill(
  db: Database,
  bucket: R2Bucket,
  importRecord: SkillImport,
  env: Bindings
): Promise<{ updated: boolean; changes: string[] }> {
  const changes: string[] = [];

  // Fetch latest from source
  const latest = await fetchSkillContent(importRecord.sourceAuthor, /* name from record */);

  // Compare metadata
  const latestMeta = await fetchClawHubSkillMeta(importRecord.sourceId);

  if (latestMeta.stars !== importRecord.sourceStars) {
    changes.push(`stars: ${importRecord.sourceStars} -> ${latestMeta.stars}`);
  }
  if (latestMeta.version !== importRecord.sourceVersion) {
    changes.push(`version: ${importRecord.sourceVersion} -> ${latestMeta.version}`);

    // Re-run security audit on new version
    const auditResult = await runSecurityAudit(latest.skillMd, latest.files);
    if (!auditResult.passed) {
      // Quarantine the update
      await db.update(skillImports)
        .set({ auditStatus: 'quarantined', updatedAt: new Date() })
        .where(eq(skillImports.id, importRecord.id));
      return { updated: false, changes: ['QUARANTINED: new version failed security audit'] };
    }

    // Update skill content
    await db.update(skills)
      .set({
        skillMdContent: latest.skillMd,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, importRecord.skillId));

    // Update R2 ZIP
    // ... rebuild and upload ZIP ...
  }

  // Update import metadata
  await db.update(skillImports)
    .set({
      sourceStars: latestMeta.stars,
      sourceForks: latestMeta.forks,
      sourceDownloads: latestMeta.downloads,
      sourceVersion: latestMeta.version,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(skillImports.id, importRecord.id));

  // Also update the skills table stats
  await db.update(skills)
    .set({
      starsCount: latestMeta.stars,
      forksCount: latestMeta.forks,
      updatedAt: new Date(),
    })
    .where(eq(skills.id, importRecord.skillId));

  return { updated: changes.length > 0, changes };
}
```

---

## 10. Rollback Mechanisms

### 10.1 Single Skill Rollback

Remove an imported skill completely:

```typescript
async function rollbackImport(
  db: Database,
  bucket: R2Bucket,
  importId: string
): Promise<void> {
  const importRecord = await db.select()
    .from(skillImports)
    .where(eq(skillImports.id, importId))
    .get();

  if (!importRecord) throw new Error('Import record not found');

  // 1. Delete from R2
  await bucket.delete(importRecord.r2FileKey);
  const metadataKey = importRecord.r2FileKey.replace('skill.zip', 'metadata.json');
  await bucket.delete(metadataKey);

  // 2. Delete related data (cascades handle favorites, ratings, downloads)
  // The skill_imports record cascades from skills deletion
  await db.delete(skills).where(eq(skills.id, importRecord.skillId));

  // 3. The import record is cascade-deleted via skillId FK
}
```

### 10.2 Batch Rollback

Rollback an entire import job:

```typescript
async function rollbackImportJob(
  db: Database,
  bucket: R2Bucket,
  jobId: string
): Promise<{ rolledBack: number; errors: string[] }> {
  const job = await db.select()
    .from(importJobs)
    .where(eq(importJobs.id, jobId))
    .get();

  if (!job) throw new Error('Import job not found');

  // Find all skills imported in this job (via timestamp range)
  const imports = await db.select()
    .from(skillImports)
    .where(and(
      eq(skillImports.source, job.source),
      gte(skillImports.importedAt, job.startedAt),
      lte(skillImports.importedAt, job.completedAt || new Date())
    ));

  let rolledBack = 0;
  const errors: string[] = [];

  for (const imp of imports) {
    try {
      await rollbackImport(db, bucket, imp.id);
      rolledBack++;
    } catch (e) {
      errors.push(`Failed to rollback ${imp.sourceId}: ${e.message}`);
    }
  }

  // Update job status
  await db.update(importJobs)
    .set({ status: 'rolled_back', updatedAt: new Date() })
    .where(eq(importJobs.id, jobId));

  return { rolledBack, errors };
}
```

### 10.3 Soft Delete Option

Instead of hard-deleting, imported skills can be soft-hidden:

```typescript
// Use existing visibility field
await db.update(skills)
  .set({ visibility: 'hidden' })  // Add 'hidden' as a new visibility option
  .where(eq(skills.id, skillId));
```

This preserves data for potential re-import while hiding from the marketplace.

---

## 11. Recommended Initial Import List

Based on the VoltAgent awesome list and community adoption signals, these are the recommended skills for initial import, organized by category:

### 11.1 Tier 1: High Priority (import first)

| Category | Skill | Why |
|----------|-------|-----|
| **Development** | `commit-analyzer` | Universal git workflow, high stars |
| **Development** | `conventional-commits` | Standardized commit messages |
| **Development** | `github-pr` | PR creation and review |
| **Development** | `deepwiki` | Knowledge extraction from codebases |
| **ML/Data** | `huggingface-hub-cli` | HF ecosystem integration |
| **ML/Data** | `huggingface-datasets` | Dataset management |
| **Research** | `tavily-search` | Web search integration |
| **DevOps** | `sentry-agents-md` | AGENTS.md generation |
| **DevOps** | `claude-settings-audit` | Settings validation |

### 11.2 Tier 2: Medium Priority

| Category | Skill | Why |
|----------|-------|-----|
| **Writing** | `docx-generator` | Document creation |
| **Writing** | `pptx-generator` | Presentation creation |
| **Writing** | `xlsx-handler` | Spreadsheet operations |
| **Writing** | `pdf-handler` | PDF manipulation |
| **Writing** | `notion-integration` | Notion API interaction |
| **ML/Data** | `huggingface-evaluation` | Model evaluation |
| **ML/Data** | `huggingface-training` | Fine-tuning workflows |
| **Research** | `perplexity-search` | AI-powered search |
| **Research** | `serpapi-search` | Google search API |
| **Coding** | `code-review` | Automated code review |
| **DevOps** | `bug-finder` | Bug detection patterns |

### 11.3 Tier 3: Nice to Have

| Category | Skill | Why |
|----------|-------|-----|
| **Coding** | `ui-audit` | UI/UX accessibility review |
| **Coding** | `design-system-toolkit` | Design token management |
| **Automation** | `whatsapp-integration` | Messaging automation |
| **Automation** | `notebooklm-interaction` | Google NotebookLM |
| **Writing** | `ppt-generation` | Alternative PPT flow |

### 11.4 Import Order Strategy

1. Start with Tier 1 skills (9 skills) -- validates the pipeline end-to-end
2. Monitor for issues: security audit false positives, format conversion edge cases
3. Proceed to Tier 2 (11 skills) after confirming Tier 1 is clean
4. Tier 3 can be imported on-demand or in a later batch

**Estimated total initial import: ~25-30 skills**

---

## 12. Implementation Phases

### Phase 1: Foundation
- Add schema tables (`skill_imports`, `quarantined_skills`, `import_jobs`)
- Run migration
- Implement `clawHubClient.ts` service
- Implement `skillImporter.ts` with format conversion

### Phase 2: Core Pipeline
- Implement security audit integration point
- Build import pipeline with audit gate
- Implement R2 storage for imported skills
- Add `/api/imports/single` endpoint for testing with individual skills

### Phase 3: Batch Import
- Add `/api/imports/start` batch endpoint with `waitUntil` background processing
- Implement job tracking and progress reporting
- Add `/api/imports/preview` for pre-import review

### Phase 4: Export & Sync
- Implement AgentSkills-to-OpenClaw export
- Add `/api/exports` endpoints
- Implement periodic sync via Cloudflare Cron Triggers

### Phase 5: Admin UI
- Import management dashboard in web app
- Quarantine review interface
- Import job monitoring

---

## 13. Open Questions

1. **ClawHub API availability**: The ClawHub API details are based on reasonable assumptions. The actual API endpoints and authentication may differ -- needs verification against live API documentation.

2. **Rate limits on batch import**: Cloudflare Workers have a 30-second CPU time limit per request. Large batch imports will need to use `waitUntil` for background processing and may need to be split across multiple invocations or use Durable Objects for long-running jobs.

3. **Admin role system**: The current auth system has no role differentiation. Import management endpoints need an admin role check, which is not yet implemented. Options:
   - Simple: Hardcode admin email addresses in worker secrets
   - Better: Add `role` column to `users` table

4. **Bidirectional sync conflicts**: If a skill is imported and then modified locally (rated, favorited, etc.), how do we handle upstream updates that conflict? Current design: upstream metadata (stars, forks) always overrides, but local data (ratings, favorites) is preserved.

5. **ClawHub Terms of Service**: Verify that bulk importing skills from ClawHub is permitted under their terms of service. The system should respect their API usage guidelines and attribution requirements.
