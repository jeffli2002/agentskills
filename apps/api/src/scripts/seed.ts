// Seed script for Agent Skills Marketplace
// Run with: npx tsx apps/api/src/scripts/seed.ts > seed.sql
// Then: wrangler d1 execute agentskills-db --local --file=./seed.sql

const escapeSQL = (value: string): string => value.replace(/'/g, "''");

interface SeedSkill {
  id: string;
  name: string;
  description: string;
  author: string;
  github_url: string;
  stars_count: number;
  category: string;
  r2_file_key: string;
  file_size: number;
}

// Real skills data scraped from GitHub (January 2026)
// Only includes skills that are successfully uploaded to R2
const SEED_SKILLS: SeedSkill[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Awesome MCP Servers',
    description: 'A collection of MCP servers for extending AI agent capabilities with external tools and data sources.',
    author: 'punkpeye',
    github_url: 'https://github.com/punkpeye/awesome-mcp-servers',
    stars_count: 79400,
    category: 'devops',
    r2_file_key: 'skills/awesome-mcp-servers/skill.zip',
    file_size: 329728,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'MCP Servers',
    description: 'Model Context Protocol Servers - Official reference implementations for connecting AI models to external tools.',
    author: 'modelcontextprotocol',
    github_url: 'https://github.com/modelcontextprotocol/servers',
    stars_count: 76700,
    category: 'coding',
    r2_file_key: 'skills/mcp-servers/skill.zip',
    file_size: 490700,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Claude Code',
    description: 'An agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster through natural language commands.',
    author: 'anthropics',
    github_url: 'https://github.com/anthropics/claude-code',
    stars_count: 58800,
    category: 'coding',
    r2_file_key: 'skills/claude-code/skill.zip',
    file_size: 11178598,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Cline',
    description: 'Autonomous coding agent right in your IDE, capable of creating/editing files, executing commands, using the browser, and more.',
    author: 'cline',
    github_url: 'https://github.com/cline/cline',
    stars_count: 57000,
    category: 'coding',
    r2_file_key: 'skills/cline/skill.zip',
    file_size: 7951974,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Mem0',
    description: 'Universal memory layer for AI Agents - persistent memory and state management for agentic workflows.',
    author: 'mem0ai',
    github_url: 'https://github.com/mem0ai/mem0',
    stars_count: 45800,
    category: 'data',
    r2_file_key: 'skills/mem0/skill.zip',
    file_size: 22083788,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Awesome Claude Code',
    description: 'A curated list of awesome skills, hooks, slash-commands, agent orchestrators, applications, and plugins for Claude Code.',
    author: 'hesreallyhim',
    github_url: 'https://github.com/hesreallyhim/awesome-claude-code',
    stars_count: 21200,
    category: 'research',
    r2_file_key: 'skills/awesome-claude-code/skill.zip',
    file_size: 3186892,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'MCP Agent',
    description: 'Build effective agents using Model Context Protocol and simple workflow patterns.',
    author: 'lastmile-ai',
    github_url: 'https://github.com/lastmile-ai/mcp-agent',
    stars_count: 8000,
    category: 'automation',
    r2_file_key: 'skills/mcp-agent/skill.zip',
    file_size: 20975923,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Awesome Claude Skills',
    description: 'A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows — particularly Claude Code.',
    author: 'travisvn',
    github_url: 'https://github.com/travisvn/awesome-claude-skills',
    stars_count: 5500,
    category: 'research',
    r2_file_key: 'skills/awesome-claude-skills-travisvn/skill.zip',
    file_size: 11469,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Claude Code Skills Marketplace',
    description: 'Professional Claude Code skills marketplace featuring production-ready skills for enhanced development workflows.',
    author: 'daymade',
    github_url: 'https://github.com/daymade/claude-code-skills',
    stars_count: 358,
    category: 'coding',
    r2_file_key: 'skills/daymade-skills/skill.zip',
    file_size: 9805005,
  },
];

// Generate SQL insert statements
const now = Date.now();
const insertStatements = SEED_SKILLS.map((skill) => `INSERT INTO skills (id, name, description, author, github_url, stars_count, category, r2_file_key, file_size, download_count, avg_rating, rating_count, created_at, updated_at)
VALUES (
  '${escapeSQL(skill.id)}',
  '${escapeSQL(skill.name)}',
  '${escapeSQL(skill.description)}',
  '${escapeSQL(skill.author)}',
  '${escapeSQL(skill.github_url)}',
  ${skill.stars_count},
  '${escapeSQL(skill.category)}',
  '${escapeSQL(skill.r2_file_key)}',
  ${skill.file_size},
  0,
  0,
  0,
  ${now},
  ${now}
);`).join('\n\n');

console.log('-- Seed data for Agent Skills Marketplace');
console.log('-- Generated at:', new Date().toISOString());
console.log('-- 9 skills with files uploaded to R2');
console.log('-- Run with: wrangler d1 execute agentskills-db --local --file=./seed.sql');
console.log('');
console.log(insertStatements);
