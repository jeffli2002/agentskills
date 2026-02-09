import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth';
import { convertPaste, convertGithub, convertGithubPick, convertSkill, getSkills, publishConverted, } from '@/lib/api';
import { ClipboardPaste, Github, Search, Sparkles, Check, Copy, Download, Upload, ArrowRight, AlertCircle, CheckCircle2, XCircle, FileText, FolderTree, Loader2, } from 'lucide-react';
// ─── Syntax Highlighting (reused from OpenClawExportPage) ──────────────────
function renderHighlightedContent(content) {
    const lines = content.split('\n');
    let inFrontmatter = false;
    let frontmatterCount = 0;
    return lines.map((line, i) => {
        if (line.trim() === '---') {
            frontmatterCount++;
            if (frontmatterCount <= 2) {
                inFrontmatter = frontmatterCount === 1;
                return (_jsx("span", { className: "text-zinc-500", children: line + '\n' }, i));
            }
        }
        if (inFrontmatter) {
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
                const key = line.slice(0, colonIdx);
                const value = line.slice(colonIdx);
                return (_jsxs("span", { children: [_jsx("span", { className: "text-amber-400", children: key }), _jsx("span", { className: "text-zinc-300", children: value }), '\n'] }, i));
            }
            if (line.match(/^\s+-\s/)) {
                return (_jsx("span", { className: "text-emerald-400", children: line + '\n' }, i));
            }
        }
        if (line.startsWith('#')) {
            return (_jsx("span", { className: "text-amber-300 font-semibold", children: line + '\n' }, i));
        }
        return _jsx("span", { children: line + '\n' }, i);
    });
}
const TABS = [
    { id: 'paste', label: 'Paste / Upload', icon: ClipboardPaste },
    { id: 'github', label: 'GitHub Import', icon: Github },
    { id: 'marketplace', label: 'Marketplace', icon: Search },
    { id: 'ai', label: 'AI Generate', icon: Sparkles },
];
const PIPELINE_STEPS = [
    { id: 'convert', label: 'Convert', num: 1 },
    { id: 'validate', label: 'Validate', num: 2 },
    { id: 'preview', label: 'Preview', num: 3 },
];
// ─── Main Component ────────────────────────────────────────────────────────
export function ConvertPage() {
    const [, navigate] = useLocation();
    const { user, login } = useAuth();
    // Tab state
    const [activeTab, setActiveTab] = useState('paste');
    // Input state
    const [pasteContent, setPasteContent] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    // GitHub file picker
    const [githubFiles, setGithubFiles] = useState([]);
    const [showFilePicker, setShowFilePicker] = useState(false);
    // Pipeline state
    const [currentStep, setCurrentStep] = useState('input');
    const [converting, setConverting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
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
        if (!pasteContent.trim())
            return;
        setConverting(true);
        setError(null);
        setCurrentStep('convert');
        try {
            const data = await convertPaste(pasteContent);
            setResult(data);
            setCurrentStep('preview');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Conversion failed');
            setCurrentStep('input');
        }
        finally {
            setConverting(false);
        }
    };
    const handleConvertGithub = async () => {
        if (!githubUrl.trim())
            return;
        setConverting(true);
        setError(null);
        setCurrentStep('convert');
        setShowFilePicker(false);
        try {
            const data = await convertGithub(githubUrl);
            if ('needsPick' in data && data.needsPick) {
                setGithubFiles(data.files);
                setShowFilePicker(true);
                setCurrentStep('input');
            }
            else {
                setResult(data);
                setCurrentStep('preview');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'GitHub import failed');
            setCurrentStep('input');
        }
        finally {
            setConverting(false);
        }
    };
    const handleGithubPick = async (file) => {
        setConverting(true);
        setError(null);
        setCurrentStep('convert');
        setShowFilePicker(false);
        try {
            const data = await convertGithubPick(githubUrl, file);
            setResult(data);
            setCurrentStep('preview');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'GitHub import failed');
            setCurrentStep('input');
        }
        finally {
            setConverting(false);
        }
    };
    const handleConvertSkill = async (skillId) => {
        setConverting(true);
        setError(null);
        setCurrentStep('convert');
        try {
            const data = await convertSkill(skillId);
            setResult(data);
            setCurrentStep('preview');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Conversion failed');
            setCurrentStep('input');
        }
        finally {
            setConverting(false);
        }
    };
    // ─── Search Handler ──────────────────────────────────────────────────────
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim())
            return;
        setSearchLoading(true);
        try {
            const data = await getSkills({ q: searchQuery, limit: 8 });
            setSearchResults(data.data);
        }
        catch {
            setSearchResults([]);
        }
        finally {
            setSearchLoading(false);
        }
    }, [searchQuery]);
    // ─── Action Handlers ─────────────────────────────────────────────────────
    const handleCopy = async () => {
        if (!result)
            return;
        try {
            await navigator.clipboard.writeText(result.skillMd);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch { }
    };
    const handleDownload = () => {
        if (!result)
            return;
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
    const handlePublish = async (visibility) => {
        if (!result || !user)
            return;
        setPublishing(true);
        try {
            const { url } = await publishConverted(result.skillMd, result.resources, visibility);
            navigate(url);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Publish failed');
        }
        finally {
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
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            setPasteContent(reader.result);
        };
        reader.readAsText(file);
    };
    // ─── Render ──────────────────────────────────────────────────────────────
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4", children: _jsx("div", { className: "container mx-auto", children: _jsxs("code", { className: "font-mono text-sm text-[#e4e4e7]", children: [_jsx("span", { className: "text-emerald-400", children: "$" }), ' ', _jsx("span", { className: "text-zinc-400", children: "agentskills" }), ' ', _jsx("span", { className: "text-amber-400 font-semibold", children: "convert" }), result && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-zinc-500", children: " --source " }), _jsx("span", { className: "text-emerald-400", children: result.original.source })] }))] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "max-w-5xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-[#e4e4e7] mb-2", children: "Universal Skill Converter" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Convert any skill to OpenClaw-compliant format. Paste, import from GitHub, or convert from the marketplace." })] }), _jsx("div", { className: "mb-8", children: _jsx("div", { className: "flex items-center justify-center gap-2", children: PIPELINE_STEPS.map((step, i) => {
                                    const isActive = currentStep === step.id || currentStep === 'preview';
                                    const isComplete = (step.id === 'convert' && (currentStep === 'validate' || currentStep === 'preview'))
                                        || (step.id === 'validate' && currentStep === 'preview');
                                    const isCurrent = converting && step.id === 'convert';
                                    return (_jsxs("div", { className: "flex items-center gap-2", children: [i > 0 && (_jsx("div", { className: `w-12 h-px ${isComplete ? 'bg-emerald-500' : 'bg-[#2d2d44]'}` })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${isComplete
                                                            ? 'bg-emerald-500 text-white'
                                                            : isCurrent
                                                                ? 'bg-amber-500 text-black'
                                                                : isActive
                                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                                                    : 'bg-[#252538] text-zinc-500 border border-[#2d2d44]'}`, children: isComplete ? _jsx(Check, { className: "h-3.5 w-3.5" }) : step.num }), _jsx("span", { className: `text-sm font-medium ${isComplete ? 'text-emerald-400' : isActive ? 'text-amber-400' : 'text-zinc-500'}`, children: isCurrent ? 'Converting...' : step.label })] })] }, step.id));
                                }) }) }), error && (_jsxs("div", { className: "mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-red-400 shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-red-300", children: error }), _jsx("button", { onClick: handleReset, className: "text-xs text-red-400 hover:text-red-300 mt-1 underline cursor-pointer", children: "Try again" })] })] })), !result && !converting && (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "flex border-b border-[#2d2d44]", children: TABS.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (_jsxs("button", { onClick: () => { setActiveTab(tab.id); setError(null); }, className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${isActive
                                                ? 'text-amber-400 border-b-2 border-amber-400 bg-[#252538]'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#252538]/50'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: tab.label })] }, tab.id));
                                    }) }), _jsxs("div", { className: "p-6", children: [activeTab === 'paste' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-zinc-300 mb-2", children: "Paste your SKILL.md, README, or any markdown content" }), _jsx("textarea", { value: pasteContent, onChange: (e) => setPasteContent(e.target.value), placeholder: "---\nname: my-skill\ndescription: \"A helpful skill\"\n---\n\n# My Skill\n\nInstructions here...", className: "w-full h-64 bg-[#0d0d1a] border border-[#2d2d44] rounded-md p-4 text-sm font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 resize-none" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { onClick: handleConvertPaste, disabled: !pasteContent.trim(), className: "bg-amber-500 hover:bg-amber-600 text-black font-medium", children: [_jsx(ArrowRight, { className: "h-4 w-4 mr-2" }), "Convert"] }), _jsxs("label", { className: "flex items-center gap-2 px-4 py-2 bg-[#252538] hover:bg-[#2d2d44] text-zinc-300 text-sm rounded-md transition-colors border border-[#2d2d44] cursor-pointer", children: [_jsx(Upload, { className: "h-4 w-4" }), "Upload File", _jsx("input", { type: "file", accept: ".md,.txt,.yaml,.yml", onChange: handleFileUpload, className: "hidden" })] })] })] })), activeTab === 'github' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-zinc-300 mb-2", children: "Enter a public GitHub repository URL" }), _jsx("input", { type: "text", value: githubUrl, onChange: (e) => setGithubUrl(e.target.value), placeholder: "https://github.com/owner/repo or github.com/owner/repo/tree/main/skills/my-skill", className: "w-full bg-[#0d0d1a] border border-[#2d2d44] rounded-md px-4 py-3 text-sm font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40", onKeyDown: (e) => e.key === 'Enter' && handleConvertGithub() })] }), _jsxs("div", { className: "text-xs text-zinc-500 space-y-1", children: [_jsx("p", { children: "Looks for SKILL.md or README.md in the repo root. Supports subdirectory URLs for monorepos." }), _jsxs("p", { children: ["Also collects files in ", _jsx("code", { className: "text-zinc-400", children: "scripts/" }), ", ", _jsx("code", { className: "text-zinc-400", children: "references/" }), ", and ", _jsx("code", { className: "text-zinc-400", children: "assets/" }), " directories."] })] }), _jsxs(Button, { onClick: handleConvertGithub, disabled: !githubUrl.trim(), className: "bg-amber-500 hover:bg-amber-600 text-black font-medium", children: [_jsx(Github, { className: "h-4 w-4 mr-2" }), "Import & Convert"] }), showFilePicker && githubFiles.length > 0 && (_jsxs("div", { className: "mt-4 p-4 bg-[#252538] rounded-md border border-[#2d2d44]", children: [_jsx("p", { className: "text-sm text-zinc-300 mb-3", children: "Multiple markdown files found. Select which one to convert:" }), _jsx("div", { className: "space-y-2", children: githubFiles.map((file) => (_jsxs("button", { onClick: () => handleGithubPick(file), className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-mono text-zinc-300 bg-[#0d0d1a] hover:bg-[#1a1a2e] rounded border border-[#2d2d44] transition-colors cursor-pointer", children: [_jsx(FileText, { className: "h-4 w-4 text-amber-400 shrink-0" }), file] }, file))) })] }))] })), activeTab === 'marketplace' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-zinc-300 mb-2", children: "Search the marketplace for a skill to convert" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "e.g. commit analyzer, docker, testing...", className: "flex-1 bg-[#0d0d1a] border border-[#2d2d44] rounded-md px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40", onKeyDown: (e) => e.key === 'Enter' && handleSearch() }), _jsx(Button, { onClick: handleSearch, disabled: !searchQuery.trim() || searchLoading, className: "bg-[#252538] hover:bg-[#2d2d44] border border-[#2d2d44] text-zinc-300", children: searchLoading ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : (_jsx(Search, { className: "h-4 w-4" })) })] })] }), searchResults.length > 0 && (_jsx("div", { className: "space-y-2", children: searchResults.map((skill) => (_jsxs("button", { onClick: () => handleConvertSkill(skill.id), className: "flex items-center justify-between w-full px-4 py-3 bg-[#252538] hover:bg-[#2d2d44] rounded-md border border-[#2d2d44] transition-colors cursor-pointer text-left", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-zinc-200", children: skill.name }), _jsx("p", { className: "text-xs text-zinc-500 mt-0.5", children: skill.description.length > 80 ? skill.description.slice(0, 80) + '...' : skill.description })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0 ml-4", children: [_jsx(Badge, { variant: "secondary", className: "text-xs", children: skill.category }), _jsx(ArrowRight, { className: "h-4 w-4 text-zinc-500" })] })] }, skill.id))) }))] })), activeTab === 'ai' && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Sparkles, { className: "h-12 w-12 text-amber-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-zinc-200 mb-2", children: "AI Skill Composer" }), _jsx("p", { className: "text-sm text-zinc-400 mb-6 max-w-md mx-auto", children: "Describe what you want in plain English and our AI will generate a complete, OpenClaw-compliant skill for you." }), _jsx(Link, { href: "/create", children: _jsxs(Button, { className: "bg-amber-500 hover:bg-amber-600 text-black font-medium", children: [_jsx(Sparkles, { className: "h-4 w-4 mr-2" }), "Open Skill Composer"] }) })] }))] })] })), converting && (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-12 text-center", children: [_jsx(Loader2, { className: "h-10 w-10 text-amber-400 animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-zinc-300 font-medium", children: "Converting to OpenClaw format..." }), _jsx("p", { className: "text-xs text-zinc-500 mt-2", children: "Validating compliance and generating frontmatter" })] })), result && !converting && (_jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-[#2d2d44] bg-[#252538]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" })] }), _jsx("span", { className: "text-sm text-zinc-400 font-mono", children: "SKILL.md" }), _jsx(Badge, { variant: "secondary", className: "text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20", children: "OpenClaw" })] }), _jsx("button", { onClick: handleCopy, className: "p-1.5 rounded hover:bg-[#2d2d44] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer", "aria-label": "Copy", children: copied ? (_jsx(Check, { className: "h-4 w-4 text-emerald-400" })) : (_jsx(Copy, { className: "h-4 w-4" })) })] }), _jsx("div", { className: "p-4 overflow-x-auto max-h-[500px] overflow-y-auto", children: _jsx("pre", { className: "font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed", children: renderHighlightedContent(result.skillMd) }) })] }), result.resources.length > 0 && (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 border-b border-[#2d2d44] bg-[#252538]", children: [_jsx(FolderTree, { className: "h-4 w-4 text-amber-400" }), _jsxs("span", { className: "text-sm text-zinc-300 font-medium", children: ["Resource Files (", result.resources.length, ")"] })] }), _jsx("div", { className: "divide-y divide-[#2d2d44]", children: result.resources.map((resource, i) => (_jsxs("div", { className: "px-4 py-2.5 flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-zinc-500 shrink-0" }), _jsx("span", { className: "text-sm font-mono text-zinc-300", children: resource.path }), _jsxs("span", { className: "text-xs text-zinc-600 ml-auto", children: [resource.content.length, " bytes"] })] }, i))) })] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Compliance Score" }) }), _jsxs("div", { className: "p-4 text-center", children: [_jsx("div", { className: `text-4xl font-bold mb-1 ${result.validation.score >= 80 ? 'text-emerald-400'
                                                                : result.validation.score >= 50 ? 'text-amber-400'
                                                                    : 'text-red-400'}`, children: result.validation.score }), _jsx("p", { className: "text-xs text-zinc-500", children: "out of 100" })] })] }), _jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Validation" }) }), _jsx("div", { className: "p-4 space-y-2.5", children: result.validation.checks.map((check, i) => (_jsxs("div", { className: "flex items-start gap-2.5", children: [check.passed ? (_jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400 shrink-0 mt-0.5" })) : check.autoFixed ? (_jsx(CheckCircle2, { className: "h-4 w-4 text-amber-400 shrink-0 mt-0.5" })) : (_jsx(XCircle, { className: "h-4 w-4 text-zinc-500 shrink-0 mt-0.5" })), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-zinc-300 leading-relaxed", children: check.message }), check.autoFixed && (_jsx("span", { className: "text-[10px] text-amber-500", children: "auto-fixed" }))] })] }, i))) })] }), _jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Actions" }) }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsxs("button", { onClick: handleDownload, className: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-md transition-colors cursor-pointer", children: [_jsx(Download, { className: "h-4 w-4" }), "Download SKILL.md"] }), _jsxs("button", { onClick: handleCopy, className: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#252538] hover:bg-[#2d2d44] text-[#e4e4e7] font-medium rounded-md transition-colors border border-[#2d2d44] cursor-pointer", children: [copied ? (_jsx(Check, { className: "h-4 w-4 text-emerald-400" })) : (_jsx(Copy, { className: "h-4 w-4" })), copied ? 'Copied!' : 'Copy to Clipboard'] }), _jsx("div", { className: "border-t border-[#2d2d44] my-2" }), user ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => handlePublish('public'), disabled: publishing, className: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50", children: [publishing ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : (_jsx(Upload, { className: "h-4 w-4" })), "Publish to Marketplace"] }), _jsx("button", { onClick: () => handlePublish('private'), disabled: publishing, className: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#252538] hover:bg-[#2d2d44] text-zinc-400 text-sm rounded-md transition-colors border border-[#2d2d44] cursor-pointer disabled:opacity-50", children: "Save as Private" })] })) : (_jsx("button", { onClick: login, className: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#252538] hover:bg-[#2d2d44] text-zinc-300 text-sm rounded-md transition-colors border border-[#2d2d44] cursor-pointer", children: "Sign in to Publish" })), _jsx("div", { className: "border-t border-[#2d2d44] my-2" }), _jsx("button", { onClick: handleReset, className: "w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer py-1", children: "Convert another skill" })] })] })] })] }))] }) })] }));
}
