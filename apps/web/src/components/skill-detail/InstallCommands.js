import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
function getCommand(pm, author, skillName) {
    const skillPath = `${author}/${skillName}`;
    switch (pm) {
        case 'npx':
            return `npx skills add ${skillPath}`;
        case 'bunx':
            return `bunx skills add ${skillPath}`;
        case 'pnpm':
            return `pnpm dlx skills add ${skillPath}`;
    }
}
export function InstallCommands({ author, skillName }) {
    const [activeTab, setActiveTab] = useState('npx');
    const [copied, setCopied] = useState(false);
    const command = getCommand(activeTab, author, skillName);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            // Clipboard access denied
        }
    };
    return (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Install" }) }), _jsx("div", { className: "p-4", children: _jsxs(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), children: [_jsxs(TabsList, { className: "bg-[#252538] w-full", children: [_jsx(TabsTrigger, { value: "npx", className: "flex-1 text-xs", children: "npx" }), _jsx(TabsTrigger, { value: "bunx", className: "flex-1 text-xs", children: "bunx" }), _jsx(TabsTrigger, { value: "pnpm", className: "flex-1 text-xs", children: "pnpm" })] }), ['npx', 'bunx', 'pnpm'].map((pm) => (_jsx(TabsContent, { value: pm, children: _jsxs("div", { className: "mt-3 relative group", children: [_jsxs("div", { className: "bg-[#0d0d1a] rounded-md p-3 pr-10 font-mono text-sm text-emerald-400 overflow-x-auto", children: [_jsx("span", { className: "text-zinc-500", children: "$ " }), getCommand(pm, author, skillName)] }), _jsx("button", { onClick: handleCopy, className: "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-[#2d2d44] text-zinc-400 hover:text-zinc-200 transition-colors", "aria-label": "Copy command", children: copied ? (_jsx(Check, { className: "h-4 w-4 text-emerald-400" })) : (_jsx(Copy, { className: "h-4 w-4" })) })] }) }, pm)))] }) })] }));
}
