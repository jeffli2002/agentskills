import { useState, useEffect, type ReactNode } from 'react';
import { useParams, Link } from 'wouter';
import { getSkill, getOpenClawExport, getOpenClawExportUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Download, ArrowLeft, ExternalLink, Server, HardDrive } from 'lucide-react';
import type { Skill } from '@agentskills/shared';

interface OpenClawLogoProps {
  className?: string;
}

function OpenClawLogo({ className }: OpenClawLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 9.5C8 9.5 9.5 8 12 8s4 1.5 4 1.5" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <path d="M9 15.5s1.5 1.5 3 1.5 3-1.5 3-1.5" />
      </g>
    </svg>
  );
}

// Syntax highlighting for SKILL.md content
function renderHighlightedContent(content: string): ReactNode[] {
  const lines = content.split('\n');
  let inFrontmatter = false;
  let frontmatterCount = 0;

  return lines.map((line, i) => {
    if (line.trim() === '---') {
      frontmatterCount++;
      if (frontmatterCount <= 2) {
        inFrontmatter = frontmatterCount === 1;
        return (
          <span key={i} className="text-zinc-500">
            {line + '\n'}
          </span>
        );
      }
    }

    if (inFrontmatter) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx);
        const value = line.slice(colonIdx);
        return (
          <span key={i}>
            <span className="text-amber-400">{key}</span>
            <span className="text-zinc-300">{value}</span>
            {'\n'}
          </span>
        );
      }
      // List items in frontmatter
      if (line.match(/^\s+-\s/)) {
        return (
          <span key={i} className="text-emerald-400">
            {line + '\n'}
          </span>
        );
      }
    }

    // Markdown heading
    if (line.startsWith('#')) {
      return (
        <span key={i} className="text-amber-300 font-semibold">
          {line + '\n'}
        </span>
      );
    }

    // Regular content
    return <span key={i}>{line + '\n'}</span>;
  });
}

export function OpenClawExportPage() {
  const { id } = useParams<{ id: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [exportContent, setExportContent] = useState<string | null>(null);
  const [exportName, setExportName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [skillData, exportData] = await Promise.all([
          getSkill(id),
          getOpenClawExport(id),
        ]);
        if (!skillData) {
          setError('Skill not found');
        } else {
          setSkill(skillData);
          setExportContent(exportData.content);
          setExportName(exportData.name);
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load skill export');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleCopy = async () => {
    if (!exportContent) return;
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied
    }
  };

  const handleDownload = () => {
    if (!exportContent) return;
    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SKILL.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4">
          <div className="container mx-auto">
            <div className="h-5 bg-[#2d2d44] rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-10 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-96 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !skill || !exportContent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">
              {error || 'Export not available'}
            </h1>
            <p className="text-muted-foreground mb-8">
              The skill could not be exported to OpenClaw format.
            </p>
            <Link href={`/skills/${id}`}>
              <Button>Back to Skill</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse frontmatter fields for the info card
  const frontmatterLines = exportContent.split('\n');
  const frontmatterFields: { key: string; value: string }[] = [];
  let inFrontmatter = false;
  for (const line of frontmatterLines) {
    if (line.trim() === '---') {
      if (inFrontmatter) break;
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter && line.includes(':')) {
      const colonIdx = line.indexOf(':');
      frontmatterFields.push({
        key: line.slice(0, colonIdx).trim(),
        value: line.slice(colonIdx + 1).trim(),
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Terminal breadcrumb */}
      <div className="bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4">
        <div className="container mx-auto">
          <code className="font-mono text-sm text-[#e4e4e7]">
            <span className="text-emerald-400">$</span>{' '}
            <span className="text-zinc-400">openclaw export</span>{' '}
            <span className="text-amber-500">~</span>
            <span className="text-zinc-500"> / </span>
            <span className="text-amber-400">{skill.author}</span>
            <span className="text-zinc-500"> / </span>
            <span className="text-amber-300 font-semibold">{skill.name}</span>
          </code>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <div className="mb-6">
            <Link href={`/skills/${id}`}>
              <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Back to {skill.name}
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <OpenClawLogo className="h-8 w-8 text-amber-400" />
              <h1 className="text-2xl font-bold text-[#e4e4e7]">
                OpenClaw Export
              </h1>
            </div>
            <p className="text-zinc-400 text-sm">
              Convert{' '}
              <span className="text-amber-400 font-medium">{skill.name}</span>
              {' '}to OpenClaw-compliant SKILL.md format for publishing to ClawHub.
            </p>
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: SKILL.md preview */}
            <div className="lg:col-span-2">
              <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d44] bg-[#252538]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm text-zinc-400 font-mono">
                      SKILL.md
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    >
                      OpenClaw
                    </Badge>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded hover:bg-[#2d2d44] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    aria-label="Copy SKILL.md content"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* Content */}
                <div className="p-4 overflow-x-auto">
                  <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                    {renderHighlightedContent(exportContent)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Actions card */}
              <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2d2d44]">
                  <h3 className="font-semibold text-[#e4e4e7]">Actions</h3>
                </div>
                <div className="p-4 space-y-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-md transition-colors cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download SKILL.md
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#252538] hover:bg-[#2d2d44] text-[#e4e4e7] font-medium rounded-md transition-colors border border-[#2d2d44] cursor-pointer"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              </div>

              {/* Compliance card */}
              <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2d2d44]">
                  <h3 className="font-semibold text-[#e4e4e7]">Compliance</h3>
                </div>
                <div className="p-4 space-y-2">
                  {frontmatterFields.map(({ key, value }) => (
                    <div
                      key={key}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-zinc-500 font-mono shrink-0">
                        {key + ':'}
                      </span>
                      <span className="text-zinc-300 font-mono break-all">
                        {value.length > 60
                          ? value.substring(0, 60) + '...'
                          : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info card */}
              <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2d2d44]">
                  <h3 className="font-semibold text-[#e4e4e7]">
                    About OpenClaw
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    OpenClaw is an open standard for AI agent skills. This
                    export generates a compliant SKILL.md with validated name,
                    description, and frontmatter fields.
                  </p>
                  <div className="space-y-1.5 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Name: lowercase alphanumeric + hyphens (1-64 chars)
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Description: single-line, max 1024 chars
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      YAML frontmatter with required fields
                    </div>
                  </div>
                </div>
              </div>

              {/* Enable on VPS / Local card */}
              <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2d2d44]">
                  <h3 className="font-semibold text-[#e4e4e7]">
                    Enable This Skill
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* VPS */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Server className="h-3.5 w-3.5 text-purple-400" />
                      <p className="text-xs text-zinc-300 font-medium">On OpenClaw VPS</p>
                    </div>
                    <div className="bg-[#0d0d1a] rounded-md p-2.5 font-mono text-xs text-emerald-400 overflow-x-auto border border-[#2d2d44] leading-relaxed">
                      <span className="text-zinc-500">$ </span>npx agentskills install {exportName} --global
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1.5">
                      Or with curl: <code className="text-zinc-500">curl -o ~/.openclaw/skills/{exportName}/SKILL.md "https://agentskills.cv/api/skills/{id}/export/openclaw"</code>
                    </p>
                  </div>

                  <div className="border-t border-[#2d2d44]" />

                  {/* Local */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <HardDrive className="h-3.5 w-3.5 text-amber-400" />
                      <p className="text-xs text-zinc-300 font-medium">From downloaded file</p>
                    </div>
                    <div className="bg-[#0d0d1a] rounded-md p-2.5 font-mono text-xs text-emerald-400 overflow-x-auto border border-[#2d2d44] leading-relaxed">
                      <span className="text-zinc-500">$ </span>cp SKILL.md ~/.openclaw/skills/{exportName}/
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1.5">
                      Also works with <code className="text-zinc-500">~/.claude/skills/</code> and <code className="text-zinc-500">~/.cursor/skills/</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}