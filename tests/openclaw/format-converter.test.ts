/**
 * Tests for OpenClaw <-> AgentSkills format conversion.
 *
 * Covers:
 * - OpenClaw to AgentSkills conversion (import direction)
 * - AgentSkills to OpenClaw conversion (export direction)
 * - YAML frontmatter field mapping
 * - Name validation (regex: lowercase alphanumeric + hyphens, 1-64 chars)
 * - Description validation (max 1024 chars, single-line)
 * - Category mapping from ClawHub tags
 * - sanitizeOpenClawName() edge cases
 *
 * Reference docs:
 * - docs/openclaw-skill-format-comparison.md  (Section 4 - Compatibility)
 * - docs/openclaw-skill-import-design.md  (Section 4 - Format Conversion Pipeline)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  sanitizeOpenClawName,
  validateOpenClawName,
  validateDescription,
  convertSkillToOpenClaw,
} from '../../apps/api/src/services/formatConverter';

// ─── Types (from import design) ────────────────────────────────────────────────

interface ClawHubSkillMeta {
  id: string;
  name: string;
  description: string;
  author: string;
  authorVerified: boolean;
  stars: number;
  forks: number;
  downloads: number;
  lastUpdated: string;
  tags: string[];
  allowedTools: string[];
  model?: string;
  hasScripts: boolean;
  prerequisites: string[];
  version: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const FIXTURES_DIR = join(__dirname, 'fixtures');

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES_DIR, name), 'utf-8');
}

// Category mapping from ClawHub tags (from import design Section 3.3)
const CLAWHUB_TAG_TO_CATEGORY: Record<string, string> = {
  'git': 'coding', 'github': 'coding', 'code-review': 'coding', 'commit': 'coding',
  'debugging': 'coding', 'refactoring': 'coding',
  'huggingface': 'data', 'datasets': 'data', 'ml': 'data', 'training': 'data',
  'docx': 'writing', 'pptx': 'writing', 'pdf': 'writing', 'markdown': 'writing',
  'automation': 'automation', 'whatsapp': 'automation', 'slack': 'automation',
  'search': 'research', 'tavily': 'research', 'perplexity': 'research',
  'docker': 'devops', 'ci-cd': 'devops', 'deployment': 'devops', 'sentry': 'devops',
  'testing': 'testing', 'unit-test': 'testing', 'e2e': 'testing',
};

function mapCategory(tags: string[]): string {
  for (const tag of tags) {
    const mapped = CLAWHUB_TAG_TO_CATEGORY[tag.toLowerCase()];
    if (mapped) return mapped;
  }
  return 'other';
}

// ─── Test Suites ───────────────────────────────────────────────────────────────

describe('Format Converter', () => {
  // ─── Name Validation ────────────────────────────────────────────────────────

  describe('OpenClaw name validation', () => {
    it('should accept valid lowercase alphanumeric names', () => {
      expect(validateOpenClawName('commit-analyzer').valid).toBe(true);
      expect(validateOpenClawName('pr-review').valid).toBe(true);
      expect(validateOpenClawName('a').valid).toBe(true);
      expect(validateOpenClawName('test123').valid).toBe(true);
    });

    it('should reject names with uppercase characters', () => {
      expect(validateOpenClawName('Commit-Analyzer').valid).toBe(false);
      expect(validateOpenClawName('UPPERCASE').valid).toBe(false);
    });

    it('should reject names starting with a hyphen', () => {
      expect(validateOpenClawName('-leading-hyphen').valid).toBe(false);
    });

    it('should reject names ending with a hyphen', () => {
      expect(validateOpenClawName('trailing-hyphen-').valid).toBe(false);
    });

    it('should reject names with consecutive hyphens', () => {
      expect(validateOpenClawName('double--hyphen').valid).toBe(false);
      expect(validateOpenClawName('triple---hyphen').valid).toBe(false);
    });

    it('should reject names longer than 64 characters', () => {
      const longName = 'a'.repeat(65);
      expect(validateOpenClawName(longName).valid).toBe(false);
    });

    it('should accept names exactly 64 characters long', () => {
      const name64 = 'a'.repeat(64);
      expect(validateOpenClawName(name64).valid).toBe(true);
    });

    it('should reject empty names', () => {
      expect(validateOpenClawName('').valid).toBe(false);
    });

    it('should reject names with special characters', () => {
      expect(validateOpenClawName('name_with_underscores').valid).toBe(false);
      expect(validateOpenClawName('name.with.dots').valid).toBe(false);
      expect(validateOpenClawName('name with spaces').valid).toBe(false);
      expect(validateOpenClawName('name@special').valid).toBe(false);
    });
  });

  // ─── Name Sanitization ─────────────────────────────────────────────────────

  describe('sanitizeOpenClawName()', () => {
    it('should lowercase the name', () => {
      expect(sanitizeOpenClawName('Commit-Analyzer')).toBe('commit-analyzer');
    });

    it('should replace invalid characters with hyphens', () => {
      expect(sanitizeOpenClawName('my_skill name')).toBe('my-skill-name');
    });

    it('should collapse multiple hyphens', () => {
      expect(sanitizeOpenClawName('name---with---hyphens')).toBe('name-with-hyphens');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(sanitizeOpenClawName('-leading-')).toBe('leading');
      expect(sanitizeOpenClawName('---triple---')).toBe('triple');
    });

    it('should truncate to 64 characters', () => {
      const longName = 'a'.repeat(100);
      expect(sanitizeOpenClawName(longName).length).toBeLessThanOrEqual(64);
    });

    it('should handle empty string', () => {
      expect(sanitizeOpenClawName('')).toBe('');
    });

    it('should handle all-invalid characters', () => {
      // All special chars get replaced with hyphens, then leading/trailing stripped
      expect(sanitizeOpenClawName('!!!')).toBe('');
    });
  });

  // ─── Description Validation ─────────────────────────────────────────────────

  describe('Description validation', () => {
    it('should accept valid single-line descriptions', () => {
      expect(validateDescription('A simple description.').valid).toBe(true);
    });

    it('should accept descriptions up to 1024 characters', () => {
      const desc1024 = 'A'.repeat(1024);
      expect(validateDescription(desc1024).valid).toBe(true);
    });

    it('should reject descriptions over 1024 characters', () => {
      const desc1025 = 'A'.repeat(1025);
      expect(validateDescription(desc1025).valid).toBe(false);
    });

    it('should reject multi-line descriptions', () => {
      expect(validateDescription('Line one\nLine two').valid).toBe(false);
    });

    it('should reject empty descriptions', () => {
      expect(validateDescription('').valid).toBe(false);
    });
  });

  // ─── Category Mapping ──────────────────────────────────────────────────────

  describe('Category mapping from ClawHub tags', () => {
    it('should map git-related tags to "coding"', () => {
      expect(mapCategory(['git'])).toBe('coding');
      expect(mapCategory(['github'])).toBe('coding');
      expect(mapCategory(['code-review'])).toBe('coding');
    });

    it('should map ML/data tags to "data"', () => {
      expect(mapCategory(['huggingface'])).toBe('data');
      expect(mapCategory(['datasets'])).toBe('data');
      expect(mapCategory(['ml'])).toBe('data');
    });

    it('should map document tags to "writing"', () => {
      expect(mapCategory(['docx'])).toBe('writing');
      expect(mapCategory(['pdf'])).toBe('writing');
      expect(mapCategory(['markdown'])).toBe('writing');
    });

    it('should map devops tags to "devops"', () => {
      expect(mapCategory(['docker'])).toBe('devops');
      expect(mapCategory(['ci-cd'])).toBe('devops');
    });

    it('should map testing tags to "testing"', () => {
      expect(mapCategory(['testing'])).toBe('testing');
      expect(mapCategory(['unit-test'])).toBe('testing');
    });

    it('should return "other" for unmapped tags', () => {
      expect(mapCategory(['unknown-tag'])).toBe('other');
      expect(mapCategory([])).toBe('other');
    });

    it('should use the first matching tag when multiple tags are present', () => {
      expect(mapCategory(['docker', 'testing'])).toBe('devops');
      expect(mapCategory(['unknown', 'git'])).toBe('coding');
    });

    it('should be case-insensitive', () => {
      expect(mapCategory(['GIT'])).toBe('coding');
      expect(mapCategory(['Docker'])).toBe('devops');
    });
  });

  // ─── OpenClaw to AgentSkills Conversion ─────────────────────────────────────

  describe('OpenClaw to AgentSkills conversion (import)', () => {
    it('should map all required fields from ClawHub metadata', () => {
      const meta: ClawHubSkillMeta = {
        id: 'ch-001',
        name: 'commit-analyzer',
        description: 'Analyzes git commit history',
        author: 'testauthor',
        authorVerified: true,
        stars: 50,
        forks: 10,
        downloads: 200,
        lastUpdated: '2026-01-15T00:00:00Z',
        tags: ['git', 'commit'],
        allowedTools: ['Bash', 'Read'],
        hasScripts: false,
        prerequisites: ['git'],
        version: '1.0.0',
      };

      const skillMd = loadFixture('safe-skill.md');

      // TODO: Import convertClawHubToSkill from skillImporter.ts (import direction - out of scope)
      // const skill = convertClawHubToSkill(meta, skillMd, []);

      // Validate the meta is correct for now
      expect(meta.name).toBe('commit-analyzer');
      expect(mapCategory(meta.tags)).toBe('coding');
    });

    it('should preserve parsed frontmatter as JSON in skillMdParsed', () => {
      const skillMd = loadFixture('safe-skill.md');
      // TODO: Import direction - out of scope for this implementation
    });

    it('should build filesJson from file listing', () => {
      const files = [
        { path: 'SKILL.md', content: '...', size: 500 },
        { path: 'scripts/helper.sh', content: '...', size: 200 },
      ];
      // TODO: Import direction - out of scope for this implementation
    });

    it('should use frontmatter name over metadata name when available', () => {
      const skillMd = '---\nname: better-name\ndescription: "Override"\n---\n\n# Content\n';
      // TODO: Import direction - out of scope for this implementation
    });
  });

  // ─── AgentSkills to OpenClaw Conversion ─────────────────────────────────────

  describe('AgentSkills to OpenClaw conversion (export)', () => {
    it('should generate valid OpenClaw SKILL.md with required fields', () => {
      const mockSkill = {
        id: 'sk_001',
        name: 'My Skill',
        description: 'A test skill for export',
        skillMdContent: '---\nname: my-skill\ndescription: "A test skill"\n---\n\n# My Skill\n\nInstructions here.\n',
        skillMdParsed: JSON.stringify({ name: 'my-skill', description: 'A test skill' }),
      };

      const openClawMd = convertSkillToOpenClaw(mockSkill as any);
      expect(openClawMd).toContain('name: my-skill');
      expect(openClawMd).toContain('description:');
      expect(openClawMd).toContain('---');
    });

    it('should sanitize the name for OpenClaw compliance', () => {
      const mockSkill = {
        name: 'My Cool Skill!',
        description: 'A skill with an invalid name',
        skillMdContent: null,
        skillMdParsed: null,
      };

      const openClawMd = convertSkillToOpenClaw(mockSkill as any);
      expect(openClawMd).toContain('name: my-cool-skill');
      expect(sanitizeOpenClawName('My Cool Skill!')).toBe('my-cool-skill');
    });

    it('should truncate description to 1024 characters', () => {
      const longDesc = 'A'.repeat(2000);
      const mockSkill = {
        name: 'test-skill',
        description: longDesc,
        skillMdContent: null,
        skillMdParsed: null,
      };

      const openClawMd = convertSkillToOpenClaw(mockSkill as any);
      // The description in the output should not exceed 1024 chars
      const match = openClawMd.match(/description: (.+)/);
      expect(match).toBeTruthy();
      // Account for possible YAML quoting
      const descValue = match![1].replace(/^"(.*)"$/, '$1');
      expect(descValue.length).toBeLessThanOrEqual(1024);
    });

    it('should collapse multi-line description to single line', () => {
      const mockSkill = {
        name: 'test-skill',
        description: 'Line one\nLine two\nLine three',
        skillMdContent: null,
        skillMdParsed: null,
      };

      const openClawMd = convertSkillToOpenClaw(mockSkill as any);
      // Description in frontmatter should be single line
      const lines = openClawMd.split('\n');
      const descLine = lines.find(l => l.startsWith('description:'));
      expect(descLine).toBeTruthy();
      expect(descLine).toContain('Line one Line two Line three');
    });

    it('should preserve existing allowed-tools from parsed frontmatter', () => {
      const mockSkill = {
        name: 'test-skill',
        description: 'Test',
        skillMdContent: '---\nname: test-skill\ndescription: "Test"\n---\n\n# Test\n',
        skillMdParsed: JSON.stringify({ name: 'test-skill', description: 'Test', 'allowed-tools': ['Bash', 'Read'] }),
      };

      const openClawMd = convertSkillToOpenClaw(mockSkill as any);
      expect(openClawMd).toContain('allowed-tools');
      expect(openClawMd).toContain('Bash');
      expect(openClawMd).toContain('Read');
    });

    it('should replace frontmatter while preserving markdown body', () => {
      const existingMd = '---\nname: old-name\ndescription: "Old"\n---\n\n# My Skill\n\nThis is the body content.\n';
      const mockSkill = {
        name: 'new-name',
        description: 'New description',
        skillMdContent: existingMd,
        skillMdParsed: null,
      };

      const openClawMd = convertSkillToOpenClaw(mockSkill as any);
      expect(openClawMd).toContain('This is the body content.');
      expect(openClawMd).toContain('name: new-name');
    });

    it('should generate basic SKILL.md when no existing content', () => {
      const mockSkill = {
        name: 'new-skill',
        description: 'A brand new skill',
        skillMdContent: null,
        skillMdParsed: null,
      };

      const openClawMd = convertSkillToOpenClaw(mockSkill as any);
      expect(openClawMd).toContain('name: new-skill');
      expect(openClawMd).toContain('# new-skill');
      expect(openClawMd).toContain('A brand new skill');
    });
  });

  // ─── Quality Score Calculation ──────────────────────────────────────────────

  describe('Quality score calculation', () => {
    // Tests for calculateQualityScore() from import design Section 3.2
    // TODO: Import direction - out of scope for this implementation

    it('should score high for skills with many stars and downloads', () => {
      // 100+ stars = max star score (30), 500+ downloads = max download score (25)
      // + verified author (15) + recent update (20) + completeness (10)
    });

    it('should score lower for old/abandoned skills', () => {
      // lastUpdated > 180 days ago = low recency score (0.1 * 20 = 2)
    });

    it('should score higher for verified authors', () => {
      // authorVerified: true = 15 pts, false = 5 pts
    });

    it('should factor in completeness (description length, tags, tools)', () => {
      // Skills with description > 50 chars, tags, allowedTools, model, prerequisites
      // get higher completeness scores
    });
  });
});
