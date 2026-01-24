# AI Skill Composer - Design Document

**Date:** 2026-01-24
**Status:** Approved
**Author:** Jeff Li + Claude

## Overview

AI Skill Composer is an intelligent skill creation tool that helps users build high-quality agent skills by learning from the best existing skills in the marketplace.

**Core Principle:** AI does the work, canvas provides visibility.

### User Journey

1. **Describe** - User types what skill they want in plain language
2. **Generate** - AI analyzes top marketplace skills, creates complete SKILL.md with workflow steps
3. **Visualize** - Canvas displays the skill as a step-by-step workflow diagram
4. **Review** - User reads each step's description, understands what the skill does
5. **Refine** (optional) - User can edit the generated text or ask AI to adjust
6. **Publish** - Skill goes live on marketplace

### Key Decisions

| Aspect | Decision |
|--------|----------|
| **Interaction** | AI generates everything, canvas visualizes |
| **AI Provider** | Claude API (server-side) |
| **Data storage** | Full storage in DB (not GitHub-dependent) |
| **Canvas** | Read-only workflow visualization (MVP) |
| **Node content** | Step + description + utilized skills + why |
| **Publishing** | Instant publish, async review |
| **Ownership** | Single owner (submitter) |

---

## UI Design

### Page Layout

**Route:** `/skills/create`

```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                         [Create Skill]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CREATE YOUR SKILL                                       │   │
│  │  Describe what you want, AI builds it for you            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │   INPUT PANEL (40%)      │  │   CANVAS PANEL (60%)       │  │
│  │   - Text input area      │  │   - Workflow visualization │  │
│  │   - Generate button      │  │   - Step nodes with desc   │  │
│  │   - Inspired by list     │  │   - Source attributions    │  │
│  └──────────────────────────┘  └────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PREVIEW PANEL (collapsible)                             │   │
│  │  Full SKILL.md with syntax highlighting                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                              [Edit] [Regenerate] [Publish]      │
└─────────────────────────────────────────────────────────────────┘
```

### Input Panel

Left panel (40% width) - User describes their skill.

**Components:**
- Textarea with placeholder (500 char limit)
- Category dropdown (optional)
- Generate button (gold accent)
- "Inspired by" list (shows after generation)

**States:**
- Empty - Placeholder text, button disabled
- Ready - User typed, button enabled
- Generating - Loading spinner, "Analyzing skills..."
- Complete - Shows inspired-by list, canvas populates

### Canvas Panel

Right panel (60% width) - Visual workflow of the generated skill.

**Node Structure:**

```
┌───────────────────────────────────────────────────────────┐
│  STEP 1: Scan Project Files                               │
│  ───────────────────────────────────────────────────────  │
│  Reads all source files and identifies code patterns      │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  📦 Utilized: code-scanner                           │ │
│  │     👁 12.5k views  ·  ★ 4.8                          │ │
│  │                                                       │ │
│  │  Why: Using file traversal and pattern matching      │ │
│  │  logic from this skill's recursive scan method       │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

**Each node shows:**
- Step number + title
- Description of what the step does
- Utilized skill(s) with view count and rating
- Why that skill is being utilized (which part)

**Features (MVP):**
- Vertical flow layout
- Zoom in/out
- Click node to highlight in preview
- Pan/scroll for long workflows

### Preview Panel

Bottom panel (collapsible) - Full generated SKILL.md.

**Features:**
- Syntax highlighted markdown
- Step linking (click to highlight in canvas)
- Copy button
- Collapse/expand toggle
- Attribution footer listing all utilized skills
- Edit mode (toggle to editable textarea)

---

## Data Model

### New Tables

```sql
-- Main creation record
CREATE TABLE skill_creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  prompt TEXT NOT NULL,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, deleted
  generated_at TIMESTAMP,
  published_at TIMESTAMP,
  skill_id UUID REFERENCES skills(id), -- linked after publish
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow steps
CREATE TABLE skill_creation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creation_id UUID NOT NULL REFERENCES skill_creations(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Source skill attributions per step
CREATE TABLE skill_creation_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES skill_creation_steps(id) ON DELETE CASCADE,
  source_skill_id UUID NOT NULL REFERENCES skills(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generated outputs (supports versioning)
CREATE TABLE skill_creation_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creation_id UUID NOT NULL REFERENCES skill_creations(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  skill_md TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships

```
skill_creations
    └── skill_creation_steps (1:many)
            └── skill_creation_sources (1:many per step)
    └── skill_creation_outputs (1:many versions)
    └── skills (1:1 after publish)
```

---

## API Endpoints

### POST /api/skills/generate

Generate a new skill using AI.

**Request:**
```json
{
  "prompt": "A skill that reviews code for security issues",
  "category": "Security"
}
```

**Response:**
```json
{
  "creationId": "uuid",
  "skillMd": "# Security Code Reviewer\n...",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Scan Project Files",
      "description": "Reads all source files...",
      "sources": [
        {
          "skillId": "uuid",
          "skillName": "code-scanner",
          "views": 12500,
          "rating": 4.8,
          "reason": "Using file traversal and pattern matching..."
        }
      ]
    }
  ]
}
```

### POST /api/skills/generate/:creationId/regenerate

Regenerate with adjusted prompt or feedback.

**Request:**
```json
{
  "feedback": "Make it focus more on SQL injection"
}
```

### PUT /api/skills/generate/:creationId

Save edited SKILL.md content.

**Request:**
```json
{
  "skillMd": "# Modified content..."
}
```

### POST /api/skills/generate/:creationId/publish

Publish skill to marketplace.

**Request:**
```json
{
  "name": "Security Code Reviewer",
  "description": "Reviews code for vulnerabilities..."
}
```

**Response:**
```json
{
  "skillId": "uuid",
  "url": "/skills/security-code-reviewer"
}
```

### GET /api/skills/generate/drafts

List user's unpublished skill drafts.

**Authentication:** All endpoints require logged-in user (Google OAuth).

**Rate Limiting:** Generate/Regenerate limited to 10 requests per hour per user.

---

## AI Integration

### Claude API Setup

```typescript
const SYSTEM_PROMPT = `You are an expert AI skill designer for Claude Code.

Your task: Generate a high-quality SKILL.md based on the user's request.

You have access to these top-rated skills from the marketplace:
{topSkillsContext}

For each step in the workflow:
1. Identify which existing skill(s) best inform this step
2. Extract relevant patterns, structures, or approaches
3. Explain WHY you're utilizing that skill

Output JSON format:
{
  "name": "Skill Name",
  "description": "One-line description",
  "skillMd": "Full SKILL.md content...",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step Title",
      "description": "What this step does",
      "sources": [
        {
          "skillId": "uuid",
          "reason": "Why this skill is utilized for this step"
        }
      ]
    }
  ]
}`;
```

### Context Building

```typescript
async function buildTopSkillsContext(category?: string): Promise<string> {
  // Fetch top 20 skills by rating + views
  const topSkills = await db.query(`
    SELECT id, name, description, skill_md_content,
           avg_rating, view_count
    FROM skills
    WHERE category = COALESCE($1, category)
    ORDER BY (avg_rating * 0.4 + LOG(view_count) * 0.6) DESC
    LIMIT 20
  `, [category]);

  // Format as context for Claude
  return topSkills.map(s => `
--- SKILL: ${s.name} (${s.view_count} views, ★${s.avg_rating}) ---
${s.skill_md_content}
---`).join('\n\n');
}
```

### Token Management

- Top skills context: ~15k tokens max
- User prompt: ~500 tokens
- Output: ~3k tokens
- Total per request: ~20k tokens

---

## Frontend Components

### File Structure

```
apps/web/src/
├── pages/
│   └── CreateSkillPage.tsx
│
├── components/skill-composer/
│   ├── index.ts
│   ├── ComposerLayout.tsx
│   ├── InputPanel.tsx
│   ├── CanvasPanel.tsx
│   ├── PreviewPanel.tsx
│   ├── WorkflowNode.tsx
│   ├── SourceBadge.tsx
│   └── ConnectionLine.tsx
```

### Dependencies

- Canvas rendering: Pure CSS + Flexbox (MVP)
- Markdown preview: `react-markdown`
- Syntax highlighting: `prism-react-renderer`

---

## Implementation Phases

### Phase 1 - MVP (Core Flow)

| Task | Effort |
|------|--------|
| Database schema + migrations | 1 day |
| API endpoints (generate, publish) | 2 days |
| Claude API integration | 1 day |
| CreateSkillPage layout | 1 day |
| InputPanel component | 0.5 day |
| CanvasPanel with nodes | 2 days |
| PreviewPanel with markdown | 1 day |
| Publish flow | 1 day |
| **Total MVP** | **~9-10 days** |

### Phase 2 - Polish

- Regenerate with feedback
- Save drafts
- Edit mode for preview
- Loading states and animations
- Error handling

### Phase 3 - Enhancement

- Interactive canvas (drag to reorder)
- Branching workflows
- Skill versioning

---

## Entry Points

How users access the composer:

1. **Header button** - "Create Skill" in main navigation (logged-in users)
2. **Homepage CTA** - Button in hero or features section
3. **Empty state** - When user has no favorites: "Create your first skill"

```tsx
// Header.tsx addition
{user && (
  <Link href="/skills/create">
    <Button className="text-gold border-gold">
      ✨ Create Skill
    </Button>
  </Link>
)}
```

---

## Security Considerations

- **Authentication:** All creation endpoints require login
- **Rate limiting:** 10 generations per hour per user
- **Content moderation:** Async review after publish
- **API key protection:** Claude API key stored server-side only
- **Input sanitization:** Validate prompt length and content

---

## Success Metrics

- Number of skills created via composer
- Publish rate (drafts → published)
- Quality score of AI-generated skills (ratings)
- User retention (return to create more)
