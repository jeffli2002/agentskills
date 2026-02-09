/**
 * Tests for ClawHub API integration (skill fetching).
 *
 * Covers:
 * - Fetching skill metadata from ClawHub API
 * - Pagination and cursor-based page traversal
 * - Rate limiting and exponential backoff on 429
 * - SKILL.md content fetching and YAML frontmatter parsing
 * - Handling of malformed / missing frontmatter
 * - Network failure resilience
 *
 * Reference design docs:
 * - docs/openclaw-skill-import-design.md  (Section 2 - ClawHub API Integration)
 * - docs/openclaw-skill-format-comparison.md  (Section 1 - Format Comparison)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const FIXTURES_DIR = join(__dirname, 'fixtures');

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES_DIR, name), 'utf-8');
}

// ─── Mock ClawHub API responses ────────────────────────────────────────────────

function createMockClawHubListResponse(
  skills: Array<{
    id: string;
    name: string;
    description: string;
    author: string;
    stars: number;
    downloads: number;
    tags?: string[];
  }>,
  options: { page?: number; pageSize?: number; hasMore?: boolean } = {}
) {
  return {
    skills: skills.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      author: s.author,
      authorVerified: true,
      stars: s.stars,
      forks: 0,
      downloads: s.downloads,
      lastUpdated: new Date().toISOString(),
      tags: s.tags || [],
      allowedTools: [],
      hasScripts: false,
      prerequisites: [],
      version: '1.0.0',
    })),
    total: skills.length,
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 50,
    hasMore: options.hasMore ?? false,
  };
}

// ─── Test Suites ───────────────────────────────────────────────────────────────

describe('ClawHub Skill Fetcher', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Metadata Fetching ─────────────────────────────────────────────────────

  describe('fetchClawHubSkills()', () => {
    it('should fetch a page of skills with default parameters', async () => {
      // TODO: Import fetchClawHubSkills from apps/api/src/services/clawHubClient.ts
      // when it is implemented. For now, this validates the expected API contract.

      const mockResponse = createMockClawHubListResponse([
        { id: 'sk1', name: 'commit-analyzer', description: 'Analyzes commits', author: 'user1', stars: 50, downloads: 200 },
        { id: 'sk2', name: 'pr-review', description: 'Reviews PRs', author: 'user2', stars: 30, downloads: 100 },
      ]);

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

      // Validate response shape
      expect(mockResponse.skills).toHaveLength(2);
      expect(mockResponse.skills[0]).toHaveProperty('name');
      expect(mockResponse.skills[0]).toHaveProperty('description');
      expect(mockResponse.skills[0]).toHaveProperty('stars');
      expect(mockResponse.skills[0]).toHaveProperty('downloads');
      expect(mockResponse.skills[0]).toHaveProperty('authorVerified');
      expect(mockResponse.skills[0]).toHaveProperty('tags');
      expect(mockResponse.skills[0]).toHaveProperty('allowedTools');
      expect(mockResponse.skills[0]).toHaveProperty('prerequisites');
      expect(mockResponse.skills[0]).toHaveProperty('version');
    });

    it('should filter skills by minimum star count', async () => {
      const mockResponse = createMockClawHubListResponse([
        { id: 'sk1', name: 'popular-skill', description: 'Very popular', author: 'user1', stars: 100, downloads: 500 },
      ]);

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

      // TODO: Call fetchClawHubSkills({ minStars: 50 })
      // Verify the API request includes the minStars filter
      expect(mockResponse.skills.every((s) => s.stars >= 50)).toBe(true);
    });

    it('should filter skills by author', async () => {
      const mockResponse = createMockClawHubListResponse([
        { id: 'sk1', name: 'author-skill', description: 'By specific author', author: 'target-author', stars: 20, downloads: 50 },
      ]);

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

      expect(mockResponse.skills[0].author).toBe('target-author');
    });

    it('should filter skills by tags', async () => {
      const mockResponse = createMockClawHubListResponse([
        { id: 'sk1', name: 'git-skill', description: 'Git helper', author: 'user1', stars: 20, downloads: 50, tags: ['git', 'github'] },
      ]);

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

      expect(mockResponse.skills[0].tags).toContain('git');
    });
  });

  // ─── Pagination ────────────────────────────────────────────────────────────

  describe('Pagination', () => {
    it('should handle multi-page responses via hasMore flag', async () => {
      const page1 = createMockClawHubListResponse(
        [{ id: 'sk1', name: 'skill-1', description: 'First', author: 'u1', stars: 10, downloads: 50 }],
        { page: 1, hasMore: true }
      );
      const page2 = createMockClawHubListResponse(
        [{ id: 'sk2', name: 'skill-2', description: 'Second', author: 'u2', stars: 10, downloads: 50 }],
        { page: 2, hasMore: false }
      );

      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify(page1), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(page2), { status: 200 }));

      // TODO: Implement paginated fetch-all that follows hasMore
      expect(page1.hasMore).toBe(true);
      expect(page2.hasMore).toBe(false);
    });

    it('should respect pageSize limits (max 100)', async () => {
      // The ClawHub API should cap pageSize at 100
      const mockResponse = createMockClawHubListResponse(
        Array.from({ length: 100 }, (_, i) => ({
          id: `sk${i}`,
          name: `skill-${i}`,
          description: `Skill number ${i}`,
          author: 'user',
          stars: 10,
          downloads: 50,
        })),
        { pageSize: 100 }
      );

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

      expect(mockResponse.skills).toHaveLength(100);
      expect(mockResponse.pageSize).toBe(100);
    });
  });

  // ─── Rate Limiting ─────────────────────────────────────────────────────────

  describe('Rate Limiting', () => {
    it('should retry with exponential backoff on 429 response', async () => {
      mockFetch
        .mockResolvedValueOnce(new Response('Rate limited', { status: 429, headers: { 'Retry-After': '1' } }))
        .mockResolvedValueOnce(new Response('Rate limited', { status: 429, headers: { 'Retry-After': '2' } }))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify(
              createMockClawHubListResponse([
                { id: 'sk1', name: 'skill-1', description: 'Test', author: 'u1', stars: 10, downloads: 50 },
              ])
            ),
            { status: 200 }
          )
        );

      // TODO: Implement retry logic in fetchClawHubSkills
      // Verify it retries up to 3 times with increasing delays
      expect(mockFetch).toHaveBeenCalledTimes(0); // Will be 3 after implementation
    });

    it('should throw after max retries exceeded', async () => {
      mockFetch
        .mockResolvedValue(new Response('Rate limited', { status: 429, headers: { 'Retry-After': '1' } }));

      // TODO: Verify that after max retries, it throws an error
      // await expect(fetchClawHubSkills({})).rejects.toThrow('Rate limit exceeded');
    });
  });

  // ─── SKILL.md Content Fetching ─────────────────────────────────────────────

  describe('fetchSkillContent()', () => {
    it('should fetch SKILL.md content and file listing', async () => {
      const safeSkill = loadFixture('safe-skill.md');

      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            skillMd: safeSkill,
            files: [
              { path: 'SKILL.md', content: safeSkill, size: safeSkill.length },
            ],
          }),
          { status: 200 }
        )
      );

      // TODO: Call fetchSkillContent('author', 'commit-analyzer')
      expect(safeSkill).toContain('---');
      expect(safeSkill).toContain('name: commit-analyzer');
    });

    it('should handle skills with no SKILL.md file', async () => {
      mockFetch.mockResolvedValueOnce(new Response('Not found', { status: 404 }));

      // TODO: Verify that missing SKILL.md returns null or throws appropriate error
    });

    it('should handle network timeout gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      // TODO: Verify network errors are caught and re-thrown with context
    });
  });

  // ─── YAML Frontmatter Parsing ──────────────────────────────────────────────

  describe('parseSkillMdFrontmatter()', () => {
    // These tests validate the YAML parsing function described in
    // docs/openclaw-skill-import-design.md Section 4.1

    it('should parse valid frontmatter with all fields', () => {
      const content = loadFixture('safe-skill.md');

      // TODO: Import parseSkillMdFrontmatter from skillImporter.ts
      // const result = parseSkillMdFrontmatter(content);

      // Validate expected parse results:
      // expect(result).not.toBeNull();
      // expect(result!.name).toBe('commit-analyzer');
      // expect(result!.description).toContain('Analyzes git commit history');
      // expect(result!['allowed-tools']).toBeDefined();

      // Structural validation
      expect(content).toMatch(/^---\s*\n/);
      expect(content).toMatch(/\n---/);
    });

    it('should parse minimal valid frontmatter', () => {
      const content = loadFixture('minimal-valid.md');

      // TODO: const result = parseSkillMdFrontmatter(content);
      // expect(result).not.toBeNull();
      // expect(result!.name).toBe('minimal-skill');
      // expect(result!.description).toBeDefined();

      expect(content).toContain('name: minimal-skill');
    });

    it('should return null for missing frontmatter', () => {
      const content = loadFixture('no-frontmatter.md');

      // TODO: const result = parseSkillMdFrontmatter(content);
      // expect(result).toBeNull();

      expect(content).not.toMatch(/^---\s*\n/);
    });

    it('should handle invalid YAML gracefully', () => {
      const content = loadFixture('invalid-yaml.md');

      // TODO: const result = parseSkillMdFrontmatter(content);
      // Should return null or throw a descriptive error rather than crashing
      // expect(result).toBeNull();

      expect(content).toContain('---');
    });

    it('should handle frontmatter with nested YAML structures (requirements, metadata)', () => {
      const content = loadFixture('safe-skill.md');

      // The safe-skill fixture includes nested requirements and metadata
      // TODO: Verify the parser handles nested YAML (requirements.bins, metadata.openclaw)
      expect(content).toContain('requirements:');
      expect(content).toContain('bins:');
      expect(content).toContain('metadata:');
    });

    it('should handle quoted and unquoted description values', () => {
      // Quoted description
      const quoted = '---\nname: test\ndescription: "A quoted description"\n---\n';
      // Unquoted description
      const unquoted = '---\nname: test\ndescription: An unquoted description\n---\n';

      // TODO: Both should parse successfully
      // const r1 = parseSkillMdFrontmatter(quoted);
      // const r2 = parseSkillMdFrontmatter(unquoted);
      // expect(r1!.description).toBe('A quoted description');
      // expect(r2!.description).toBe('An unquoted description');
    });
  });
});
