import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '@/components/ui/card';
import { SkillCard } from './SkillCard';
function SkillCardSkeleton() {
    return (_jsxs(Card, { className: "flex flex-col h-full animate-pulse", children: [_jsx("div", { className: "p-6 pb-3", children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-6 bg-muted rounded w-3/4" }), _jsx("div", { className: "h-4 bg-muted rounded w-1/2 mt-2" })] }), _jsx("div", { className: "h-8 w-8 bg-muted rounded" })] }) }), _jsxs("div", { className: "p-6 pt-0 flex-1 flex flex-col gap-3", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsx("div", { className: "h-4 bg-muted rounded w-full" }), _jsx("div", { className: "h-4 bg-muted rounded w-4/5" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-5 bg-muted rounded-full w-16" }), _jsx("div", { className: "h-4 bg-muted rounded w-12" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [[1, 2, 3, 4, 5].map((i) => (_jsx("div", { className: "h-4 w-4 bg-muted rounded" }, i))), _jsx("div", { className: "h-4 bg-muted rounded w-8 ml-1" })] })] })] }));
}
function EmptyState({ message }) {
    return (_jsxs("div", { className: "col-span-full flex flex-col items-center justify-center py-12 text-center", children: [_jsx("svg", { className: "h-16 w-16 text-muted-foreground mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("p", { className: "text-lg text-muted-foreground", children: message })] }));
}
export function SkillList({ skills, loading = false, emptyMessage = 'No skills found', onFavoriteChange, onRatingChange, }) {
    if (loading) {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3, 4, 5, 6].map((i) => (_jsx(SkillCardSkeleton, {}, i))) }));
    }
    if (skills.length === 0) {
        return (_jsx("div", { className: "grid grid-cols-1", children: _jsx(EmptyState, { message: emptyMessage }) }));
    }
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: skills.map((skill) => (_jsx(SkillCard, { skill: skill, onFavoriteChange: onFavoriteChange, onRatingChange: onRatingChange }, skill.id))) }));
}
