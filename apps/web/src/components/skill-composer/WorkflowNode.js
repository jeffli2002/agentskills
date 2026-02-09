import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { SourceBadge } from './SourceBadge';
export function WorkflowNode({ step, isLast, isNew = false }) {
    const [visibleLines, setVisibleLines] = useState(isNew ? 0 : 4 + step.sources.length);
    useEffect(() => {
        if (!isNew) {
            setVisibleLines(4 + step.sources.length);
            return;
        }
        // Animate lines appearing one by one
        const totalLines = 4 + step.sources.length; // header, title, description, sources header + each source
        let currentLine = 0;
        const interval = setInterval(() => {
            currentLine++;
            setVisibleLines(currentLine);
            if (currentLine >= totalLines) {
                clearInterval(interval);
            }
        }, 120); // 120ms between each line
        return () => clearInterval(interval);
    }, [isNew, step.sources.length]);
    return (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "rounded-xl border border-border bg-card p-5 overflow-hidden", children: [_jsxs("div", { className: `flex items-center gap-3 mb-4 transition-all duration-300 ${visibleLines >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`, children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-gold", children: step.stepNumber }) }), _jsx("h3", { className: "text-lg font-semibold text-foreground", children: step.title })] }), _jsx("p", { className: `text-sm text-muted-foreground mb-4 leading-relaxed transition-all duration-300 ${visibleLines >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`, children: step.description }), step.sources.length > 0 && (_jsxs("div", { className: `space-y-2 transition-all duration-300 ${visibleLines >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`, children: [_jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2", children: "Utilized Skills" }), _jsx("div", { className: "space-y-2", children: step.sources.map((source, idx) => (_jsx("div", { className: `transition-all duration-300 ${visibleLines >= 4 + idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`, children: _jsx(SourceBadge, { skillId: source.skillId, skillName: source.skillName, stars: source.stars, forks: source.forks, reason: source.reason }) }, idx))) })] }))] }), !isLast && (_jsxs("div", { className: "flex justify-center py-2", children: [_jsx("div", { className: "w-px h-8 bg-gradient-to-b from-gold/50 to-gold/20" }), _jsx("svg", { className: "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 text-gold/50", fill: "currentColor", viewBox: "0 0 12 12", children: _jsx("path", { d: "M6 9L1 4h10L6 9z" }) })] }))] }));
}
