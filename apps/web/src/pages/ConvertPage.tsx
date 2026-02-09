import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth';
import {
  convertPaste,
  convertGithub,
  convertGithubPick,
  convertSkill,
  getSkills,
  publishConverted,
  type ConversionResult,
  type GithubPickResult,
  type ValidationCheck,
} from '@/lib/api';
import type { Skill } from '@agentskills/shared';
import {
  ClipboardPaste,
  Github,
  Search,
  Sparkles,
  Check,
  Copy,
  Download,
  Upload,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  FolderTree,
  Loader2,
} from 'lucide-react';

// ─── Syntax Highlighting (reused from OpenClawExportPage) ──────────────────

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
      if (line.match(/^\s+-\s/)) {
        return (
          <span key={i} className="text-emerald-400">
            {line + '\n'}
          </span>
        );
      }
    }

    if (line.startsWith('#')) {
      return (
        <span key={i} className="text-amber-300 font-semibold">
          {line + '\n'}
        </span>
      );
    }

    return <span key={i}>{line + '\n'}</span>;
  });
}

// ─── Types ─────────────────────────────────────────────────────────────────

type TabId = 'paste' | 'github' | 'marketplace' | 'ai';
type PipelineStep = 'input' | 'convert' | 'validate' | 'preview';

const TABS: { id: TabId; label: string; icon: typeof ClipboardPaste }[] = [
  { id: 'paste', label: 'Paste / Upload', icon: ClipboardPaste },
  { id: 'github', label: 'GitHub Import', icon: Github },
  { id: 'marketplace', label: 'Marketplace', icon: Search },
  { id: 'ai', label: 'AI Generate', icon: Sparkles },
];

const PIPELINE_STEPS: { id: PipelineStep; label: string; num: number }[] = [
  { id: 'convert', label: 'Convert', num: 1 },
  { id: 'validate', label: 'Validate', num: 2 },
  { id: 'preview', label: 'Preview', num: 3 },
];

// ─── Main Component ────────────────────────────────────────────────────────

export function ConvertPage() {
  const [, navigate] = useLocation();
  const { user, login } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('paste');

  // Input state
  const [pasteContent, setPasteContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // GitHub file picker
  const [githubFiles, setGithubFiles] = useState<string[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);

  // Pipeline state
  const [currentStep, setCurrentStep] = useState<PipelineStep>('input');
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Actions
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Check for ?skill= query param (from skill detail page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skillId = params.get('skill');
    if (skillId) {
      setActiveTab('marketplace');
      handleConvertSkill(skillId);
    }
  }, []);

  // ─── Conversion Handlers ─────────────────────────────────────────────────

  const handleConvertPaste = async () => {
    if (!pasteContent.trim()) return;
    setConverting(true);
    setError(null);
    setCurrentStep('convert');

    try {
      const data = await convertPaste(pasteContent);
      setResult(data);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setCurrentStep('input');
    } finally {
      setConverting(false);
    }
  };

  const handleConvertGithub = async () => {
    if (!githubUrl.trim()) return;
    setConverting(true);
    setError(null);
    setCurrentStep('convert');
    setShowFilePicker(false);

    try {
      const data = await convertGithub(githubUrl);
      if ('needsPick' in data && (data as GithubPickResult).needsPick) {
        setGithubFiles((data as GithubPickResult).files);
        setShowFilePicker(true);
        setCurrentStep('input');
      } else {
        setResult(data as ConversionResult);
        setCurrentStep('preview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub import failed');
      setCurrentStep('input');
    } finally {
      setConverting(false);
    }
  };

  const handleGithubPick = async (file: string) => {
    setConverting(true);
    setError(null);
    setCurrentStep('convert');
    setShowFilePicker(false);

    try {
      const data = await convertGithubPick(githubUrl, file);
      setResult(data);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub import failed');
      setCurrentStep('input');
    } finally {
      setConverting(false);
    }
  };

  const handleConvertSkill = async (skillId: string) => {
    setConverting(true);
    setError(null);
    setCurrentStep('convert');

    try {
      const data = await convertSkill(skillId);
      setResult(data);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setCurrentStep('input');
    } finally {
      setConverting(false);
    }
  };

  // ─── Search Handler ──────────────────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const data = await getSkills({ q: searchQuery, limit: 8 });
      setSearchResults(data.data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  // ─── Action Handlers ─────────────────────────────────────────────────────

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.skillMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.skillMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SKILL.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePublish = async (visibility: 'public' | 'private') => {
    if (!result || !user) return;
    setPublishing(true);
    try {
      const { url } = await publishConverted(result.skillMd, result.resources, visibility);
      navigate(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setCurrentStep('input');
    setPasteContent('');
    setGithubUrl('');
    setSearchQuery('');
    setSearchResults([]);
    setGithubFiles([]);
    setShowFilePicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPasteContent(reader.result as string);
    };
    reader.readAsText(file);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Terminal breadcrumb */}
      <div className="bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4">
        <div className="container mx-auto">
          <code className="font-mono text-sm text-[#e4e4e7]">
            <span className="text-emerald-400">$</span>{' '}
            <span className="text-zinc-400">agentskills</span>{' '}
            <span className="text-amber-400 font-semibold">convert</span>
            {result && (
              <>
                <span className="text-zinc-500"> --source </span>
                <span className="text-emerald-400">{result.original.source}</span>
              </>
            )}
          </code>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#e4e4e7] mb-2">
              Universal Skill Converter
            </h1>
            <p className="text-zinc-400 text-sm">
              Convert any skill to OpenClaw-compliant format. Paste, import from GitHub, or convert from the marketplace.
            </p>
          </div>

          {/* Pipeline Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              {PIPELINE_STEPS.map((step, i) => {
                const isActive = currentStep === step.id || currentStep === 'preview';
                const isComplete = (step.id === 'convert' && (currentStep === 'validate' || currentStep === 'preview'))
                  || (step.id === 'validate' && currentStep === 'preview');
                const isCurrent = converting && step.id === 'convert';

                return (
                  <div key={step.id} className="flex items-center gap-2">
                    {i > 0 && (
                      <div className={`w-12 h-px ${isComplete ? 'bg-emerald-500' : 'bg-[#2d2d44]'}`} />
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        isComplete
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                            ? 'bg-amber-500 text-black'
                            : isActive
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-[#252538] text-zinc-500 border border-[#2d2d44]'
                      }`}>
                        {isComplete ? <Check className="h-3.5 w-3.5" /> : step.num}
                      </div>
                      <span className={`text-sm font-medium ${
                        isComplete ? 'text-emerald-400' : isActive ? 'text-amber-400' : 'text-zinc-500'
                      }`}>
                        {isCurrent ? 'Converting...' : step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300">{error}</p>
                <button
                  onClick={handleReset}
                  className="text-xs text-red-400 hover:text-red-300 mt-1 underline cursor-pointer"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Input Zone (shown when no result) */}
          {!result && !converting && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
              {/* Tab selector */}
              <div className="flex border-b border-[#2d2d44]">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setError(null); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'text-amber-400 border-b-2 border-amber-400 bg-[#252538]'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#252538]/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="p-6">
                {/* Paste / Upload */}
                {activeTab === 'paste' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-300 mb-2">
                        Paste your SKILL.md, README, or any markdown content
                      </label>
                      <textarea
                        value={pasteContent}
                        onChange={(e) => setPasteContent(e.target.value)}
                        placeholder={"---\nname: my-skill\ndescription: \"A helpful skill\"\n---\n\n# My Skill\n\nInstructions here..."}
                        className="w-full h-64 bg-[#0d0d1a] border border-[#2d2d44] rounded-md p-4 text-sm font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleConvertPaste}
                        disabled={!pasteContent.trim()}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Convert
                      </Button>
                      <label className="flex items-center gap-2 px-4 py-2 bg-[#252538] hover:bg-[#2d2d44] text-zinc-300 text-sm rounded-md transition-colors border border-[#2d2d44] cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Upload File
                        <input
                          type="file"
                          accept=".md,.txt,.yaml,.yml"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* GitHub Import */}
                {activeTab === 'github' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-300 mb-2">
                        Enter a public GitHub repository URL
                      </label>
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/owner/repo or github.com/owner/repo/tree/main/skills/my-skill"
                        className="w-full bg-[#0d0d1a] border border-[#2d2d44] rounded-md px-4 py-3 text-sm font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40"
                        onKeyDown={(e) => e.key === 'Enter' && handleConvertGithub()}
                      />
                    </div>
                    <div className="text-xs text-zinc-500 space-y-1">
                      <p>Looks for SKILL.md or README.md in the repo root. Supports subdirectory URLs for monorepos.</p>
                      <p>Also collects files in <code className="text-zinc-400">scripts/</code>, <code className="text-zinc-400">references/</code>, and <code className="text-zinc-400">assets/</code> directories.</p>
                    </div>
                    <Button
                      onClick={handleConvertGithub}
                      disabled={!githubUrl.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Import & Convert
                    </Button>

                    {/* File picker for ambiguous repos */}
                    {showFilePicker && githubFiles.length > 0 && (
                      <div className="mt-4 p-4 bg-[#252538] rounded-md border border-[#2d2d44]">
                        <p className="text-sm text-zinc-300 mb-3">
                          Multiple markdown files found. Select which one to convert:
                        </p>
                        <div className="space-y-2">
                          {githubFiles.map((file) => (
                            <button
                              key={file}
                              onClick={() => handleGithubPick(file)}
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-mono text-zinc-300 bg-[#0d0d1a] hover:bg-[#1a1a2e] rounded border border-[#2d2d44] transition-colors cursor-pointer"
                            >
                              <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                              {file}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Marketplace Search */}
                {activeTab === 'marketplace' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-300 mb-2">
                        Search the marketplace for a skill to convert
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="e.g. commit analyzer, docker, testing..."
                          className="flex-1 bg-[#0d0d1a] border border-[#2d2d44] rounded-md px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40"
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                          onClick={handleSearch}
                          disabled={!searchQuery.trim() || searchLoading}
                          className="bg-[#252538] hover:bg-[#2d2d44] border border-[#2d2d44] text-zinc-300"
                        >
                          {searchLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        {searchResults.map((skill) => (
                          <button
                            key={skill.id}
                            onClick={() => handleConvertSkill(skill.id)}
                            className="flex items-center justify-between w-full px-4 py-3 bg-[#252538] hover:bg-[#2d2d44] rounded-md border border-[#2d2d44] transition-colors cursor-pointer text-left"
                          >
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{skill.name}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {skill.description.length > 80 ? skill.description.slice(0, 80) + '...' : skill.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-4">
                              <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
                              <ArrowRight className="h-4 w-4 text-zinc-500" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Generate */}
                {activeTab === 'ai' && (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                      AI Skill Composer
                    </h3>
                    <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
                      Describe what you want in plain English and our AI will generate a complete,
                      OpenClaw-compliant skill for you.
                    </p>
                    <Link href="/create">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Open Skill Composer
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Converting spinner */}
          {converting && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-12 text-center">
              <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-zinc-300 font-medium">Converting to OpenClaw format...</p>
              <p className="text-xs text-zinc-500 mt-2">Validating compliance and generating frontmatter</p>
            </div>
          )}

          {/* Results Zone */}
          {result && !converting && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Preview */}
              <div className="lg:col-span-2 space-y-4">
                {/* SKILL.md preview */}
                <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d44] bg-[#252538]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-sm text-zinc-400 font-mono">SKILL.md</span>
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
                      aria-label="Copy"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
                    <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                      {renderHighlightedContent(result.skillMd)}
                    </pre>
                  </div>
                </div>

                {/* Resource files */}
                {result.resources.length > 0 && (
                  <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d2d44] bg-[#252538]">
                      <FolderTree className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-zinc-300 font-medium">
                        Resource Files ({result.resources.length})
                      </span>
                    </div>
                    <div className="divide-y divide-[#2d2d44]">
                      {result.resources.map((resource, i) => (
                        <div key={i} className="px-4 py-2.5 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                          <span className="text-sm font-mono text-zinc-300">{resource.path}</span>
                          <span className="text-xs text-zinc-600 ml-auto">
                            {resource.content.length} bytes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Validation + Actions */}
              <div className="space-y-4">
                {/* Score */}
                <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#2d2d44]">
                    <h3 className="font-semibold text-[#e4e4e7]">Compliance Score</h3>
                  </div>
                  <div className="p-4 text-center">
                    <div className={`text-4xl font-bold mb-1 ${
                      result.validation.score >= 80 ? 'text-emerald-400'
                        : result.validation.score >= 50 ? 'text-amber-400'
                          : 'text-red-400'
                    }`}>
                      {result.validation.score}
                    </div>
                    <p className="text-xs text-zinc-500">out of 100</p>
                  </div>
                </div>

                {/* Validation checklist */}
                <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#2d2d44]">
                    <h3 className="font-semibold text-[#e4e4e7]">Validation</h3>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {result.validation.checks.map((check, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        {check.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : check.autoFixed ? (
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {check.message}
                          </p>
                          {check.autoFixed && (
                            <span className="text-[10px] text-amber-500">auto-fixed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
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

                    <div className="border-t border-[#2d2d44] my-2" />

                    {user ? (
                      <>
                        <button
                          onClick={() => handlePublish('public')}
                          disabled={publishing}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {publishing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Publish to Marketplace
                        </button>
                        <button
                          onClick={() => handlePublish('private')}
                          disabled={publishing}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#252538] hover:bg-[#2d2d44] text-zinc-400 text-sm rounded-md transition-colors border border-[#2d2d44] cursor-pointer disabled:opacity-50"
                        >
                          Save as Private
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={login}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#252538] hover:bg-[#2d2d44] text-zinc-300 text-sm rounded-md transition-colors border border-[#2d2d44] cursor-pointer"
                      >
                        Sign in to Publish
                      </button>
                    )}

                    <div className="border-t border-[#2d2d44] my-2" />

                    <button
                      onClick={handleReset}
                      className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer py-1"
                    >
                      Convert another skill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
