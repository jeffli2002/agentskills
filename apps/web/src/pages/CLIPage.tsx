import { useState } from 'react';
import { Check, Copy, Terminal, Monitor, Globe, ArrowRight, Server, HardDrive } from 'lucide-react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

interface CopyBlockProps {
  command: string;
  label?: string;
}

function CopyBlock({ command, label }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };
  return (
    <div className="relative group">
      {label && <p className="text-xs text-zinc-500 mb-1.5 font-mono">{label}</p>}
      <div className="bg-[#0d0d1a] rounded-md p-3 pr-10 font-mono text-sm text-emerald-400 overflow-x-auto border border-[#2d2d44]">
        <span className="text-zinc-500">$ </span>
        {command}
      </div>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-[#2d2d44] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        aria-label="Copy command"
      >
        {copied
          ? <Check className="h-4 w-4 text-emerald-400" />
          : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

const AGENTS = [
  { name: 'Claude Code', path: '.claude/skills/', globalPath: '~/.claude/skills/', color: 'text-amber-400' },
  { name: 'Cursor', path: '.cursor/skills/', globalPath: '~/.cursor/skills/', color: 'text-blue-400' },
  { name: 'Codex CLI', path: '.codex/skills/', globalPath: '~/.codex/skills/', color: 'text-green-400' },
  { name: 'OpenClaw', path: 'skills/', globalPath: '~/.openclaw/skills/', color: 'text-purple-400' },
  { name: 'OpenCode', path: '.opencode/skills/', globalPath: '~/.opencode/skills/', color: 'text-cyan-400' },
];

export function CLIPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Terminal breadcrumb */}
      <div className="bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4">
        <div className="container mx-auto">
          <code className="font-mono text-sm text-[#e4e4e7]">
            <span className="text-emerald-400">$</span>
            {' '}
            <span className="text-zinc-400">npx</span>
            {' '}
            <span className="text-amber-400 font-semibold">agentskills</span>
            {' '}
            <span className="text-zinc-400">--help</span>
          </code>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Hero section */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Terminal className="h-8 w-8 text-amber-400" />
              <h1 className="text-3xl font-bold text-[#e4e4e7]">AgentSkills CLI</h1>
            </div>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Install skills directly from the marketplace to all your AI agents. One command, every agent.
            </p>
            <div className="mt-6 max-w-lg mx-auto">
              <CopyBlock command="npx agentskills install <skill-name>" />
            </div>
          </div>

          {/* Quick start */}
          <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden mb-8">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2d2d44] bg-[#252538]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm text-zinc-400 font-mono">Quick Start</span>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm text-zinc-300 mb-2">
                  <span className="text-amber-400 font-mono font-bold">1.</span>
                  {" "}Search for a skill
                </p>
                <CopyBlock command='npx agentskills search "git commit"' />
              </div>
              <div>
                <p className="text-sm text-zinc-300 mb-2">
                  <span className="text-amber-400 font-mono font-bold">2.</span>
                  {" "}Install to your project
                </p>
                <CopyBlock command="npx agentskills install git-commit" />
              </div>
              <div>
                <p className="text-sm text-zinc-300 mb-2">
                  <span className="text-amber-400 font-mono font-bold">3.</span>
                  {" "}Or install globally
                </p>
                <CopyBlock command="npx agentskills install git-commit --global" />
              </div>
              <div>
                <p className="text-sm text-zinc-300 mb-2">
                  <span className="text-amber-400 font-mono font-bold">4.</span>
                  {" "}See what you have installed
                </p>
                <CopyBlock command="npx agentskills list" />
              </div>
            </div>
          </div>

          {/* Two column: Commands + How it works */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">

            {/* Commands reference */}
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2d2d44]">
                <h3 className="font-semibold text-[#e4e4e7]">Commands</h3>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-[#2d2d44]">
                      <td className="py-2.5 pr-3 font-mono text-amber-400 whitespace-nowrap">install</td>
                      <td className="py-2.5 text-zinc-400">Install a skill to detected agents</td>
                    </tr>
                    <tr className="border-b border-[#2d2d44]">
                      <td className="py-2.5 pr-3 font-mono text-amber-400 whitespace-nowrap">search</td>
                      <td className="py-2.5 text-zinc-400">Search the marketplace</td>
                    </tr>
                    <tr className="border-b border-[#2d2d44]">
                      <td className="py-2.5 pr-3 font-mono text-amber-400 whitespace-nowrap">list</td>
                      <td className="py-2.5 text-zinc-400">Show installed skills</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-3 font-mono text-amber-400 whitespace-nowrap">agents</td>
                      <td className="py-2.5 text-zinc-400">Detect installed AI agents</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2d2d44]">
                <h3 className="font-semibold text-[#e4e4e7]">How It Works</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-400">1</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-medium">Fetch from marketplace</p>
                    <p className="text-xs text-zinc-500">Downloads skill from agentskills.cv API</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-400">2</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-medium">Convert to open standard</p>
                    <p className="text-xs text-zinc-500">Generates OpenClaw-compliant SKILL.md</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-400">3</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-medium">Auto-detect agents</p>
                    <p className="text-xs text-zinc-500">Finds Claude Code, Cursor, Codex, OpenClaw, etc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-emerald-400">4</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-medium">Install everywhere</p>
                    <p className="text-xs text-zinc-500">Places SKILL.md in each agent's skills directory</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Supported agents */}
          <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-[#2d2d44]">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-zinc-400" />
                <h3 className="font-semibold text-[#e4e4e7]">Supported Agents</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AGENTS.map(agent => (
                  <div key={agent.name} className="bg-[#252538] rounded-md p-3 border border-[#2d2d44]">
                    <p className={`text-sm font-medium ${agent.color} mb-1.5`}>{agent.name}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[#1a1a2e] text-zinc-500 border-[#2d2d44]">project</Badge>
                        <code className="text-xs text-zinc-400 font-mono">{agent.path}</code>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[#1a1a2e] text-zinc-500 border-[#2d2d44]">global</Badge>
                        <code className="text-xs text-zinc-400 font-mono">{agent.globalPath}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enable skills on VPS / Local */}
          <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-[#2d2d44] bg-[#252538]">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold text-[#e4e4e7]">Enable Skills on VPS / Local</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* VPS */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-4 w-4 text-purple-400" />
                  <p className="text-sm text-zinc-200 font-medium">Install on OpenClaw VPS</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1.5">Install directly from marketplace (requires Node.js)</p>
                    <CopyBlock command="npx agentskills install <skill-name> --global" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1.5">Or fetch with curl (no Node.js needed)</p>
                    <CopyBlock command={'mkdir -p ~/.openclaw/skills/<skill-name> && curl -o ~/.openclaw/skills/<skill-name>/SKILL.md "https://agentskills.cv/api/skills/<skill-id>/export/openclaw"'} />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2d2d44]" />

              {/* Local */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="h-4 w-4 text-amber-400" />
                  <p className="text-sm text-zinc-200 font-medium">Enable downloaded SKILL.md locally</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500">If you already have a SKILL.md file, copy it to your agent's skills directory:</p>
                  <CopyBlock command="mkdir -p ~/.openclaw/skills/<skill-name> && cp SKILL.md ~/.openclaw/skills/<skill-name>/" label="OpenClaw" />
                  <CopyBlock command="mkdir -p .claude/skills/<skill-name> && cp SKILL.md .claude/skills/<skill-name>/" label="Claude Code (project)" />
                  <CopyBlock command="mkdir -p ~/.claude/skills/<skill-name> && cp SKILL.md ~/.claude/skills/<skill-name>/" label="Claude Code (global)" />
                </div>
              </div>
            </div>
          </div>

          {/* Options table */}
          <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-[#2d2d44]">
              <h3 className="font-semibold text-[#e4e4e7]">Options</h3>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-[#2d2d44]">
                    <td className="py-2.5 pr-4 font-mono text-emerald-400 whitespace-nowrap">--global, -g</td>
                    <td className="py-2.5 text-zinc-400">Install to global skills directory (~/)</td>
                  </tr>
                  <tr className="border-b border-[#2d2d44]">
                    <td className="py-2.5 pr-4 font-mono text-emerald-400 whitespace-nowrap">--help, -h</td>
                    <td className="py-2.5 text-zinc-400">Show help message</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-mono text-emerald-400 whitespace-nowrap">--version, -v</td>
                    <td className="py-2.5 text-zinc-400">Show version number</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <p className="text-zinc-400 mb-4">Browse the marketplace to find skills to install</p>
            <Link href="/skills">
              <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-md transition-colors cursor-pointer">
                Browse Skills
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
