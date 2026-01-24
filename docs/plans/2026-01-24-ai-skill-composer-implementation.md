# AI Skill Composer - Implementation Plan

**Design Document:** `docs/plans/2026-01-24-ai-skill-composer-design.md`
**Target:** MVP (Phase 1)

---

## Phase 1: Database & Schema (Day 1)

### Task 1.1: Create migration for new tables
- [ ] Add `skill_creations` table
- [ ] Add `skill_creation_steps` table
- [ ] Add `skill_creation_sources` table
- [ ] Add `skill_creation_outputs` table
- [ ] Add indexes for performance (user_id, creation_id, step_id)
- [ ] Add `view_count` column to skills table if missing

### Task 1.2: Update Drizzle schema
- [ ] Define new tables in `apps/api/src/db/schema.ts`
- [ ] Add TypeScript types for new entities
- [ ] Run migration and verify

---

## Phase 2: API Endpoints (Days 2-3)

### Task 2.1: Create skill generation service
- [ ] Create `apps/api/src/services/skillComposer.ts`
- [ ] Implement `buildTopSkillsContext()` - fetch top skills for AI context
- [ ] Implement `generateSkill()` - call Claude API
- [ ] Implement `parseAIResponse()` - extract steps and sources
- [ ] Add error handling for API failures

### Task 2.2: Create API routes
- [ ] Create `apps/api/src/routes/composer.ts`
- [ ] `POST /api/skills/generate` - generate new skill
- [ ] `POST /api/skills/generate/:id/regenerate` - regenerate with feedback
- [ ] `PUT /api/skills/generate/:id` - save edited content
- [ ] `POST /api/skills/generate/:id/publish` - publish to marketplace
- [ ] `GET /api/skills/generate/drafts` - list user drafts

### Task 2.3: Add authentication & rate limiting
- [ ] Require login for all composer endpoints
- [ ] Implement rate limiting (10 requests/hour/user)
- [ ] Add request validation (prompt length, etc.)

---

## Phase 3: Claude API Integration (Day 4)

### Task 3.1: Setup Claude API client
- [ ] Add `@anthropic-ai/sdk` to API dependencies
- [ ] Create `apps/api/src/services/claude.ts`
- [ ] Configure API key via environment variable
- [ ] Implement `callClaude()` with retry logic

### Task 3.2: Implement skill generation prompt
- [ ] Create system prompt template
- [ ] Build context from top skills (limit tokens)
- [ ] Parse structured JSON response
- [ ] Handle edge cases (invalid JSON, missing fields)

---

## Phase 4: Frontend - Page Layout (Day 5)

### Task 4.1: Create page and routing
- [ ] Create `apps/web/src/pages/CreateSkillPage.tsx`
- [ ] Add route `/skills/create` in `App.tsx`
- [ ] Require authentication (redirect to login if not signed in)

### Task 4.2: Create layout component
- [ ] Create `apps/web/src/components/skill-composer/ComposerLayout.tsx`
- [ ] Implement 3-panel responsive layout
- [ ] Left panel: 40% width
- [ ] Right panel: 60% width
- [ ] Bottom panel: collapsible

---

## Phase 5: Frontend - Input Panel (Day 5.5)

### Task 5.1: Build InputPanel component
- [ ] Create `apps/web/src/components/skill-composer/InputPanel.tsx`
- [ ] Textarea with placeholder and character count
- [ ] Category dropdown (fetch from API)
- [ ] Generate button with gold styling
- [ ] Loading state with spinner

### Task 5.2: Add "Inspired by" section
- [ ] Display after generation completes
- [ ] Show skill names with views and ratings
- [ ] Link to skill detail pages

---

## Phase 6: Frontend - Canvas Panel (Days 6-7)

### Task 6.1: Build CanvasPanel component
- [ ] Create `apps/web/src/components/skill-composer/CanvasPanel.tsx`
- [ ] Scrollable container with zoom controls
- [ ] Empty state with placeholder message

### Task 6.2: Build WorkflowNode component
- [ ] Create `apps/web/src/components/skill-composer/WorkflowNode.tsx`
- [ ] Step header (number + title)
- [ ] Description text
- [ ] Utilized skills section with SourceBadge

### Task 6.3: Build SourceBadge component
- [ ] Create `apps/web/src/components/skill-composer/SourceBadge.tsx`
- [ ] Skill name, view count, rating
- [ ] "Why" explanation text
- [ ] Click to open skill in new tab

### Task 6.4: Build ConnectionLine component
- [ ] Create `apps/web/src/components/skill-composer/ConnectionLine.tsx`
- [ ] Vertical line with arrow
- [ ] Consistent spacing between nodes

---

## Phase 7: Frontend - Preview Panel (Day 8)

### Task 7.1: Build PreviewPanel component
- [ ] Create `apps/web/src/components/skill-composer/PreviewPanel.tsx`
- [ ] Markdown rendering with `react-markdown`
- [ ] Syntax highlighting for code blocks
- [ ] Collapse/expand toggle
- [ ] Copy to clipboard button

### Task 7.2: Add edit mode
- [ ] Toggle between view and edit modes
- [ ] Editable textarea when in edit mode
- [ ] Save changes to API

---

## Phase 8: Publish Flow (Day 9)

### Task 8.1: Build publish dialog
- [ ] Confirm skill name and description
- [ ] Show preview of how it will appear
- [ ] Publish button calls API

### Task 8.2: Handle publish success
- [ ] Show success message
- [ ] Redirect to new skill page
- [ ] Clear composer state

---

## Phase 9: Entry Points & Polish (Day 10)

### Task 9.1: Add navigation entry points
- [ ] Add "Create Skill" button to Header (logged-in users)
- [ ] Add CTA on homepage
- [ ] Add button on favorites empty state

### Task 9.2: Loading & error states
- [ ] Skeleton loading for canvas
- [ ] Error toast for API failures
- [ ] Retry button for failed generations

### Task 9.3: Responsive design
- [ ] Stack panels vertically on mobile
- [ ] Adjust font sizes and spacing
- [ ] Test on 375px, 768px, 1024px, 1440px

---

## Environment Variables Required

```env
# Add to apps/api/.env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Dependencies to Add

```bash
# API
cd apps/api && pnpm add @anthropic-ai/sdk

# Web (if not already installed)
cd apps/web && pnpm add react-markdown prism-react-renderer
```

---

## Testing Checklist

- [ ] Generate skill with valid prompt
- [ ] Generate skill with category filter
- [ ] Regenerate with feedback
- [ ] Edit and save SKILL.md
- [ ] Publish skill successfully
- [ ] View published skill on marketplace
- [ ] Rate limiting works (10/hour)
- [ ] Unauthenticated users redirected to login
- [ ] Mobile responsive layout

---

## Rollout Plan

1. **Dev testing** - Test locally with mock Claude responses
2. **Staging** - Deploy with real Claude API, limited users
3. **Production** - Full release with rate limiting active
