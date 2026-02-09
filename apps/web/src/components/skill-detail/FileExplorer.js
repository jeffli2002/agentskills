import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
function formatFileSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function FileNode({ file, depth, children }) {
    const [isExpanded, setIsExpanded] = useState(depth < 2);
    const isFolder = file.type === 'folder';
    return (_jsxs("div", { children: [_jsxs("div", { className: `flex items-center gap-2 py-1.5 px-2 hover:bg-[#2d2d44]/50 rounded cursor-pointer group ${isFolder ? 'font-medium' : ''}`, style: { paddingLeft: `${depth * 16 + 8}px` }, onClick: () => isFolder && setIsExpanded(!isExpanded), children: [isFolder ? (_jsxs(_Fragment, { children: [isExpanded ? (_jsx(ChevronDown, { className: "h-4 w-4 text-zinc-500 shrink-0" })) : (_jsx(ChevronRight, { className: "h-4 w-4 text-zinc-500 shrink-0" })), _jsx(Folder, { className: "h-4 w-4 text-amber-400 shrink-0" })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-4" }), _jsx(File, { className: "h-4 w-4 text-zinc-400 shrink-0" })] })), _jsx("span", { className: "text-sm text-[#e4e4e7] truncate flex-1", children: file.name }), !isFolder && (_jsx("span", { className: "text-xs text-zinc-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: formatFileSize(file.size) }))] }), isFolder && isExpanded && children && children.length > 0 && (_jsx("div", { children: children.map((child, idx) => (_jsx(FileNode, { file: child, depth: depth + 1 }, `${child.path}-${idx}`))) }))] }));
}
function buildFileTree(files) {
    // Simple flat rendering for now - files should come pre-structured
    // Sort folders first, then files alphabetically
    return [...files].sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder')
            return -1;
        if (a.type !== 'folder' && b.type === 'folder')
            return 1;
        return a.name.localeCompare(b.name);
    });
}
export function FileExplorer({ files, skillName }) {
    // Hide the component if there are no files
    if (!files || files.length === 0) {
        return null;
    }
    const sortedFiles = buildFileTree(files);
    const totalFiles = files.filter(f => f.type === 'file').length;
    const totalSize = files.reduce((sum, f) => sum + (f.type === 'file' ? f.size : 0), 0);
    return (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-[#2d2d44] bg-[#252538]", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" })] }), _jsx("span", { className: "text-sm text-zinc-400 font-mono flex-1 text-center", children: skillName }), _jsxs("span", { className: "text-xs text-zinc-500", children: [totalFiles, " files \u00B7 ", formatFileSize(totalSize)] })] }), _jsx("div", { className: "py-2 max-h-80 overflow-y-auto", children: sortedFiles.map((file, idx) => (_jsx(FileNode, { file: file, depth: 0 }, `${file.path}-${idx}`))) })] }));
}
