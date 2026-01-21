# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the planning and documentation repository for the **Agent Skills Marketplace** - a community-driven marketplace for AI agent skills targeting Claude Code, Codex CLI, and similar tools. The project is in pre-development phase with no code implemented yet.

## Repository Structure

- `AGENT_SKILLS_PRD.md` - Product Requirements Document (business model, roadmap, pricing)
- `TECHNICAL_STACK_EVALUATION.md` - Technical architecture decisions and stack evaluation
- `MVP_INCENTIVE_MECHANISM_REVISED.md` - Non-monetary creator incentive system design
- `Competitive Analysis_*.md` - Competitive landscape analysis (SkillsMP, SkillForge)

## Planned Technical Stack

**Frontend**: React 19, Tailwind CSS 4, shadcn/ui, Wouter, Vite 7
**Backend**: Node.js 22, Express, Drizzle ORM, TypeScript
**Database**: PostgreSQL 14+
**File Storage**: Cloudflare R2
**Package Manager**: pnpm

## Key Architecture Decisions

- MVP-first approach: 8-10 week timeline with phased feature rollout
- GitHub skill aggregation via API (scraping public repositories with agent skills)
- Community features as primary differentiator (ratings, reviews, creator profiles)
- Non-monetary incentives for MVP phase (badges, leaderboards, recognition)
- Enterprise monetization focus initially, transitioning to creator monetization in Phase 2

## Development Commands (Future)

When code is implemented, expected commands will be:
```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server
pnpm db:push          # Push database schema changes
pnpm build            # Production build
```

## Business Context

- Target: 1,000+ skills, 5,000+ users, 50%+ 30-day retention by Month 3
- Competitors: SkillsMP (77K skills, no community features), SkillForge (job marketplace focus)
- Differentiation: Community-driven curation, creator recognition, quality scoring
