import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Star, GitFork, Clock } from 'lucide-react';
function formatRelativeTime(timestamp) {
    if (!timestamp)
        return 'Unknown';
    // Handle both string dates (ISO format) and numeric timestamps
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    if (isNaN(date.getTime()))
        return 'Unknown';
    const now = Date.now();
    const diff = now - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0)
        return 'Today';
    if (days === 1)
        return 'Yesterday';
    if (days < 7)
        return `${days} days ago`;
    if (days < 30)
        return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365)
        return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
}
export function GitStatsBar({ stars, forks, updatedAt }) {
    return (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-4", children: [_jsx("div", { className: "flex items-center gap-2 mb-3", children: _jsxs("code", { className: "font-mono text-xs text-zinc-500", children: [_jsx("span", { className: "text-emerald-400", children: "$" }), " git log --oneline --stat"] }) }), _jsxs("div", { className: "flex flex-wrap items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Star, { className: "h-4 w-4 text-amber-400" }), _jsxs("span", { className: "font-mono text-sm", children: [_jsx("span", { className: "text-amber-400 font-semibold", children: stars.toLocaleString() }), _jsx("span", { className: "text-zinc-400 ml-1", children: "stars" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(GitFork, { className: "h-4 w-4 text-blue-400" }), _jsxs("span", { className: "font-mono text-sm", children: [_jsx("span", { className: "text-blue-400 font-semibold", children: forks.toLocaleString() }), _jsx("span", { className: "text-zinc-400 ml-1", children: "forks" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-emerald-400" }), _jsxs("span", { className: "font-mono text-sm", children: [_jsx("span", { className: "text-zinc-400", children: "updated " }), _jsx("span", { className: "text-emerald-400", children: formatRelativeTime(updatedAt) })] })] })] })] }));
}
