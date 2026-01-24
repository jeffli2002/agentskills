/**
 * Seed local D1 database with skills from claude-skills-complete.json
 * Uses the same category rules as generate-complete-seed.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read complete skills data
const skills = JSON.parse(fs.readFileSync('./claude-skills-complete.json', 'utf8'));

// Escape SQL strings properly - handle all special characters
function escapeSql(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\x00/g, '')  // Remove null bytes
    .replace(/[\x01-\x09\x0b\x0c\x0e-\x1f]/g, ' ');  // Replace control chars except newline (\x0a) and carriage return (\x0d)
}

// Generate unique UUID using index to guarantee uniqueness
function generateUuid(skillId, index) {
  const indexHex = index.toString(16).padStart(12, '0');
  return `550e8400-e29b-41d4-a716-${indexHex.slice(0, 12)}`;
}

// Category rules (same as generate-complete-seed.js)
const categoryRules = {
  'Design': { keywords: { 'ui design': 20, 'ux design': 20, 'design system': 18, 'figma': 18, 'accessibility': 15, 'wcag': 18, 'css': 10, 'tailwind': 12, 'generative art': 22, 'algorithmic art': 22, 'p5.js': 20, 'motion design': 22, 'microinteraction': 22, 'typography': 20, 'color theory': 20, 'iconography': 18, 'brand': 15, 'style guide': 18, 'material design': 20, 'human interface': 20, 'visual design': 18, 'theme': 15, 'styling': 12 } },
  'Business': { keywords: { 'product manager': 20, 'roadmap': 18, 'okr': 18, 'kpi': 15, 'startup': 15, 'business model': 18, 'resume': 18, 'job description': 18, 'career': 15, 'invoice': 15, 'contract': 12, 'seo': 20, 'leads': 18, 'marketing': 15, 'ads': 12, 'competitor': 15, 'ceo': 22, 'cto': 22, 'executive': 18, 'leadership': 15, 'audit': 18, 'regulatory': 20, 'compliance': 18, 'qms': 22, 'iso 13485': 25, 'iso 14971': 25, 'market research': 20, 'consulting': 15, 'domain name': 18, 'social media': 15, 'twitter': 12, 'engagement': 12, 'recruiter': 15 } },
  'AI & ML': { keywords: { 'llm': 15, 'machine learning': 18, 'deep learning': 18, 'neural network': 18, 'embeddings': 15, 'langchain': 18, 'huggingface': 18, 'pytorch': 15, 'rag': 20, 'retrieval': 12, 'semantic search': 18, 'deepspeed': 22, 'unsloth': 22, 'mlops': 20, 'model training': 18, 'model deployment': 18, 'gguf': 22, 'quantization': 18, 'llama.cpp': 22, 'whisper': 20, 'speech recognition': 18, 'transformerlens': 22, 'mechanistic interpretability': 25, 'activation': 12, 'rwkv': 22, 'nanogpt': 22, 'tokenizer': 15, 'sentencepiece': 20, 'llava': 20, 'vision': 12, 'constitutional ai': 25, 'alignment': 15, 'rlhf': 22, 'grpo': 22, 'fine-tuning': 18, 'inference': 15 } },
  'Prompts & Agents': { keywords: { 'prompt engineering': 20, 'prompt': 12, 'agent': 12, 'agentic': 18, 'mcp': 22, 'tool use': 18, 'system prompt': 20, 'model context protocol': 25, 'connect': 12, 'notion': 18, 'planning': 15, 'plan': 10, 'brainstorming': 18, 'creative work': 15, 'design assistant': 18, 'context compaction': 20, 'session recovery': 18 } },
  'Backend': { keywords: { 'backend': 18, 'api': 12, 'rest': 15, 'graphql': 18, 'microservice': 18, 'express': 15, 'fastapi': 18, 'django': 18, 'websocket': 15, 'cqrs': 22, 'event sourcing': 22, 'saga': 18, 'event store': 20, 'stripe': 20, 'payment': 18, 'checkout': 15, 'istio': 22, 'service mesh': 22, 'traffic management': 18, 'distributed transaction': 20 } },
  'Database': { keywords: { 'database': 15, 'sql': 15, 'postgres': 18, 'mongodb': 18, 'redis': 15, 'etl': 18, 'dbt': 18, 'airflow': 15, 'data pipeline': 18 } },
  'Testing': { keywords: { 'testing': 15, 'test': 10, 'jest': 18, 'pytest': 18, 'cypress': 18, 'playwright': 18, 'e2e': 15, 'tdd': 18, 'debugging': 18, 'debug': 12, 'profiler': 15, 'root cause': 18, 'stack trace': 18, 'diagnosis': 15, 'error': 10 } },
  'Frontend': { keywords: { 'frontend': 20, 'react': 15, 'vue': 15, 'angular': 18, 'nextjs': 18, 'javascript': 12, 'typescript': 10, 'es6': 20, 'migration': 15, 'modernization': 18, 'swiftui': 20, 'jetpack compose': 22, 'ios': 15, 'android': 15, 'mobile app': 18, 'xcode': 18 } },
  'DevOps & Tooling': { keywords: { 'devops': 18, 'kubernetes': 18, 'docker': 18, 'terraform': 18, 'ci/cd': 18, 'aws': 15, 'cloud': 12, 'packaging': 18, 'pypi': 20, 'godot': 22, 'game': 15, 'rust': 15, 'golang': 18, 'runbook': 22, 'postmortem': 22, 'incident response': 20, 'incident': 12, 'shellcheck': 20, 'shell script': 15, 'railway': 20, 'mlflow': 22, 'wandb': 22, 'weights and biases': 22, 'experiment tracking': 20, 'goroutine': 20, 'go concurrency': 22, 'uv': 12, 'package manager': 15 } },
  'Security': { keywords: { 'security': 15, 'vulnerability': 18, 'authentication': 15, 'oauth': 15, 'encryption': 15, 'owasp': 18, 'gdpr': 18, 'reversing': 22, 'binary analysis': 22, 'disassembly': 20, 'decompilation': 20, 'malware': 20, 'forensics': 22, 'volatility': 20, 'anti-debug': 20, 'obfuscation': 18, 'protection': 12 } },
  'Analytics': { keywords: { 'data science': 18, 'analytics': 15, 'pandas': 18, 'visualization': 15, 'dashboard': 15, 'excel': 15, 'time series': 18, 'spark': 20, 'hadoop': 18, 'portfolio': 15, 'var': 12, 'sharpe': 18, 'sortino': 18, 'risk metrics': 20, 'profiling': 15, 'cprofile': 20, 'bottleneck': 15, 'vector index': 20, 'hnsw': 22, 'performance optimization': 18, 'benchmark': 15, 'growth': 12, 'patterns': 10, 'improvement': 10 } },
  'Automation': { keywords: { 'automation': 18, 'automate': 15, 'zapier': 20, 'n8n': 20, 'scraping': 18, 'scheduler': 18, 'cron': 18, 'skill': 15, 'creator': 12, 'raffle': 18, 'download': 12, 'linear': 15, 'issue': 10, 'ticket': 12, 'workflow': 12 } },
  'Documentation': { keywords: { 'documentation': 15, 'readme': 15, 'markdown': 12, 'api docs': 18, 'changelog': 18, 'communication': 15, 'comms': 18, 'pdf': 20, 'docx': 20, 'presentation': 20, 'pptx': 22, 'slides': 18, 'powerpoint': 20, 'grant': 18, 'proposal': 15, 'nsf': 20, 'nih': 20, 'research proposal': 20, 'content writing': 18, 'citations': 15, 'manim': 22, 'educational videos': 20, 'mathematical animations': 22 } },
  'Code Management': { keywords: { 'git': 15, 'github': 12, 'commit': 15, 'pull request': 18, 'code review': 15, 'monorepo': 18, 'linter': 18, 'eslint': 18, 'refactor': 15, 'iterate': 15, 'ddd': 18, 'domain-driven': 20, 'architecture': 12, 'bounded context': 20, 'microkernel': 20, 'slop': 20, 'clean up': 15, 'diff': 12, 'merge': 12, 'style inconsistencies': 18, 'merging': 15 } },
  'Science': { keywords: { 'bioinformatics': 35, 'genomics': 35, 'protein': 25, 'dna': 30, 'pharmaceutical': 30, 'alphafold': 35, 'fluid dynamics': 35, 'physics': 22, 'capa': 30, 'metabolic': 25, 'fba': 22, 'cobra': 20, 'flow cytometry': 30, 'fcs': 18, 'mass spectrometry': 30, 'mzml': 25, 'proteomics': 28, 'metabolomics': 28, 'medicinal chemistry': 30, 'drug discovery': 28, 'smiles': 22, 'molecular': 18, 'rdkit': 25, 'materials science': 28, 'crystal': 18, 'cif': 20, 'bayesian': 20, 'pymc': 22, 'mcmc': 20, 'multi-objective': 22, 'pareto': 20, 'nsga': 22, 'single-cell': 28, 'rna-seq': 25, 'scrna': 25, 'phylogenetic': 25, 'microbiome': 25, 'diversity': 12, 'neuropixels': 30, 'spike sorting': 28, 'electrophysiology': 28, 'microscopy': 22, 'high-content': 22, 'peer review': 20, 'methodology': 12, 'evidence': 10, 'scientific': 12 } },
  'Blockchain': { keywords: { 'blockchain': 20, 'web3': 20, 'crypto': 18, 'defi': 25, 'smart contract': 22, 'solidity': 22, 'ethereum': 20, 'nft': 20 } },
};

function categorizeSkill(skill) {
  const text = `${skill.name} ${skill.description || ''}`.toLowerCase();
  const scores = {};

  for (const [category, config] of Object.entries(categoryRules)) {
    let score = 0;
    for (const [keyword, weight] of Object.entries(config.keywords)) {
      if (text.includes(keyword.toLowerCase())) {
        score += weight;
      }
    }
    if (score > 0) scores[category] = score;
  }

  let bestCategory = 'other';
  let bestScore = 0;
  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

function getSkillMdContent(skill) {
  if (skill.files) {
    const mdKey = Object.keys(skill.files).find(k => k.toLowerCase().includes('skill.md'));
    if (mdKey && skill.files[mdKey]) {
      return skill.files[mdKey];
    }
  }
  // Fallback to generated content
  return `# ${skill.name}\n\n${skill.description || 'No description available.'}`;
}

function getR2FileKey(skill) {
  const author = skill.author?.toLowerCase() || 'unknown';
  const name = skill.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'unknown';
  return `skills/${author}/${name}/skill.zip`;
}

async function main() {
  console.log(`Seeding remote database with ${skills.length} skills...`);

  const apiDir = path.join(__dirname, '..', 'apps', 'api');
  const now = Date.now();
  let successCount = 0;
  let errorCount = 0;

  // Process in batches - smaller batch size for reliability
  const batchSize = 20;
  for (let i = 0; i < skills.length; i += batchSize) {
    const batch = skills.slice(i, i + batchSize);
    let sql = '';

    for (const [idx, skill] of batch.entries()) {
      const uuid = generateUuid(skill.id, i + idx);
      const category = categorizeSkill(skill);
      const r2FileKey = getR2FileKey(skill);
      const starsCount = skill.starsCount || Math.floor(Math.random() * 1000);
      const forksCount = skill.forksCount || Math.floor(starsCount * 0.1);
      const downloadCount = Math.floor(starsCount * 0.01) + Math.floor(Math.random() * 50);
      const avgRating = (3.5 + Math.random() * 1.5).toFixed(1);
      const ratingCount = Math.floor(starsCount * 0.001) + Math.floor(Math.random() * 20);
      const fileSize = skill.fileSize || Math.floor(5000 + Math.random() * 50000);
      const skillMdContent = getSkillMdContent(skill);

      sql += `INSERT OR REPLACE INTO skills (id, name, description, author, author_avatar_url, github_url, stars_count, forks_count, category, r2_file_key, file_size, download_count, avg_rating, rating_count, last_commit_at, skill_md_content, created_at, updated_at) VALUES ('${uuid}', '${escapeSql(skill.name)}', '${escapeSql(skill.description?.slice(0, 500))}', '${escapeSql(skill.author)}', '${escapeSql(skill.authorAvatarUrl)}', '${escapeSql(skill.githubUrl)}', ${starsCount}, ${forksCount}, '${escapeSql(category)}', '${escapeSql(r2FileKey)}', ${fileSize}, ${downloadCount}, ${avgRating}, ${ratingCount}, ${skill.lastCommitAt || now}, '${escapeSql(skillMdContent.slice(0, 5000))}', ${skill.createdAt || now}, ${now});\n`;
    }

    // Write batch to temp file and execute
    const tempFile = path.join(apiDir, `seed_batch_${i}.sql`);
    fs.writeFileSync(tempFile, sql);

    try {
      execSync(`npx wrangler d1 execute agentskills-db --remote --file=./seed_batch_${i}.sql`, {
        cwd: apiDir,
        stdio: 'pipe',
        timeout: 60000
      });
      successCount += batch.length;
      console.log(`Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(skills.length/batchSize)}: ${batch.length} skills inserted`);
    } catch (error) {
      console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
      errorCount += batch.length;
    }

    // Clean up temp file
    try { fs.unlinkSync(tempFile); } catch {}
  }

  console.log(`\nDone! Success: ${successCount}, Errors: ${errorCount}`);

  // Verify
  try {
    const result = execSync(`npx wrangler d1 execute agentskills-db --remote --command="SELECT COUNT(*) as count FROM skills"`, {
      cwd: apiDir,
      encoding: 'utf8'
    });
    console.log('Verification:', result);
  } catch {}
}

main().catch(console.error);
