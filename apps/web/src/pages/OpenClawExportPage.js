import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { getSkill, getOpenClawExport } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Download, ArrowLeft, Server, HardDrive } from 'lucide-react';
function OpenClawLogo({ className }) {
    return (_jsx("svg", { className: className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: _jsxs("g", { children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "M8 9.5C8 9.5 9.5 8 12 8s4 1.5 4 1.5" }), _jsx("circle", { cx: "9", cy: "12", r: "1", fill: "currentColor" }), _jsx("circle", { cx: "15", cy: "12", r: "1", fill: "currentColor" }), _jsx("path", { d: "M9 15.5s1.5 1.5 3 1.5 3-1.5 3-1.5" })] }) }));
}
// Syntax highlighting for SKILL.md content
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
            // List items in frontmatter
            if (line.match(/^\s+-\s/)) {
                return (_jsx("span", { className: "text-emerald-400", children: line + '\n' }, i));
            }
        }
        // Markdown heading
        if (line.startsWith('#')) {
            return (_jsx("span", { className: "text-amber-300 font-semibold", children: line + '\n' }, i));
        }
        // Regular content
        return _jsx("span", { children: line + '\n' }, i);
    });
}
export function OpenClawExportPage() {
    const { id } = useParams();
    const [skill, setSkill] = useState(null);
    const [exportContent, setExportContent] = useState(null);
    const [exportName, setExportName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        async function fetchData() {
            if (!id)
                return;
            setLoading(true);
            setError(null);
            try {
                const [skillData, exportData] = await Promise.all([
                    getSkill(id),
                    getOpenClawExport(id),
                ]);
                if (!skillData) {
                    setError('Skill not found');
                }
                else {
                    setSkill(skillData);
                    setExportContent(exportData.content);
                    setExportName(exportData.name);
                }
            }
            catch (err) {
                console.error('Failed to fetch:', err);
                setError('Failed to load skill export');
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);
    const handleCopy = async () => {
        if (!exportContent)
            return;
        try {
            await navigator.clipboard.writeText(exportContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            // Clipboard access denied
        }
    };
    const handleDownload = () => {
        if (!exportContent)
            return;
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
        return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4", children: _jsx("div", { className: "container mx-auto", children: _jsx("div", { className: "h-5 bg-[#2d2d44] rounded w-64 animate-pulse" }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsx("div", { className: "h-10 bg-muted rounded w-2/3 animate-pulse" }), _jsx("div", { className: "h-6 bg-muted rounded w-1/3 animate-pulse" }), _jsx("div", { className: "h-96 bg-muted rounded animate-pulse" })] }) })] }));
    }
    // Error state
    if (error || !skill || !exportContent) {
        return (_jsx("div", { className: "min-h-screen bg-background", children: _jsx("div", { className: "container mx-auto px-4 py-16", children: _jsxs("div", { className: "text-center py-12", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: error || 'Export not available' }), _jsx("p", { className: "text-muted-foreground mb-8", children: "The skill could not be exported to OpenClaw format." }), _jsx(Link, { href: `/skills/${id}`, children: _jsx(Button, { children: "Back to Skill" }) })] }) }) }));
    }
    // Parse frontmatter fields for the info card
    const frontmatterLines = exportContent.split('\n');
    const frontmatterFields = [];
    let inFrontmatter = false;
    for (const line of frontmatterLines) {
        if (line.trim() === '---') {
            if (inFrontmatter)
                break;
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
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4", children: _jsx("div", { className: "container mx-auto", children: _jsxs("code", { className: "font-mono text-sm text-[#e4e4e7]", children: [_jsx("span", { className: "text-emerald-400", children: "$" }), ' ', _jsx("span", { className: "text-zinc-400", children: "openclaw export" }), ' ', _jsx("span", { className: "text-amber-500", children: "~" }), _jsx("span", { className: "text-zinc-500", children: " / " }), _jsx("span", { className: "text-amber-400", children: skill.author }), _jsx("span", { className: "text-zinc-500", children: " / " }), _jsx("span", { className: "text-amber-300 font-semibold", children: skill.name })] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("div", { className: "mb-6", children: _jsx(Link, { href: `/skills/${id}`, children: _jsxs("span", { className: "inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to ", skill.name] }) }) }), _jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(OpenClawLogo, { className: "h-8 w-8 text-amber-400" }), _jsx("h1", { className: "text-2xl font-bold text-[#e4e4e7]", children: "OpenClaw Export" })] }), _jsxs("p", { className: "text-zinc-400 text-sm", children: ["Convert", ' ', _jsx("span", { className: "text-amber-400 font-medium", children: skill.name }), ' ', "to OpenClaw-compliant SKILL.md format for publishing to ClawHub."] })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-[#2d2d44] bg-[#252538]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" })] }), _jsx("span", { className: "text-sm text-zinc-400 font-mono", children: "SKILL.md" }), _jsx(Badge, { variant: "secondary", className: "text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20", children: "OpenClaw" })] }), _jsx("button", { onClick: handleCopy, className: "p-1.5 rounded hover:bg-[#2d2d44] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer", "aria-label": "Copy SKILL.md content", children: copied ? (_jsx(Check, { className: "h-4 w-4 text-emerald-400" })) : (_jsx(Copy, { className: "h-4 w-4" })) })] }), _jsx("div", { className: "p-4 overflow-x-auto", children: _jsx("pre", { className: "font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed", children: renderHighlightedContent(exportContent) }) })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Actions" }) }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsxs("button", { onClick: handleDownload, className: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-md transition-colors cursor-pointer", children: [_jsx(Download, { className: "h-4 w-4" }), "Download SKILL.md"] }), _jsxs("button", { onClick: handleCopy, className: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#252538] hover:bg-[#2d2d44] text-[#e4e4e7] font-medium rounded-md transition-colors border border-[#2d2d44] cursor-pointer", children: [copied ? (_jsx(Check, { className: "h-4 w-4 text-emerald-400" })) : (_jsx(Copy, { className: "h-4 w-4" })), copied ? 'Copied!' : 'Copy to Clipboard'] })] })] }), _jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Compliance" }) }), _jsx("div", { className: "p-4 space-y-2", children: frontmatterFields.map(({ key, value }) => (_jsxs("div", { className: "flex items-start gap-2 text-sm", children: [_jsx("span", { className: "text-zinc-500 font-mono shrink-0", children: key + ':' }), _jsx("span", { className: "text-zinc-300 font-mono break-all", children: value.length > 60
                                                                    ? value.substring(0, 60) + '...'
                                                                    : value })] }, key))) })] }), _jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "About OpenClaw" }) }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsx("p", { className: "text-sm text-zinc-400 leading-relaxed", children: "OpenClaw is an open standard for AI agent skills. This export generates a compliant SKILL.md with validated name, description, and frontmatter fields." }), _jsxs("div", { className: "space-y-1.5 text-xs text-zinc-500", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }), "Name: lowercase alphanumeric + hyphens (1-64 chars)"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }), "Description: single-line, max 1024 chars"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }), "YAML frontmatter with required fields"] })] })] })] }), _jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Enable This Skill" }) }), _jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [_jsx(Server, { className: "h-3.5 w-3.5 text-purple-400" }), _jsx("p", { className: "text-xs text-zinc-300 font-medium", children: "On OpenClaw VPS" })] }), _jsxs("div", { className: "bg-[#0d0d1a] rounded-md p-2.5 font-mono text-xs text-emerald-400 overflow-x-auto border border-[#2d2d44] leading-relaxed", children: [_jsx("span", { className: "text-zinc-500", children: "$ " }), "npx agentskills install ", exportName, " --global"] }), _jsxs("p", { className: "text-[10px] text-zinc-600 mt-1.5", children: ["Or with curl: ", _jsxs("code", { className: "text-zinc-500", children: ["curl -o ~/.openclaw/skills/", exportName, "/SKILL.md \"https://agentskills.cv/api/skills/", id, "/export/openclaw\""] })] })] }), _jsx("div", { className: "border-t border-[#2d2d44]" }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [_jsx(HardDrive, { className: "h-3.5 w-3.5 text-amber-400" }), _jsx("p", { className: "text-xs text-zinc-300 font-medium", children: "From downloaded file" })] }), _jsxs("div", { className: "bg-[#0d0d1a] rounded-md p-2.5 font-mono text-xs text-emerald-400 overflow-x-auto border border-[#2d2d44] leading-relaxed", children: [_jsx("span", { className: "text-zinc-500", children: "$ " }), "cp SKILL.md ~/.openclaw/skills/", exportName, "/"] }), _jsxs("p", { className: "text-[10px] text-zinc-600 mt-1.5", children: ["Also works with ", _jsx("code", { className: "text-zinc-500", children: "~/.claude/skills/" }), " and ", _jsx("code", { className: "text-zinc-500", children: "~/.cursor/skills/" })] })] })] })] })] })] })] }) })] }));
}
