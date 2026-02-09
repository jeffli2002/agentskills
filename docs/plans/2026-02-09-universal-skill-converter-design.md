# Universal Skill Converter - Design Document

**Date**: 2026-02-09
**Status**: Approved

## Overview

AgentSkills becomes a universal skill converter: import skills from any source, validate against the OpenClaw spec, preview the result, and optionally publish -- all in one flow. This positions OpenClaw conversion as a high-value differentiator for the platform.

## Phases

### Phase 1: Fix Multi-File Export Pipeline

The current system can generate multi-file skills (SKILL.md + scripts, references, assets) but every export path drops the additional files. Fix this before building the converter.

#### A. OpenClaw Export Endpoint

**File**: `apps/api/src/routes/skills.ts` (`/api/skills/:id/export/openclaw`)

Current: returns plain text SKILL.md only.

Change to:
- Query `skillCreationOutputs.resourcesJson` for resource files.
- If resources exist: return a ZIP containing `SKILL.md` + all resource files with preserved directory structure.
- If no resources: return single SKILL.md as plain text (backwards compatible).
- Set `Content-Type` accordingly: `text/markdown` for single-file, `application/zip` for multi-file.

#### B. Download Endpoint

**File**: `apps/api/src/routes/skills.ts` (`/api/skills/:id/download`)

Current: for user-created skills, generates ZIP with SKILL.md only; ignores `resourcesJson`.

Change to:
- Query `skillCreationOutputs.resourcesJson` and include resource files in the ZIP alongside SKILL.md.
- R2-stored skills (GitHub imports) already return full ZIPs -- no change needed.

#### C. CLI Installer

**File**: `packages/cli/src/installer.ts`

Current: writes only SKILL.md.

Change to:
- Detect response content type (markdown vs ZIP).
- If ZIP: extract all files into the skill directory, preserving structure (e.g., `~/.openclaw/skills/skill-name/scripts/helper.py`).
- If plain markdown: write SKILL.md as before.

#### D. Validation

- Enforce that the skill directory name matches the `name` frontmatter field.
- Validate resource paths don't escape the skill directory (no `../` traversal).

---

### Phase 2: Universal Converter

#### New Route: `/convert`

Added to main navigation between "Browse" and "CLI".

#### Page Layout

**Zone 1: Input Selector** (top)

Four tabs in a segmented control, terminal-card style:

| Tab | Input UI | Backend Action |
|-----|----------|----------------|
| Paste / Upload | Text area + drag-and-drop zone. Accepts `.md`, `.txt`, `.yaml`, or `.zip` | Parse directly |
| GitHub Import | URL input field | API fetches repo, finds skill files |
| Marketplace Skill | Search autocomplete against 770+ skills | Fetches skill by ID |
| AI Generate | Links to existing `/create` Skill Composer with OpenClaw compliance badge | Existing composer flow |

**Zone 2: Pipeline Progress** (middle)

Horizontal 3-step indicator: **Convert** > **Validate** > **Preview**. Each step lights up on completion. Uses amber numbered circles consistent with CLI page styling.

**Zone 3: Results** (bottom)

- Left panel: Terminal-style SKILL.md preview (reuse `SkillMdPreview` component) + file tree for multi-file skills.
- Right panel: Validation checklist with green checks / amber warnings, compliance score, and action buttons (Download ZIP, Copy, Publish).

#### GitHub Import Flow

1. Parse URL to extract `owner/repo` and optional subdirectory path.
2. Use GitHub public API to fetch repo file tree (`GET /repos/:owner/:repo/git/trees/main?recursive=1`).
3. Prioritize: `SKILL.md` > `README.md` > other `.md` files.
4. Collect files in `scripts/`, `references/`, `assets/` directories if present.
5. If unambiguous (single SKILL.md found): proceed directly to Convert step.
6. If multiple candidates: show file picker with radio buttons.
7. Private repos not supported -- show clear message.
8. Monorepo support via subdirectory in URL (e.g., `github.com/user/repo/tree/main/skills/git-commit`).

#### API Endpoints

All under `/api/converter/`:

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/api/converter/paste` | POST | `{ content, filename? }` | ConversionResult |
| `/api/converter/github` | POST | `{ url, subpath? }` | File list or ConversionResult |
| `/api/converter/github/pick` | POST | `{ url, file }` | ConversionResult |
| `/api/converter/skill/:id` | GET | Skill ID | ConversionResult |
| `/api/converter/validate` | POST | `{ content }` | Validation checklist + score |
| `/api/converter/publish` | POST | `{ content, resources?, visibility }` | Published skill ID |

**Auth**: Only `/publish` requires login. All other endpoints work without auth.

#### Conversion Response Shape

```typescript
interface ConversionResult {
  skillMd: string;
  resources: { path: string; content: string; description: string }[];
  validation: {
    score: number;
    checks: {
      field: string;
      passed: boolean;
      message: string;
      autoFixed: boolean;
    }[];
  };
  original: {
    source: 'paste' | 'github' | 'marketplace' | 'composer';
    name?: string;
  };
}
```

#### CLI `convert` Command

**Usage:**

```bash
npx agentskills convert ./my-skill.md              # Convert local file
npx agentskills convert https://github.com/user/repo  # Convert from GitHub
npx agentskills convert ./my-skill.md --install     # Convert and install
npx agentskills convert ./my-skill.md --install -g  # Convert and install globally
```

**Flow:**
1. Detect source type (local path vs URL).
2. Local files: read content, POST to `/api/converter/paste`.
3. GitHub URLs: POST to `/api/converter/github`.
4. Display validation results in terminal.
5. Write converted files to current directory, or install directly with `--install`.

#### Enhanced Existing Pages

**Homepage (`/`)**:
- Add "Universal Skill Converter" feature card in hero section.
- Update subtitle to mention conversion.

**Skill Detail Page (`/skills/:id`)**:
- Replace "Export to OpenClaw" button with "Convert to OpenClaw" linking to `/convert?skill=:id`.

**CLI Page (`/cli`)**:
- Add `convert` to commands table.

**Header Navigation**:
- Add "Convert" link between "Browse" and "CLI".

**`/skills/:id/openclaw`**:
- Stays functional for backwards compatibility; primary flow shifts to `/convert?skill=:id`.

## File Structure (New/Modified)

```
apps/
  api/src/
    routes/
      converter.ts          # NEW: /api/converter/* endpoints
      skills.ts             # MODIFIED: multi-file export fix
    services/
      formatConverter.ts    # MODIFIED: handle resources
  web/src/
    pages/
      ConvertPage.tsx       # NEW: /convert page
    components/
      converter/
        InputTabs.tsx       # NEW: tab selector (paste/github/marketplace/ai)
        PasteInput.tsx      # NEW: paste/upload input
        GithubImport.tsx    # NEW: github URL input + file picker
        SkillSearch.tsx     # NEW: marketplace skill autocomplete
        PipelineProgress.tsx # NEW: 3-step progress indicator
        ValidationReport.tsx # NEW: checklist + score
        FileTree.tsx        # NEW: multi-file tree display
packages/
  cli/src/
    cli.ts                  # MODIFIED: add convert command
    installer.ts            # MODIFIED: ZIP extraction
    api.ts                  # MODIFIED: converter API calls
```
