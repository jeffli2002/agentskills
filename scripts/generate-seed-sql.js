/**
 * Generate seed.sql from scraped-skills.json
 *
 * Usage: node generate-seed-sql.js
 */

const fs = require('fs');
const path = require('path');

// Read scraped skills
const skills = JSON.parse(fs.readFileSync('./scraped-skills.json', 'utf8'));

// Escape SQL strings
function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Generate UUID from index
function generateUuid(index) {
  const hex = (index + 1).toString(16).padStart(12, '0');
  return `550e8400-e29b-41d4-a716-4466554400${hex.slice(-2)}`;
}

// Generate file structure based on repo type
function generateFilesJson(skill) {
  const files = [
    { path: 'SKILL.md', name: 'SKILL.md', size: 2048, type: 'file' },
    { path: 'README.md', name: 'README.md', size: skill.readmeContent?.length || 4096, type: 'file' },
  ];

  if (skill.language === 'TypeScript' || skill.language === 'JavaScript') {
    files.push(
      { path: 'src', name: 'src', size: 0, type: 'folder' },
      { path: 'src/index.ts', name: 'index.ts', size: 1024, type: 'file' },
      { path: 'package.json', name: 'package.json', size: 512, type: 'file' }
    );
  } else if (skill.language === 'Python') {
    files.push(
      { path: 'src', name: 'src', size: 0, type: 'folder' },
      { path: 'src/__init__.py', name: '__init__.py', size: 256, type: 'file' },
      { path: 'requirements.txt', name: 'requirements.txt', size: 128, type: 'file' }
    );
  }

  return JSON.stringify(files);
}

// Generate skill_md_content from readme
function generateSkillMdContent(skill) {
  // Use the longDescription which is cleaned README content
  let content = `# ${skill.name}\n\n`;

  if (skill.description) {
    content += `${skill.description}\n\n`;
  }

  if (skill.longDescription) {
    content += `## Overview\n\n${skill.longDescription.slice(0, 3000)}\n`;
  }

  return content;
}

// Generate skill_md_parsed metadata
function generateSkillMdParsed(skill) {
  return JSON.stringify({
    name: skill.name,
    description: skill.description,
    version: '1.0.0',
    author: skill.author,
    license: 'MIT',
    topics: skill.topics?.slice(0, 5) || [],
    language: skill.language || 'Unknown'
  });
}

// Generate SQL
let sql = `-- Seed data for Agent Skills Marketplace
-- Generated at: ${new Date().toISOString()}
-- ${skills.length} skills with full descriptions from GitHub API
-- Run with: wrangler d1 execute agentskills-db --local --file=./seed.sql

-- Clear existing data first
DELETE FROM skills;

`;

skills.forEach((skill, index) => {
  const uuid = generateUuid(index);
  const filesJson = generateFilesJson(skill);
  const skillMdContent = generateSkillMdContent(skill);
  const skillMdParsed = generateSkillMdParsed(skill);
  const now = Date.now();

  // Generate a reasonable download count based on stars
  const downloadCount = Math.floor(skill.starsCount * 0.01) + Math.floor(Math.random() * 100);

  // Generate rating (between 3.0 and 5.0)
  const avgRating = (3.0 + Math.random() * 2.0).toFixed(1);
  const ratingCount = Math.floor(skill.starsCount * 0.001) + Math.floor(Math.random() * 50);

  // File size estimate
  const fileSize = Math.floor(100000 + Math.random() * 10000000);

  sql += `INSERT OR REPLACE INTO skills (
  id, name, description, author, author_avatar_url, github_url,
  stars_count, forks_count, category, r2_file_key, file_size,
  download_count, avg_rating, rating_count, last_commit_at,
  files_json, skill_md_content, skill_md_parsed, created_at, updated_at
) VALUES (
  '${uuid}',
  '${escapeSql(skill.name)}',
  '${escapeSql(skill.description)}',
  '${escapeSql(skill.author)}',
  '${escapeSql(skill.authorAvatarUrl)}',
  '${escapeSql(skill.githubUrl)}',
  ${skill.starsCount},
  ${skill.forksCount},
  '${escapeSql(skill.category)}',
  'skills/${escapeSql(skill.id)}/skill.zip',
  ${fileSize},
  ${downloadCount},
  ${avgRating},
  ${ratingCount},
  ${skill.lastCommitAt},
  '${escapeSql(filesJson)}',
  '${escapeSql(skillMdContent)}',
  '${escapeSql(skillMdParsed)}',
  ${skill.createdAt || now},
  ${now}
);

`;
});

// Write to seed.sql
const outputPath = path.join(__dirname, '..', 'apps', 'api', 'seed.sql');
fs.writeFileSync(outputPath, sql);
console.log(`Generated ${outputPath} with ${skills.length} skills`);

// Also log summary
console.log('\nSkills summary:');
skills.forEach((skill, i) => {
  console.log(`  ${i + 1}. ${skill.fullName} - ${skill.starsCount.toLocaleString()} stars - ${skill.category}`);
});
