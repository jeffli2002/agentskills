// Seed script for Agent Skills Marketplace
// Run with: npx tsx apps/api/src/scripts/seed.ts > seed.sql
// Then: wrangler d1 execute agentskills-db --local --file=./seed.sql

const escapeSQL = (value: string): string => value.replace(/'/g, "''");

interface SkillFile {
  path: string;
  name: string;
  size: number;
  type: 'file' | 'folder';
}

interface SeedSkill {
  id: string;
  name: string;
  description: string;
  author: string;
  author_avatar_url: string;
  github_url: string;
  stars_count: number;
  forks_count: number;
  category: string;
  r2_file_key: string;
  file_size: number;
  last_commit_at: number;
  files: SkillFile[];
  skill_md_parsed: Record<string, string>;
  skill_md_content: string;
}

// Sample files structure for skills
const createSampleFiles = (skillName: string): SkillFile[] => [
  { path: 'SKILL.md', name: 'SKILL.md', size: 2048, type: 'file' },
  { path: 'README.md', name: 'README.md', size: 4096, type: 'file' },
  { path: 'src', name: 'src', size: 0, type: 'folder' },
  { path: 'src/index.ts', name: 'index.ts', size: 1024, type: 'file' },
  { path: 'src/utils.ts', name: 'utils.ts', size: 512, type: 'file' },
  { path: 'package.json', name: 'package.json', size: 256, type: 'file' },
  { path: 'tsconfig.json', name: 'tsconfig.json', size: 128, type: 'file' },
];

// Real skills data scraped from GitHub (January 2026)
// Now includes new fields: author_avatar_url, forks_count, last_commit_at, files, skill_md
const SEED_SKILLS: SeedSkill[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Awesome MCP Servers',
    description: 'A collection of MCP servers for extending AI agent capabilities with external tools and data sources.',
    author: 'punkpeye',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
    github_url: 'https://github.com/punkpeye/awesome-mcp-servers',
    stars_count: 79400,
    forks_count: 8200,
    category: 'devops',
    r2_file_key: 'skills/awesome-mcp-servers/skill.zip',
    file_size: 329728,
    last_commit_at: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    files: createSampleFiles('awesome-mcp-servers'),
    skill_md_parsed: {
      name: 'Awesome MCP Servers',
      description: 'A curated collection of MCP servers',
      version: '1.0.0',
      author: 'punkpeye',
      license: 'MIT',
    },
    skill_md_content: '# Awesome MCP Servers\n\nA curated collection of MCP servers for extending AI capabilities.',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'MCP Servers',
    description: 'Model Context Protocol Servers - Official reference implementations for connecting AI models to external tools.',
    author: 'modelcontextprotocol',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
    github_url: 'https://github.com/modelcontextprotocol/servers',
    stars_count: 76700,
    forks_count: 12300,
    category: 'coding',
    r2_file_key: 'skills/mcp-servers/skill.zip',
    file_size: 490700,
    last_commit_at: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    files: [
      { path: 'SKILL.md', name: 'SKILL.md', size: 3072, type: 'file' },
      { path: 'README.md', name: 'README.md', size: 8192, type: 'file' },
      { path: 'servers', name: 'servers', size: 0, type: 'folder' },
      { path: 'servers/filesystem', name: 'filesystem', size: 0, type: 'folder' },
      { path: 'servers/github', name: 'github', size: 0, type: 'folder' },
      { path: 'servers/slack', name: 'slack', size: 0, type: 'folder' },
      { path: 'package.json', name: 'package.json', size: 512, type: 'file' },
    ],
    skill_md_parsed: {
      name: 'MCP Servers',
      description: 'Official MCP server implementations',
      version: '2.1.0',
      author: 'modelcontextprotocol',
      license: 'Apache-2.0',
    },
    skill_md_content: '# MCP Servers\n\nOfficial reference implementations for the Model Context Protocol.',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Claude Code',
    description: 'An agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster through natural language commands.',
    author: 'anthropics',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/3456789',
    github_url: 'https://github.com/anthropics/claude-code',
    stars_count: 58800,
    forks_count: 5400,
    category: 'coding',
    r2_file_key: 'skills/claude-code/skill.zip',
    file_size: 11178598,
    last_commit_at: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
    files: [
      { path: 'SKILL.md', name: 'SKILL.md', size: 4096, type: 'file' },
      { path: 'README.md', name: 'README.md', size: 12288, type: 'file' },
      { path: 'src', name: 'src', size: 0, type: 'folder' },
      { path: 'src/cli', name: 'cli', size: 0, type: 'folder' },
      { path: 'src/agents', name: 'agents', size: 0, type: 'folder' },
      { path: 'src/tools', name: 'tools', size: 0, type: 'folder' },
      { path: 'docs', name: 'docs', size: 0, type: 'folder' },
      { path: 'package.json', name: 'package.json', size: 1024, type: 'file' },
      { path: 'tsconfig.json', name: 'tsconfig.json', size: 256, type: 'file' },
    ],
    skill_md_parsed: {
      name: 'Claude Code',
      description: 'Agentic coding in your terminal',
      version: '1.0.25',
      author: 'anthropics',
      license: 'MIT',
    },
    skill_md_content: '# Claude Code\n\nAn agentic coding tool that lives in your terminal.\n\n## Features\n- Natural language commands\n- Codebase understanding\n- Multi-file editing',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Cline',
    description: 'Autonomous coding agent right in your IDE, capable of creating/editing files, executing commands, using the browser, and more.',
    author: 'cline',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/4567890',
    github_url: 'https://github.com/cline/cline',
    stars_count: 57000,
    forks_count: 4800,
    category: 'coding',
    r2_file_key: 'skills/cline/skill.zip',
    file_size: 7951974,
    last_commit_at: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    files: createSampleFiles('cline'),
    skill_md_parsed: {
      name: 'Cline',
      description: 'Autonomous coding agent for your IDE',
      version: '3.2.1',
      author: 'cline',
      license: 'Apache-2.0',
    },
    skill_md_content: '# Cline\n\nAutonomous coding agent right in your IDE.',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Mem0',
    description: 'Universal memory layer for AI Agents - persistent memory and state management for agentic workflows.',
    author: 'mem0ai',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/5678901',
    github_url: 'https://github.com/mem0ai/mem0',
    stars_count: 45800,
    forks_count: 3200,
    category: 'data',
    r2_file_key: 'skills/mem0/skill.zip',
    file_size: 22083788,
    last_commit_at: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    files: createSampleFiles('mem0'),
    skill_md_parsed: {
      name: 'Mem0',
      description: 'Universal memory layer for AI Agents',
      version: '0.9.5',
      author: 'mem0ai',
      license: 'MIT',
    },
    skill_md_content: '# Mem0\n\nUniversal memory layer for AI Agents.\n\n## Features\n- Persistent memory\n- State management\n- Cross-session context',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Awesome Claude Code',
    description: 'A curated list of awesome skills, hooks, slash-commands, agent orchestrators, applications, and plugins for Claude Code.',
    author: 'hesreallyhim',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/6789012',
    github_url: 'https://github.com/hesreallyhim/awesome-claude-code',
    stars_count: 21200,
    forks_count: 1800,
    category: 'research',
    r2_file_key: 'skills/awesome-claude-code/skill.zip',
    file_size: 3186892,
    last_commit_at: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
    files: [
      { path: 'SKILL.md', name: 'SKILL.md', size: 1024, type: 'file' },
      { path: 'README.md', name: 'README.md', size: 16384, type: 'file' },
      { path: 'skills', name: 'skills', size: 0, type: 'folder' },
      { path: 'hooks', name: 'hooks', size: 0, type: 'folder' },
      { path: 'plugins', name: 'plugins', size: 0, type: 'folder' },
    ],
    skill_md_parsed: {
      name: 'Awesome Claude Code',
      description: 'Curated list of Claude Code resources',
      version: '1.2.0',
      author: 'hesreallyhim',
      license: 'CC0-1.0',
    },
    skill_md_content: '# Awesome Claude Code\n\nA curated list of awesome skills, hooks, and plugins for Claude Code.',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'MCP Agent',
    description: 'Build effective agents using Model Context Protocol and simple workflow patterns.',
    author: 'lastmile-ai',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/7890123',
    github_url: 'https://github.com/lastmile-ai/mcp-agent',
    stars_count: 8000,
    forks_count: 620,
    category: 'automation',
    r2_file_key: 'skills/mcp-agent/skill.zip',
    file_size: 20975923,
    last_commit_at: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
    files: createSampleFiles('mcp-agent'),
    skill_md_parsed: {
      name: 'MCP Agent',
      description: 'Build effective agents with MCP',
      version: '0.5.0',
      author: 'lastmile-ai',
      license: 'MIT',
    },
    skill_md_content: '# MCP Agent\n\nBuild effective agents using Model Context Protocol.',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Awesome Claude Skills',
    description: 'A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows — particularly Claude Code.',
    author: 'travisvn',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/8901234',
    github_url: 'https://github.com/travisvn/awesome-claude-skills',
    stars_count: 5500,
    forks_count: 380,
    category: 'research',
    r2_file_key: 'skills/awesome-claude-skills-travisvn/skill.zip',
    file_size: 11469,
    last_commit_at: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    files: [
      { path: 'SKILL.md', name: 'SKILL.md', size: 512, type: 'file' },
      { path: 'README.md', name: 'README.md', size: 8192, type: 'file' },
    ],
    skill_md_parsed: {
      name: 'Awesome Claude Skills',
      description: 'Curated Claude Skills resources',
      version: '1.0.0',
      author: 'travisvn',
      license: 'MIT',
    },
    skill_md_content: '# Awesome Claude Skills\n\nA curated list of awesome Claude Skills and resources.',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Claude Code Skills Marketplace',
    description: 'Professional Claude Code skills marketplace featuring production-ready skills for enhanced development workflows.',
    author: 'daymade',
    author_avatar_url: 'https://avatars.githubusercontent.com/u/9012345',
    github_url: 'https://github.com/daymade/claude-code-skills',
    stars_count: 358,
    forks_count: 42,
    category: 'coding',
    r2_file_key: 'skills/daymade-skills/skill.zip',
    file_size: 9805005,
    last_commit_at: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2 weeks ago
    files: createSampleFiles('claude-code-skills'),
    skill_md_parsed: {
      name: 'Claude Code Skills Marketplace',
      description: 'Production-ready Claude Code skills',
      version: '2.0.0',
      author: 'daymade',
      license: 'MIT',
    },
    skill_md_content: '# Claude Code Skills Marketplace\n\nProfessional Claude Code skills for enhanced development workflows.',
  },
];

// Generate SQL insert statements
const now = Date.now();
const insertStatements = SEED_SKILLS.map((skill) => `INSERT OR REPLACE INTO skills (
  id, name, description, author, author_avatar_url, github_url,
  stars_count, forks_count, category, r2_file_key, file_size,
  download_count, avg_rating, rating_count, last_commit_at,
  files_json, skill_md_content, skill_md_parsed, created_at, updated_at
) VALUES (
  '${escapeSQL(skill.id)}',
  '${escapeSQL(skill.name)}',
  '${escapeSQL(skill.description)}',
  '${escapeSQL(skill.author)}',
  '${escapeSQL(skill.author_avatar_url)}',
  '${escapeSQL(skill.github_url)}',
  ${skill.stars_count},
  ${skill.forks_count},
  '${escapeSQL(skill.category)}',
  '${escapeSQL(skill.r2_file_key)}',
  ${skill.file_size},
  ${Math.floor(Math.random() * 1000)},
  ${(Math.random() * 2 + 3).toFixed(1)},
  ${Math.floor(Math.random() * 100) + 10},
  ${skill.last_commit_at},
  '${escapeSQL(JSON.stringify(skill.files))}',
  '${escapeSQL(skill.skill_md_content)}',
  '${escapeSQL(JSON.stringify(skill.skill_md_parsed))}',
  ${now},
  ${now}
);`).join('\n\n');

console.log('-- Seed data for Agent Skills Marketplace');
console.log('-- Generated at:', new Date().toISOString());
console.log('-- 9 skills with enhanced data (files, metadata, avatars)');
console.log('-- Run with: wrangler d1 execute agentskills-db --local --file=./seed.sql');
console.log('');
console.log('-- Clear existing data first');
console.log('DELETE FROM skills;');
console.log('');
console.log(insertStatements);
