import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'wouter';
import { Header } from './Header';
export function Layout({ children }) {
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1", children: children }), _jsx("footer", { className: "border-t border-border/50 py-8 mt-12 bg-secondary/30", children: _jsxs("div", { className: "container mx-auto px-4 text-center text-sm text-muted-foreground", children: [_jsxs("div", { className: "flex items-center justify-center gap-4 mb-2", children: [_jsx(Link, { href: "/privacy", className: "hover:text-foreground", children: "Privacy Policy" }), _jsx("span", { children: "|" }), _jsx(Link, { href: "/terms", className: "hover:text-foreground", children: "Terms of Use" })] }), _jsx("div", { className: "mb-2", children: "Agent Skills Marketplace" }), _jsx("div", { className: "text-xs text-muted-foreground/70", children: "Not affiliated with or sponsored by Anthropic, PBC." })] }) })] }));
}
