// Installer: place skills into agent directories

import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { AgentInfo } from './agents.js';

export interface InstallResult {
  agent: string;
  path: string;
  success: boolean;
  filesWritten: number;
  error?: string;
}

export interface ResourceFile {
  path: string;
  content: string;
}

function sanitizeDirName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Validate resource paths don't escape the skill directory
function isSafePath(resourcePath: string): boolean {
  const normalized = resourcePath.replace(/\\/g, '/');
  return !normalized.startsWith('/') && !normalized.includes('..');
}

export function installSkill(
  skillName: string,
  skillMd: string,
  agents: AgentInfo[],
  cwd: string,
  global: boolean,
  resources?: ResourceFile[],
): InstallResult[] {
  const dirName = sanitizeDirName(skillName);
  const results: InstallResult[] = [];

  const detectedAgents = agents.filter(a => a.detected);
  if (detectedAgents.length === 0) {
    // Fallback: install to Claude Code (most common)
    detectedAgents.push(agents.find(a => a.name === 'Claude Code')!);
  }

  for (const agent of detectedAgents) {
    const basePath = global ? agent.globalPath : join(cwd, agent.projectPath);
    const skillDir = join(basePath, dirName);

    try {
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), skillMd, 'utf-8');
      let filesWritten = 1;

      // Write resource files
      if (resources && resources.length > 0) {
        for (const resource of resources) {
          if (!isSafePath(resource.path)) continue;
          const filePath = join(skillDir, resource.path);
          mkdirSync(dirname(filePath), { recursive: true });
          writeFileSync(filePath, resource.content, 'utf-8');
          filesWritten++;
        }
      }

      results.push({ agent: agent.name, path: skillDir, success: true, filesWritten });
    } catch (err) {
      results.push({
        agent: agent.name,
        path: skillDir,
        success: false,
        filesWritten: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

export function listInstalledSkills(agents: AgentInfo[], cwd: string, global: boolean): { agent: string; skills: string[] }[] {
  const results: { agent: string; skills: string[] }[] = [];

  for (const agent of agents.filter(a => a.detected)) {
    const basePath = global ? agent.globalPath : join(cwd, agent.projectPath);
    const skills: string[] = [];

    if (existsSync(basePath)) {
      try {
        const entries = readdirSync(basePath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && existsSync(join(basePath, entry.name, 'SKILL.md'))) {
            skills.push(entry.name);
          }
        }
      } catch {
        // Permission denied or other error
      }
    }

    if (skills.length > 0) {
      results.push({ agent: agent.name, skills });
    }
  }

  return results;
}
