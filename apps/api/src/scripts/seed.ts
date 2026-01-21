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

const SEED_SKILLS: SeedSkill[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Code Review Assistant',
    description: 'Automated code review with best practices suggestions, security checks, and performance tips.',
    author: 'anthropic',
    github_url: 'https://github.com/anthropics/code-review-skill',
    stars_count: 1250,
    category: 'coding',
    r2_file_key: 'skills/code-review-assistant/skill.zip',
    file_size: 15360,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Data Analysis Pro',
    description: 'Advanced data analysis skill with pandas, SQL generation, and visualization helpers.',
    author: 'datacraft',
    github_url: 'https://github.com/datacraft/analysis-skill',
    stars_count: 890,
    category: 'data',
    r2_file_key: 'skills/data-analysis-pro/skill.zip',
    file_size: 28672,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Technical Writer',
    description: 'Generate clear documentation, README files, and API docs from code.',
    author: 'docsmith',
    github_url: 'https://github.com/docsmith/tech-writer-skill',
    stars_count: 654,
    category: 'writing',
    r2_file_key: 'skills/technical-writer/skill.zip',
    file_size: 12288,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Test Generator',
    description: 'Automatically generate unit tests, integration tests, and test fixtures.',
    author: 'testcraft',
    github_url: 'https://github.com/testcraft/test-gen-skill',
    stars_count: 1100,
    category: 'testing',
    r2_file_key: 'skills/test-generator/skill.zip',
    file_size: 20480,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'CI/CD Pipeline Builder',
    description: 'Generate GitHub Actions, GitLab CI, and other CI/CD configurations.',
    author: 'devopstools',
    github_url: 'https://github.com/devopstools/cicd-skill',
    stars_count: 780,
    category: 'devops',
    r2_file_key: 'skills/cicd-builder/skill.zip',
    file_size: 18432,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'API Client Generator',
    description: 'Generate typed API clients from OpenAPI specs in multiple languages.',
    author: 'apitools',
    github_url: 'https://github.com/apitools/client-gen-skill',
    stars_count: 920,
    category: 'coding',
    r2_file_key: 'skills/api-client-gen/skill.zip',
    file_size: 25600,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'SQL Query Optimizer',
    description: 'Analyze and optimize SQL queries for better performance.',
    author: 'dbpro',
    github_url: 'https://github.com/dbpro/sql-optimizer-skill',
    stars_count: 567,
    category: 'data',
    r2_file_key: 'skills/sql-optimizer/skill.zip',
    file_size: 14336,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Git Workflow Helper',
    description: 'Assist with git operations, conflict resolution, and branch management.',
    author: 'gittools',
    github_url: 'https://github.com/gittools/workflow-skill',
    stars_count: 445,
    category: 'devops',
    r2_file_key: 'skills/git-workflow/skill.zip',
    file_size: 10240,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Research Assistant',
    description: 'Help with technical research, summarizing papers, and finding relevant resources.',
    author: 'researchai',
    github_url: 'https://github.com/researchai/research-skill',
    stars_count: 678,
    category: 'research',
    r2_file_key: 'skills/research-assistant/skill.zip',
    file_size: 16384,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Automation Scripts',
    description: 'Generate shell scripts, batch files, and automation workflows.',
    author: 'automate',
    github_url: 'https://github.com/automate/scripts-skill',
    stars_count: 523,
    category: 'automation',
    r2_file_key: 'skills/automation-scripts/skill.zip',
    file_size: 8192,
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
console.log('-- Run with: wrangler d1 execute agentskills-db --local --file=./seed.sql');
console.log('');
console.log(insertStatements);
