/**
 * Merge scraped skills and generate seed.sql
 *
 * Combines:
 * 1. Detailed data from scraped-skills.json (has README content)
 * 2. Basic data from scraped-skills-from-search.json (10000+ stars repos)
 *
 * Usage: node merge-and-generate-seed.js
 */

const fs = require('fs');
const path = require('path');

// Load both datasets
let detailedSkills = [];
let searchSkills = [];

try {
  detailedSkills = JSON.parse(fs.readFileSync('./scraped-skills.json', 'utf8'));
  console.log(`Loaded ${detailedSkills.length} skills with detailed README content`);
} catch (e) {
  console.log('No detailed skills file found');
}

try {
  searchSkills = JSON.parse(fs.readFileSync('./scraped-skills-from-search.json', 'utf8'));
  console.log(`Loaded ${searchSkills.length} skills from search results`);
} catch (e) {
  console.log('No search skills file found');
}

// Create a map of detailed skills for quick lookup
const detailedMap = new Map();
for (const skill of detailedSkills) {
  detailedMap.set(skill.fullName, skill);
}

// Merge: prefer detailed data, add search data for new repos
const mergedMap = new Map();

// First add all detailed skills
for (const skill of detailedSkills) {
  mergedMap.set(skill.fullName, skill);
}

// Then add search skills that we don't have detailed data for
for (const skill of searchSkills) {
  if (!mergedMap.has(skill.fullName)) {
    mergedMap.set(skill.fullName, skill);
  }
}

// Convert to array and sort by stars
const allSkills = Array.from(mergedMap.values())
  .filter(s => s.starsCount >= 10000) // Only 10000+ stars
  .sort((a, b) => b.starsCount - a.starsCount);

console.log(`\nTotal merged skills (10000+ stars): ${allSkills.length}`);

// SQL generation helpers
function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

function generateUuid(index) {
  const hex = (index + 1).toString(16).padStart(12, '0');
  return `550e8400-e29b-41d4-a716-4466554${hex.slice(-5)}`;
}

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

function generateSkillMdContent(skill) {
  let content = `# ${skill.name}\n\n`;

  if (skill.description) {
    content += `${skill.description}\n\n`;
  }

  if (skill.longDescription) {
    content += `## Overview\n\n${skill.longDescription.slice(0, 3000)}\n`;
  } else if (skill.readmeContent) {
    // Extract first section from README
    const preview = skill.readmeContent
      .replace(/^#.*$/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .trim()
      .slice(0, 2000);
    if (preview) {
      content += `## Overview\n\n${preview}\n`;
    }
  }

  return content;
}

function generateSkillMdParsed(skill) {
  return JSON.stringify({
    name: skill.name,
    description: skill.description,
    version: '1.0.0',
    author: skill.author,
    license: 'MIT',
    topics: (skill.topics || []).slice(0, 5),
    language: skill.language || 'Unknown'
  });
}

// Generate SQL
let sql = `-- Seed data for Agent Skills Marketplace
-- Generated at: ${new Date().toISOString()}
-- ${allSkills.length} skills with 10000+ stars
-- Run with: wrangler d1 execute agentskills-db --local --file=./seed.sql

-- Clear existing data first
DELETE FROM skills;

`;

allSkills.forEach((skill, index) => {
  const uuid = generateUuid(index);
  const filesJson = generateFilesJson(skill);
  const skillMdContent = generateSkillMdContent(skill);
  const skillMdParsed = generateSkillMdParsed(skill);
  const now = Date.now();

  // Generate download count based on stars
  const downloadCount = Math.floor(skill.starsCount * 0.01) + Math.floor(Math.random() * 100);

  // Generate rating (between 3.5 and 5.0 - higher for popular repos)
  const baseRating = 3.5 + (Math.min(skill.starsCount, 100000) / 100000) * 1.0;
  const avgRating = (baseRating + Math.random() * 0.5).toFixed(1);
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
  ${skill.forksCount || 0},
  '${escapeSql(skill.category)}',
  'skills/${escapeSql(skill.id)}/skill.zip',
  ${fileSize},
  ${downloadCount},
  ${avgRating},
  ${ratingCount},
  ${skill.lastCommitAt || now},
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
console.log(`\nGenerated ${outputPath}`);

// Summary
console.log('\nTop 30 skills:');
allSkills.slice(0, 30).forEach((skill, i) => {
  const hasReadme = skill.readmeContent ? '✓' : '○';
  console.log(`  ${i + 1}. ${hasReadme} ${skill.fullName} - ${skill.starsCount.toLocaleString()} stars [${skill.category}]`);
});
