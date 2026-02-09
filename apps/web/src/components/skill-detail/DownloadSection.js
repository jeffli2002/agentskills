import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Download, Terminal } from 'lucide-react';
import { getDownloadUrl } from '@/lib/api';
export function DownloadSection({ skillId, skillName }) {
    const downloadUrl = getDownloadUrl(skillId);
    return (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Download" }) }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsxs("a", { href: downloadUrl, download: true, className: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-md transition-colors", children: [_jsx(Download, { className: "h-4 w-4" }), "Download ZIP"] }), _jsxs("div", { className: "flex items-start gap-2 text-xs text-zinc-500", children: [_jsx(Terminal, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }), _jsxs("code", { className: "font-mono break-all", children: ["wget ", skillName, ".zip"] })] })] })] }));
}
