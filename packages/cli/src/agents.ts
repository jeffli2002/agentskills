// Agent detection: find which AI agents are installed on this machine

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface AgentInfo {
  name: string;
  projectPath: string;  // relative to cwd
  globalPath: string;   // absolute
  detected: boolean;
}

const AGENTS: Omit<AgentInfo, 'detected'>[] = [
  { name: 'Claude Code', projectPath: '.claude/skills', globalPath: join(homedir(), '.claude', 'skills') },
  { name: 'Cursor', projectPath: '.cursor/skills', globalPath: join(homedir(), '.cursor', 'skills') },
  { name: 'Codex CLI', projectPath: '.codex/skills', globalPath: join(homedir(), '.codex', 'skills') },
  { name: 'OpenClaw', projectPath: 'skills', globalPath: join(homedir(), '.clawdbot', 'skills') },
  { name: 'OpenCode', projectPath: '.opencode/skills', globalPath: join(homedir(), '.opencode', 'skills') },
];

export function detectAgents(cwd: string): AgentInfo[] {
  return AGENTS.map(agent => {
    const projectDir = join(cwd, agent.projectPath, '..');
    const globalDir = join(agent.globalPath, '..');
    const detected = existsSync(projectDir) || existsSync(globalDir);
    return { ...agent, detected };
  });
}
