#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { readFileSync, existsSync } from 'node:fs';
import { detectAgents } from './agents.js';
import { searchSkills, getSkillByName, fetchOpenClawExport, convertPaste, convertGithub } from './api.js';
import { installSkill, listInstalledSkills } from './installer.js';

// ─── Colors (no dependencies) ───────────────────────────────────────────────

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

// ─── Help ───────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
${bold('agentskills')} - Install AI agent skills from agentskills.cv

${bold('USAGE')}
  npx agentskills ${cyan('<command>')} [options]

${bold('COMMANDS')}
  ${cyan('install')} <name>    Install a skill to detected agents
  ${cyan('search')}  <query>   Search skills on the marketplace
  ${cyan('convert')} <source>  Convert file or URL to OpenClaw format
  ${cyan('list')}              List installed skills
  ${cyan('agents')}            Show detected AI agents

${bold('OPTIONS')}
  ${dim('--global, -g')}      Install to global skills directory (~/)
  ${dim('--install')}          With convert: install after converting
  ${dim('--help, -h')}        Show this help message
  ${dim('--version, -v')}     Show version

${bold('EXAMPLES')}
  npx agentskills install commit-analyzer
  npx agentskills install commit-analyzer --global
  npx agentskills search "git commit"
  npx agentskills convert ./my-skill.md
  npx agentskills convert https://github.com/user/repo
  npx agentskills convert ./my-skill.md --install
  npx agentskills list
  npx agentskills agents
`);
}

// ─── Commands ───────────────────────────────────────────────────────────────

async function cmdInstall(skillName: string, global: boolean) {
  const cwd = process.cwd();

  // 1. Detect agents
  console.log(dim('  Detecting installed agents...'));
  const agents = detectAgents(cwd);
  const detected = agents.filter(a => a.detected);

  if (detected.length === 0) {
    console.log(yellow('  No agents detected. Will install to Claude Code directory.'));
  } else {
    console.log(`  Found: ${detected.map(a => cyan(a.name)).join(', ')}`);
  }

  // 2. Find skill
  console.log(dim(`  Searching for "${skillName}"...`));
  const skill = await getSkillByName(skillName);
  if (!skill) {
    console.log(red(`  Error: Skill "${skillName}" not found on agentskills.cv`));
    process.exit(1);
  }
  console.log(`  Found: ${bold(skill.name)} by ${dim(skill.author)} ${dim(`(${skill.category})`)}`);

  // 3. Fetch OpenClaw-compliant SKILL.md (+ resources)
  console.log(dim('  Converting to OpenClaw format...'));
  const { skillMd, resources } = await fetchOpenClawExport(skill.id);

  if (resources.length > 0) {
    console.log(`  Found ${cyan(resources.length.toString())} resource file(s)`);
  }

  // 4. Install
  const scope = global ? 'global' : 'project';
  console.log(dim(`  Installing (${scope})...`));
  const results = installSkill(skill.name, skillMd, agents, cwd, global, resources);

  // 5. Report
  console.log('');
  for (const r of results) {
    if (r.success) {
      const fileInfo = r.filesWritten > 1 ? dim(` (${r.filesWritten} files)`) : '';
      console.log(`  ${green('✓')} ${r.agent}: ${dim(r.path)}${fileInfo}`);
    } else {
      console.log(`  ${red('✗')} ${r.agent}: ${r.error}`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  if (successCount > 0) {
    console.log(`\n  ${green('Done!')} Installed ${bold(skill.name)} to ${successCount} agent(s).`);
  } else {
    console.log(`\n  ${red('Failed to install skill.')}`);
    process.exit(1);
  }
}

async function cmdSearch(query: string) {
  console.log(dim(`  Searching for "${query}"...\n`));
  const results = await searchSkills(query);

  if (results.data.length === 0) {
    console.log(yellow('  No skills found.'));
    return;
  }

  console.log(`  ${dim(`${results.total} results (showing ${results.data.length}):`)}\n`);

  for (const skill of results.data) {
    const stars = dim(`★ ${skill.starsCount}`);
    const cat = dim(`[${skill.category}]`);
    console.log(`  ${bold(skill.name)} ${stars} ${cat}`);
    console.log(`  ${dim(skill.description.length > 80 ? skill.description.slice(0, 80) + '...' : skill.description)}`);
    console.log('');
  }

  console.log(dim(`  Install with: npx agentskills install <name>`));
}

function cmdList(global: boolean) {
  const cwd = process.cwd();
  const agents = detectAgents(cwd);
  const results = listInstalledSkills(agents, cwd, global);

  if (results.length === 0) {
    console.log(yellow('  No skills installed.'));
    console.log(dim('  Install with: npx agentskills install <name>'));
    return;
  }

  for (const { agent, skills } of results) {
    console.log(`\n  ${bold(agent)} ${dim(`(${skills.length} skills)`)}`);
    for (const skill of skills) {
      console.log(`    ${green('•')} ${skill}`);
    }
  }
  console.log('');
}

function cmdAgents() {
  const cwd = process.cwd();
  const agents = detectAgents(cwd);

  console.log(`\n  ${bold('Agent Detection Results')}\n`);

  for (const agent of agents) {
    const status = agent.detected ? green('✓ detected') : dim('not found');
    console.log(`  ${agent.detected ? green('•') : dim('•')} ${bold(agent.name)} ${status}`);
    console.log(`    ${dim(`project: ${agent.projectPath}/`)}`);
    console.log(`    ${dim(`global:  ${agent.globalPath}/`)}`);
    console.log('');
  }
}

async function cmdConvert(source: string, install: boolean, global: boolean) {
  const cwd = process.cwd();
  const isUrl = source.startsWith('http://') || source.startsWith('https://') || source.startsWith('github.com');

  let result: { skillMd: string; validation: { score: number; checks: { field: string; passed: boolean; message: string; autoFixed: boolean }[] } };

  if (isUrl) {
    // GitHub URL
    const url = source.startsWith('http') ? source : `https://${source}`;
    console.log(dim(`  Importing from GitHub: ${url}`));
    result = await convertGithub(url);
  } else {
    // Local file
    if (!existsSync(source)) {
      console.log(red(`  Error: File not found: ${source}`));
      process.exit(1);
    }
    console.log(dim(`  Reading: ${source}`));
    const content = readFileSync(source, 'utf-8');
    result = await convertPaste(content, source);
  }

  // Display validation
  console.log('');
  console.log(`  ${bold('Validation')} (score: ${result.validation.score >= 80 ? green(result.validation.score.toString()) : result.validation.score >= 50 ? yellow(result.validation.score.toString()) : red(result.validation.score.toString())}/100)`);
  console.log('');

  for (const check of result.validation.checks) {
    const icon = check.passed ? green('✓') : check.autoFixed ? yellow('~') : dim('·');
    const suffix = check.autoFixed ? dim(' (auto-fixed)') : '';
    console.log(`  ${icon} ${check.message}${suffix}`);
  }

  // Output converted SKILL.md
  console.log('');
  console.log(`  ${bold('Converted SKILL.md')} (${result.skillMd.length} bytes)`);

  if (install) {
    // Install the converted skill
    const agents = detectAgents(cwd);
    const nameMatch = result.skillMd.match(/^name:\s*(.+)$/m);
    const skillName = nameMatch ? nameMatch[1].trim() : 'converted-skill';

    const scope = global ? 'global' : 'project';
    console.log(dim(`  Installing "${skillName}" (${scope})...`));
    const results = installSkill(skillName, result.skillMd, agents, cwd, global);

    console.log('');
    for (const r of results) {
      if (r.success) {
        console.log(`  ${green('✓')} ${r.agent}: ${dim(r.path)}`);
      } else {
        console.log(`  ${red('✗')} ${r.agent}: ${r.error}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      console.log(`\n  ${green('Done!')} Converted and installed to ${successCount} agent(s).`);
    }
  } else {
    // Write to stdout or file
    const { writeFileSync } = await import('node:fs');
    writeFileSync('SKILL.md', result.skillMd, 'utf-8');
    console.log(`  ${green('✓')} Written to ${bold('SKILL.md')}`);
    console.log(dim(`  Tip: use --install to install directly, or --install -g for global`));
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      global: { type: 'boolean', short: 'g', default: false },
      install: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false },
    },
  });

  if (values.version) {
    console.log('agentskills v0.1.0');
    return;
  }

  if (values.help || positionals.length === 0) {
    printHelp();
    return;
  }

  const command = positionals[0];
  const arg = positionals[1];

  console.log('');

  try {
    switch (command) {
      case 'install':
      case 'add':
      case 'i':
        if (!arg) {
          console.log(red('  Error: Please specify a skill name.'));
          console.log(dim('  Usage: npx agentskills install <name>'));
          process.exit(1);
        }
        await cmdInstall(arg, values.global!);
        break;

      case 'search':
      case 's':
        if (!arg) {
          console.log(red('  Error: Please specify a search query.'));
          process.exit(1);
        }
        await cmdSearch(positionals.slice(1).join(' '));
        break;

      case 'list':
      case 'ls':
        cmdList(values.global!);
        break;

      case 'agents':
        cmdAgents();
        break;

      case 'convert':
      case 'c':
        if (!arg) {
          console.log(red('  Error: Please specify a file path or GitHub URL.'));
          console.log(dim('  Usage: npx agentskills convert <source>'));
          process.exit(1);
        }
        await cmdConvert(arg, values.install!, values.global!);
        break;

      default:
        console.log(red(`  Unknown command: ${command}`));
        printHelp();
        process.exit(1);
    }
  } catch (err) {
    console.log(red(`\n  Error: ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }
}

main();
