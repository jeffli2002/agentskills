/**
 * Generate seed SQL from scraped Claude Code skills
 *
 * Usage: node generate-skills-seed.js > ../apps/api/skills-seed.sql
 */

const fs = require('fs');
const crypto = require('crypto');

// Load skills data
const skills = JSON.parse(fs.readFileSync('./claude-skills-complete.json', 'utf8'));

// Load R2 upload results to get actual R2 keys
const r2Results = JSON.parse(fs.readFileSync('./r2-upload-results.json', 'utf8'));
const r2KeyMap = new Map(r2Results.map(r => [r.name, r.r2Key]));

// SQL escaping
function escapeSQL(value) {
  if (value === null || value === undefined) return 'NULL';
  return "'" + String(value).replace(/'/g, "''") + "'";
}

// Generate UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Build file tree structure from files object
function buildFileTree(files, skillDir) {
  const tree = [];
  const dirs = new Set();

  for (const filePath of Object.keys(files)) {
    // Get relative path from skill directory
    let relativePath = filePath;
    if (skillDir && filePath.startsWith(skillDir + '/')) {
      relativePath = filePath.substring(skillDir.length + 1);
    }

    // Add parent directories
    const parts = relativePath.split('/');
    let currentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? currentPath + '/' + parts[i] : parts[i];
      if (!dirs.has(currentPath)) {
        dirs.add(currentPath);
        tree.push({
          path: currentPath,
          name: parts[i],
          size: 0,
          type: 'folder'
        });
      }
    }

    // Add file
    const content = files[filePath];
    tree.push({
      path: relativePath,
      name: parts[parts.length - 1],
      size: content ? content.length : 0,
      type: 'file'
    });
  }

  return tree;
}

// Improve category assignment
function improveCategory(skill) {
  const name = (skill.name || '').toLowerCase();
  const desc = (skill.description || '').toLowerCase();
  const path = (skill.skillPath || '').toLowerCase();
  const text = `${name} ${desc} ${path}`;

  // More specific categories
  if (/pdf|docx|pptx|xlsx|document/.test(text)) return 'docs';
  if (/ui|ux|design|frontend|tailwind|css|react-best|visual/.test(text)) return 'design';
  if (/database|sql|postgres|data-|analytics|vector|rag/.test(text)) return 'data';
  if (/git|deploy|docker|k8s|kubernetes|cicd|infrastructure|terraform/.test(text)) return 'devops';
  if (/agent|workflow|automation|swarm|orchestr/.test(text)) return 'automation';
  if (/research|scientific|paper|literature/.test(text)) return 'research';
  if (/security|auth|compliance|gdpr|audit/.test(text)) return 'security';
  if (/test|debug|lint|review|quality/.test(text)) return 'testing';

  return 'coding';
}

// Deduplicate skills by name (keep highest star count version)
function deduplicateSkills(skills) {
  const seen = new Map();

  for (const skill of skills) {
    const key = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = seen.get(key);

    if (!existing || skill.starsCount > existing.starsCount) {
      seen.set(key, skill);
    }
  }

  return Array.from(seen.values());
}

// Generate SQL
function generateSQL() {
  console.log('-- Agent Skills Marketplace - Skills Seed Data');
  console.log('-- Generated at:', new Date().toISOString());
  console.log('-- Source: Claude Code skill repositories');
  console.log('');

  // Deduplicate
  const uniqueSkills = deduplicateSkills(skills);
  console.log(`-- Total skills: ${skills.length}`);
  console.log(`-- After deduplication: ${uniqueSkills.length}`);
  console.log('');

  // Clear existing skills
  console.log('-- Clear existing skills');
  console.log('DELETE FROM downloads WHERE 1=1;');
  console.log('DELETE FROM ratings WHERE 1=1;');
  console.log('DELETE FROM favorites WHERE 1=1;');
  console.log('DELETE FROM skills WHERE 1=1;');
  console.log('');

  const now = Date.now();
  let insertCount = 0;

  for (const skill of uniqueSkills) {
    const id = generateUUID();
    const category = improveCategory(skill);
    const fileTree = buildFileTree(skill.files || {}, skill.skillDir);
    const fileSize = Object.values(skill.files || {}).reduce((sum, content) => sum + (content?.length || 0), 0);

    // Generate R2 key
    const r2Key = `skills/${skill.author}/${skill.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}/skill.zip`;

    const sql = `INSERT INTO skills (
  id, name, description, author, author_avatar_url, github_url,
  stars_count, forks_count, category, r2_file_key, file_size,
  download_count, avg_rating, rating_count, last_commit_at,
  files_json, skill_md_content, skill_md_parsed, created_at, updated_at
) VALUES (
  ${escapeSQL(id)},
  ${escapeSQL(skill.name)},
  ${escapeSQL(skill.description || skill.name)},
  ${escapeSQL(skill.author)},
  ${escapeSQL(skill.authorAvatarUrl)},
  ${escapeSQL(skill.githubUrl)},
  ${skill.starsCount || 0},
  ${skill.forksCount || 0},
  ${escapeSQL(category)},
  ${escapeSQL(r2Key)},
  ${fileSize},
  0,
  0,
  0,
  ${skill.lastCommitAt || now},
  ${escapeSQL(JSON.stringify(fileTree))},
  ${escapeSQL(skill.skillMdContent)},
  ${escapeSQL(JSON.stringify(skill.skillMdParsed || {}))},
  ${now},
  ${now}
);`;

    console.log(sql);
    console.log('');
    insertCount++;
  }

  console.log(`-- Inserted ${insertCount} skills`);
}

// Run
generateSQL();
