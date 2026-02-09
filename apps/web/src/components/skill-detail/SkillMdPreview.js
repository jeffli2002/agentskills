import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Markdown from 'react-markdown';
// Fields already displayed elsewhere on the page
const REDUNDANT_FIELDS = ['name', 'description'];
// Parse YAML frontmatter from markdown content
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
    const match = content.match(frontmatterRegex);
    if (!match) {
        return { frontmatter: {}, body: content };
    }
    const frontmatterStr = match[1];
    const body = content.slice(match[0].length);
    const frontmatter = {};
    // Parse simple YAML key-value pairs
    frontmatterStr.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            frontmatter[key] = value;
        }
    });
    return { frontmatter, body };
}
export function SkillMdPreview({ metadata, content }) {
    // Parse metadata if it's a string
    let parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    // Parse frontmatter from content and get the body
    let markdownContent = content?.trim() || '';
    if (markdownContent) {
        const { frontmatter, body } = parseFrontmatter(markdownContent);
        markdownContent = body.trim();
        // Merge frontmatter into metadata if metadata is empty
        if (!parsedMetadata || Object.keys(parsedMetadata).length === 0) {
            parsedMetadata = frontmatter;
        }
    }
    // Filter out entries with empty values and redundant fields
    const filteredMetadata = parsedMetadata
        ? Object.entries(parsedMetadata).filter(([key, value]) => {
            // Skip redundant fields
            if (REDUNDANT_FIELDS.includes(key.toLowerCase()))
                return false;
            // Skip empty values
            const strValue = String(value).trim();
            return strValue !== '' && strValue !== 'null' && strValue !== 'undefined';
        })
        : [];
    // Hide the entire card if there's no unique content to show
    if (filteredMetadata.length === 0 && !markdownContent) {
        return null;
    }
    return (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-[#2d2d44] bg-[#252538]", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" })] }), _jsx("span", { className: "text-sm text-zinc-400 font-mono", children: "SKILL.md" })] }), parsedMetadata && (_jsxs("div", { className: "px-4 pt-4 space-y-2", children: [parsedMetadata['name'] && (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-zinc-500 font-mono text-sm shrink-0", children: "name:" }), _jsx("span", { className: "text-amber-400 font-mono text-sm font-medium", children: parsedMetadata['name'] })] })), parsedMetadata['description'] && (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-zinc-500 font-mono text-sm shrink-0", children: "description:" }), _jsx("span", { className: "text-zinc-300 font-mono text-sm leading-relaxed", children: parsedMetadata['description'] })] })), _jsx("div", { className: "border-b border-[#2d2d44] pt-2" })] })), filteredMetadata.length > 0 && (_jsx("div", { className: "p-4", children: _jsx("table", { className: "w-full text-sm", children: _jsx("tbody", { children: filteredMetadata.map(([key, value]) => (_jsxs("tr", { className: "border-b border-[#2d2d44] last:border-0", children: [_jsxs("td", { className: "py-2 pr-4 text-zinc-500 font-mono whitespace-nowrap align-top", children: [key, ":"] }), _jsx("td", { className: "py-2 text-[#e4e4e7] font-mono break-words", children: String(value) })] }, key))) }) }) })), markdownContent && (_jsx("div", { className: "px-4 pb-4", children: _jsx("div", { className: "markdown-content text-zinc-300 text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-zinc-100 [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:text-zinc-300 [&_a]:text-amber-400 [&_a]:underline [&_code]:text-emerald-400 [&_code]:bg-[#0d0d1a] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-[#0d0d1a] [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:border [&_pre]:border-[#2d2d44] [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_li]:text-zinc-300 [&_strong]:text-zinc-100 [&_strong]:font-semibold [&_em]:italic [&_blockquote]:border-l-2 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_hr]:border-[#2d2d44] [&_hr]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#2d2d44] [&_th]:px-3 [&_th]:py-2 [&_th]:bg-[#252538] [&_th]:text-left [&_td]:border [&_td]:border-[#2d2d44] [&_td]:px-3 [&_td]:py-2", children: _jsx(Markdown, { children: markdownContent }) }) }))] }));
}
