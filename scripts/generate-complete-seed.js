/**
 * Generate seed.sql from claude-skills-complete.json with user-friendly categories
 *
 * Categories are general, easy-to-understand groupings that users would expect.
 *
 * Usage: node generate-complete-seed.js
 */

const fs = require('fs');
const path = require('path');

// Read complete skills data
const skills = JSON.parse(fs.readFileSync('./claude-skills-complete.json', 'utf8'));

// Escape SQL strings properly
function escapeSql(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
}

// Generate UUID from skill id
function generateUuid(skillId, index) {
  const hash = skillId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  const hex = Math.abs(hash).toString(16).padStart(12, '0');
  return `550e8400-e29b-41d4-a716-${hex.slice(0, 12)}`;
}

// Balanced categories with adjusted weights for even distribution (~40-50 skills each)
// Target: 773 skills / 16 categories = ~48 skills per category
const categoryRules = {
  // Design & UI/UX - visual design, user experience, accessibility, art
  'Design': {
    keywords: {
      'ui design': 20, 'ux design': 20, 'ui/ux': 20, 'design system': 18,
      'figma': 18, 'visual design': 18, 'brand': 15, 'typography': 15,
      'color': 12, 'layout': 12, 'wireframe': 18, 'prototype': 15,
      'interaction design': 18, 'motion design': 18, 'animation': 12,
      'responsive design': 15, 'accessibility': 15, 'wcag': 18,
      'canvas': 12, 'art': 15, 'poster': 15, 'infographic': 18,
      'icon': 12, 'illustration': 15, 'theme': 12, 'styling': 10,
      'css': 10, 'tailwind': 12, 'sass': 12, 'scss': 12,
      'styled-component': 15, 'image': 8, 'visual': 10, 'graphic': 12,
      'generative art': 22, 'algorithmic art': 22, 'p5.js': 20,
      'creative coding': 20, 'processing': 15, 'sketch': 12
    }
  },

  // Product & Business - strategy, planning, business operations, HR
  'Business': {
    keywords: {
      'product manager': 20, 'product owner': 20, 'product management': 20,
      'roadmap': 18, 'user story': 18, 'backlog': 15, 'prioritization': 15,
      'rice': 15, 'okr': 18, 'kpi': 15, 'agile': 12, 'scrum': 12,
      'sprint': 12, 'stakeholder': 15, 'requirement': 12, 'prd': 18,
      'gtm': 18, 'go-to-market': 18, 'market research': 18, 'competitive': 15,
      'pricing': 15, 'positioning': 15, 'persona': 15, 'journey map': 18,
      'strategy': 12, 'metric': 10, 'growth': 12, 'revenue': 15,
      'startup': 15, 'business model': 18, 'financial model': 18,
      'invoice': 15, 'contract': 12, 'legal': 12, 'compliance': 12,
      'hiring': 15, 'interview': 12, 'onboarding': 15, 'hr': 12,
      'resume': 18, 'job description': 18, 'career': 15, 'tailored': 12
    }
  },

  // AI & Machine Learning - LLMs, neural networks, ML pipelines
  'AI & ML': {
    keywords: {
      'llm': 15, 'large language model': 20, 'machine learning': 18,
      'deep learning': 18, 'neural network': 18, 'transformer': 15,
      'fine-tun': 18, 'training data': 15, 'inference': 15, 'embeddings': 15,
      'langchain': 18, 'huggingface': 18, 'pytorch': 15, 'tensorflow': 15,
      'quantization': 18, 'lora': 18, 'qlora': 18, 'rag': 20,
      'diffusion': 15, 'stable diffusion': 18,
      'computer vision': 18, 'nlp': 15, 'natural language processing': 18,
      'reinforcement learning': 18, 'rlhf': 18, 'dpo': 18,
      'multimodal': 15, 'vision-language': 18, 'model': 6,
      'retrieval': 12, 'semantic search': 18, 'vector': 12,
      'knowledge base': 15, 'grounding': 15
    }
  },

  // Prompt & Agent - prompt engineering, AI agents, LLM interactions, MCP
  'Prompts & Agents': {
    keywords: {
      'prompt engineering': 20, 'prompt': 12, 'prompting': 15,
      'agent': 12, 'agentic': 18, 'autonomous': 15,
      'gpt': 12, 'claude': 10, 'gemini': 15, 'llama': 15, 'mistral': 18,
      'openai': 15, 'anthropic': 15, 'chatbot': 15, 'assistant': 10,
      'conversation': 12, 'dialogue': 15, 'chat': 8, 'mcp': 22,
      'tool use': 18, 'function calling': 18, 'context': 8,
      'system prompt': 20, 'few-shot': 18, 'chain-of-thought': 20,
      'instruction': 10, 'completion': 10,
      'model context protocol': 25, 'external service': 15,
      'connect': 12, 'integration': 12, 'interact': 10
    }
  },

  // Backend & APIs - server-side development, APIs, microservices
  'Backend': {
    keywords: {
      'backend': 18, 'server': 12, 'api': 12, 'rest': 15, 'graphql': 18,
      'microservice': 18, 'node.js': 15, 'express': 15, 'fastapi': 18,
      'django': 18, 'flask': 18, 'spring': 15, 'nest': 15,
      'websocket': 15, 'grpc': 18, 'message queue': 18, 'kafka': 18,
      'rabbitmq': 18, 'event-driven': 15, 'cqrs': 18, 'saga': 15,
      'domain-driven': 15, 'ddd': 15, 'clean architecture': 18,
      'async': 12, 'concurrency': 15, 'middleware': 12,
      'hono': 18, 'koa': 15, 'http': 10, 'endpoint': 12
    }
  },

  // Database & Data - databases, ETL, pipelines, data processing
  'Database': {
    keywords: {
      'database': 15, 'sql': 15, 'postgres': 18, 'postgresql': 18,
      'mysql': 18, 'mongodb': 18, 'redis': 15, 'elasticsearch': 18,
      'nosql': 15, 'orm': 15, 'drizzle': 18, 'prisma': 18,
      'migration': 12, 'schema': 10, 'query': 8, 'index': 10,
      'vector database': 18, 'pinecone': 18, 'qdrant': 18, 'chroma': 18,
      'clickhouse': 18, 'data warehouse': 18, 'sqlite': 15, 'd1': 15,
      'supabase': 18, 'firebase': 15, 'dynamodb': 18,
      'etl': 18, 'dbt': 18, 'data pipeline': 18, 'spark': 15,
      'airflow': 15, 'prefect': 18, 'dagster': 18, 'luigi': 15,
      'data lake': 18, 'data mesh': 18, 'streaming': 10,
      'batch processing': 15, 'flink': 18,
      'snowflake': 18, 'bigquery': 18, 'redshift': 18,
      'parquet': 15, 'avro': 15, 'delta lake': 18, 'iceberg': 18,
      'data quality': 15, 'data governance': 15, 'lineage': 15,
      'ingestion': 15
    }
  },

  // Testing & QA - testing, quality assurance, validation
  'Testing': {
    keywords: {
      'testing': 15, 'test': 10, 'jest': 18, 'vitest': 18, 'pytest': 18,
      'cypress': 18, 'playwright': 18, 'selenium': 18, 'e2e': 15,
      'unit test': 18, 'integration test': 18, 'tdd': 18, 'bdd': 18,
      'test-driven': 18, 'qa': 15, 'quality assurance': 18,
      'coverage': 15, 'mock': 12, 'fixture': 15, 'assertion': 15,
      'benchmark': 15, 'performance test': 18, 'load test': 18,
      'regression': 15, 'smoke test': 18, 'snapshot': 12,
      'testcontainer': 18, 'contract test': 18
    }
  },

  // Frontend & Web - client-side development, web frameworks, migrations
  'Frontend': {
    keywords: {
      'frontend': 20, 'react': 15, 'vue': 15, 'svelte': 18, 'angular': 18,
      'next.js': 18, 'nextjs': 18, 'nuxt': 18, 'remix': 18,
      'javascript': 12, 'typescript': 10, 'html': 10,
      'es6': 20, 'ecmascript': 20, 'async/await': 18, 'promise': 15,
      'destructuring': 18, 'arrow function': 18, 'module': 10,
      'component': 8, 'state management': 15, 'redux': 18, 'zustand': 18,
      'webpack': 15, 'vite': 12, 'bundler': 15, 'browser': 8,
      'dom': 12, 'spa': 15, 'ssr': 15, 'hydration': 15,
      'web component': 18, 'shadow dom': 18, 'lit': 18,
      'htmx': 18, 'alpine': 15, 'astro': 18, 'qwik': 18,
      'functional programming': 15, 'iterator': 15, 'generator': 12,
      'migration': 15, 'modernization': 18, 'upgrade': 12, 'refactor': 10
    }
  },

  // DevOps, Cloud & Developer Tooling - infrastructure, CI/CD, packaging, languages
  'DevOps & Tooling': {
    keywords: {
      'devops': 18, 'kubernetes': 18, 'k8s': 18, 'docker': 18,
      'container': 15, 'helm': 18, 'terraform': 18, 'ansible': 18,
      'ci/cd': 18, 'github action': 18, 'gitlab ci': 18, 'jenkins': 18,
      'aws': 15, 'azure': 15, 'gcp': 15, 'cloud': 12,
      'infrastructure': 15, 'iac': 18, 'serverless': 15, 'lambda': 15,
      'monitoring': 15, 'prometheus': 18, 'grafana': 18, 'observability': 15,
      'logging': 12, 'tracing': 15, 'alerting': 15,
      'deploy': 12, 'scaling': 12, 'load balancer': 15,
      'cloudflare': 15, 'vercel': 15, 'netlify': 15, 'railway': 15,
      'cost optimization': 20, 'cloud cost': 20, 'rightsizing': 20,
      'reserved instance': 18, 'spending': 12,
      'packaging': 18, 'pypi': 20, 'npm publish': 20, 'package manager': 18,
      'uv': 15, 'pip': 15, 'poetry': 18, 'pdm': 18,
      'virtual environment': 18, 'venv': 15, 'conda': 15,
      'pyproject': 20, 'setup.py': 18, 'distributable': 15,
      'godot': 22, 'gdscript': 22, 'unity': 20, 'unreal': 20,
      'game': 15, 'game development': 20, 'game engine': 20,
      'state machine': 15, 'signal': 10, 'scene': 10,
      'rust': 15, 'go': 10, 'golang': 18, 'zig': 18, 'nim': 18,
      'c++': 15, 'c#': 15, 'java': 12, 'kotlin': 15,
      'ruby': 15, 'rails': 15, 'elixir': 18, 'phoenix': 18
    }
  },

  // Security & Auth - security, authentication, compliance
  'Security': {
    keywords: {
      'security': 15, 'vulnerability': 18, 'penetration': 18, 'pentest': 18,
      'authentication': 15, 'authorization': 15, 'oauth': 15, 'jwt': 15,
      'encryption': 15, 'ssl': 15, 'tls': 15, 'certificate': 15,
      'firewall': 15, 'waf': 18, 'ddos': 18, 'xss': 18, 'csrf': 18,
      'sql injection': 18, 'owasp': 18, 'cve': 18,
      'gdpr': 18, 'hipaa': 18, 'pci': 18, 'soc2': 18,
      'audit': 12, 'threat': 15, 'attack': 12, 'exploit': 18,
      'forensic': 18, 'incident response': 18, 'siem': 18,
      'zero-trust': 18, 'rbac': 15, 'iam': 15, 'auth': 10,
      'passkey': 18, 'mfa': 15, '2fa': 15, 'secret': 10
    }
  },

  // Data & Analytics - data science, visualization, BI
  'Analytics': {
    keywords: {
      'data science': 18, 'data analysis': 18, 'analytics': 15,
      'pandas': 18, 'numpy': 15, 'scipy': 15, 'statistics': 15,
      'visualization': 15, 'matplotlib': 18, 'seaborn': 18, 'plotly': 18,
      'dashboard': 15, 'tableau': 18, 'powerbi': 18, 'looker': 18,
      'excel': 15, 'spreadsheet': 15, 'csv': 10,
      'exploratory': 15, 'eda': 18, 'feature engineering': 18,
      'time series': 18, 'forecasting': 15, 'regression': 12,
      'clustering': 15, 'classification': 12, 'prediction': 12,
      'report': 10, 'insight': 12, 'chart': 12, 'graph': 10
    }
  },

  // Automation & Workflows - automation tools, scripts, productivity
  'Automation': {
    keywords: {
      'automation': 18, 'automate': 15, 'zapier': 20, 'n8n': 20,
      'integromat': 20, 'ifttt': 20, 'power automate': 20,
      'bot': 15, 'scheduler': 18, 'cron': 18,
      'email automation': 20, 'webhook': 15,
      'scraping': 18, 'web scraper': 20, 'crawler': 18,
      'file organizer': 20, 'batch processing': 15, 'bulk': 12,
      'skill': 15, 'creator': 12, 'builder': 12, 'extends': 12,
      'raffle': 18, 'picker': 15, 'random': 12
    }
  },

  // Documentation & Content - docs, writing, content creation, comms
  'Documentation': {
    keywords: {
      'documentation': 15, 'docs': 12, 'readme': 15, 'technical writing': 18,
      'markdown': 12, 'docusaurus': 18, 'gitbook': 18, 'confluence': 15,
      'api docs': 18, 'openapi': 18, 'swagger': 18,
      'changelog': 18, 'release notes': 18, 'adr': 18,
      'tutorial': 15, 'guide': 10, 'handbook': 15,
      'content': 10, 'writing': 10, 'blog': 12, 'article': 10,
      'seo': 15, 'copywriting': 18, 'newsletter': 15, 'email': 8,
      'social media': 15, 'marketing': 12, 'copy': 8,
      'communication': 15, 'comms': 18, 'internal': 10, 'memo': 15,
      'presentation': 15, 'slide': 15, 'pptx': 18, 'deck': 12,
      'pdf': 20, 'docx': 20, 'document': 12, 'text': 8, 'extract': 10
    }
  },

  // Version Control & Code Quality - git, reviews, code management
  'Code Management': {
    keywords: {
      'git': 15, 'github': 12, 'gitlab': 15, 'bitbucket': 15,
      'commit': 15, 'branch': 12, 'merge': 12, 'rebase': 18,
      'pull request': 18, 'pr review': 18, 'code review': 15,
      'version control': 18, 'monorepo': 18, 'gitflow': 18,
      'linter': 18, 'formatter': 15, 'eslint': 18, 'prettier': 18,
      'debugging': 15, 'profiler': 18, 'debugger': 18,
      'refactor': 15, 'code quality': 18, 'static analysis': 18,
      'sonarqube': 18, 'codeclimate': 18, 'complexity': 12,
      'iterate': 15, 'ci': 10, 'fix': 8, 'check': 8
    }
  },

  // Science & Research - scientific computing, bioinformatics, academic
  'Science': {
    keywords: {
      'bioinformatics': 35, 'genomics': 35, 'proteomics': 35,
      'protein': 25, 'dna': 30, 'rna': 30, 'gene': 25,
      'molecular': 25, 'drug discovery': 35, 'pharmaceutical': 30,
      'clinical trial': 30, 'medical research': 25,
      'fda': 30, 'ncbi': 30, 'uniprot': 30, 'pubmed': 25,
      'alphafold': 35, 'chemistry': 25, 'molecule': 25,
      'single-cell': 35, 'scanpy': 35, 'sequencing': 30,
      'pathway': 30, 'metabolomics': 35, 'enzyme': 30,
      'scientific computing': 30, 'academic research': 25,
      'literature review': 25, 'arxiv': 20,
      'hypothesis': 20, 'laboratory': 25,
      'fluid dynamics': 35, 'physics simulation': 30,
      'capa': 30, 'quality management': 25
    }
  },

  // Blockchain & Web3 - crypto, DeFi, smart contracts
  'Blockchain': {
    keywords: {
      'blockchain': 20, 'web3': 20, 'crypto': 18, 'cryptocurrency': 20,
      'defi': 25, 'decentralized': 18, 'smart contract': 22,
      'solidity': 22, 'ethereum': 20, 'solana': 20, 'polygon': 20,
      'nft': 20, 'token': 12, 'wallet': 15, 'metamask': 20,
      'staking': 20, 'amm': 22, 'governance': 15, 'lending': 12,
      'dex': 20, 'dao': 20, 'yield': 15, 'liquidity': 18,
      'hardhat': 22, 'foundry': 20, 'truffle': 20, 'wagmi': 20,
      'ipfs': 18, 'arweave': 20, 'chain': 10
    }
  }
};

// Determine category for a skill using scoring
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

    if (score > 0) {
      scores[category] = score;
    }
  }

  // Find highest scoring category
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

// Generate file structure JSON
function generateFilesJson(skill) {
  const files = [];

  if (skill.files) {
    Object.keys(skill.files).forEach(filePath => {
      const fileName = filePath.split('/').pop();
      files.push({
        path: filePath,
        name: fileName,
        size: skill.files[filePath]?.length || 1024,
        type: 'file'
      });
    });
  } else {
    files.push(
      { path: 'SKILL.md', name: 'SKILL.md', size: 2048, type: 'file' },
      { path: 'README.md', name: 'README.md', size: 4096, type: 'file' }
    );
  }

  return JSON.stringify(files);
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

// Get R2 file key for skill
function getR2FileKey(skill) {
  const author = skill.author?.toLowerCase() || 'unknown';
  const name = skill.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'unknown';
  return `skills/${author}/${name}/skill.zip`;
}

// Generate SQL
let sql = `-- Seed data for Agent Skills Marketplace
-- Generated at: ${new Date().toISOString()}
-- ${skills.length} skills from claude-skills-complete.json (uploaded to R2)
-- Run with: wrangler d1 execute agentskills-db --local --file=./seed.sql

-- Clear existing GitHub-sourced skills (preserve user-created skills)
DELETE FROM skills WHERE creator_id IS NULL;

`;

// Track categories for summary
const categoryCounts = {};
const categoryExamples = {};

skills.forEach((skill, index) => {
  const uuid = generateUuid(skill.id, index);
  const filesJson = generateFilesJson(skill);
  const skillMdParsed = generateSkillMdParsed(skill);
  const now = Date.now();

  // Extract real SKILL.md content from files
  function getSkillMdContent(skill) {
    if (skill.files) {
      const mdKey = Object.keys(skill.files).find(k => k.toLowerCase().includes('skill.md'));
      if (mdKey && skill.files[mdKey]) {
        return skill.files[mdKey];
      }
    }
    return `# ${skill.name}\n\n${skill.description || 'No description available.'}`;
  }
  const skillMdContent = getSkillMdContent(skill);

  // Get R2 file key
  const r2FileKey = getR2FileKey(skill);

  // Determine category using keyword matching
  const category = categorizeSkill(skill);

  // Generate reasonable metrics
  const starsCount = skill.starsCount || Math.floor(Math.random() * 1000);
  const forksCount = skill.forksCount || Math.floor(starsCount * 0.1);
  const downloadCount = Math.floor(starsCount * 0.01) + Math.floor(Math.random() * 50);
  const avgRating = (4.0 + Math.random() * 1.0).toFixed(1);
  const ratingCount = Math.floor(starsCount * 0.001) + Math.floor(Math.random() * 20);
  const fileSize = skill.fileSize || Math.floor(5000 + Math.random() * 50000);

  // Track category counts and examples
  categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  if (!categoryExamples[category]) {
    categoryExamples[category] = [];
  }
  if (categoryExamples[category].length < 5) {
    categoryExamples[category].push(skill.name);
  }

  sql += `INSERT OR REPLACE INTO skills (
  id, name, description, author, author_avatar_url, github_url,
  stars_count, forks_count, category, r2_file_key, file_size,
  download_count, avg_rating, rating_count, last_commit_at,
  files_json, skill_md_content, skill_md_parsed, created_at, updated_at
) VALUES (
  '${uuid}',
  '${escapeSql(skill.name)}',
  '${escapeSql(skill.description?.slice(0, 500))}',
  '${escapeSql(skill.author)}',
  '${escapeSql(skill.authorAvatarUrl)}',
  '${escapeSql(skill.githubUrl)}',
  ${starsCount},
  ${forksCount},
  '${escapeSql(category)}',
  '${escapeSql(r2FileKey)}',
  ${fileSize},
  ${downloadCount},
  ${avgRating},
  ${ratingCount},
  ${skill.lastCommitAt || now},
  '${escapeSql(filesJson)}',
  '${escapeSql(skillMdContent.slice(0, 10000))}',
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

// Log category summary
console.log('\nCategory breakdown:');
Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    const examples = categoryExamples[category].slice(0, 3).join(', ');
    console.log(`  ${category}: ${count} skills (e.g., ${examples})`);
  });

console.log(`\nTotal: ${skills.length} skills`);
console.log(`Categories: ${Object.keys(categoryCounts).length}`);
