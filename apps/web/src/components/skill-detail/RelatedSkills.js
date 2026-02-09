import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getRelatedSkills } from '@/lib/api';
function getInitials(name) {
    return name
        .split(/[\s-_]/)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
export function RelatedSkills({ skillId, category }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchRelated() {
            try {
                const data = await getRelatedSkills(skillId, category);
                setSkills(data);
            }
            catch (err) {
                console.error('Failed to fetch related skills:', err);
            }
            finally {
                setLoading(false);
            }
        }
        fetchRelated();
    }, [skillId, category]);
    if (loading) {
        return (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-4", children: [_jsx("h3", { className: "font-semibold text-[#e4e4e7] mb-4", children: "Related Skills" }), _jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "animate-pulse flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-[#2d2d44]" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 bg-[#2d2d44] rounded w-3/4 mb-1" }), _jsx("div", { className: "h-3 bg-[#2d2d44] rounded w-1/2" })] })] }, i))) })] }));
    }
    if (skills.length === 0) {
        return null;
    }
    return (_jsxs("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-[#2d2d44]", children: _jsx("h3", { className: "font-semibold text-[#e4e4e7]", children: "Related Skills" }) }), _jsx("div", { className: "p-2", children: skills.map((skill) => (_jsx(Link, { href: `/skills/${skill.id}`, children: _jsxs("a", { className: "flex items-center gap-3 p-2 rounded-md hover:bg-[#2d2d44]/50 transition-colors group", children: [_jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: skill.authorAvatarUrl || undefined, alt: skill.author }), _jsx(AvatarFallback, { className: "bg-amber-500/20 text-amber-400 text-xs", children: getInitials(skill.author) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("code", { className: "block text-sm text-zinc-300 group-hover:text-amber-400 transition-colors font-mono truncate", children: [_jsx("span", { className: "text-zinc-500", children: "import " }), _jsxs("span", { className: "text-emerald-400", children: ["\"", skill.name, "\""] })] }), _jsx("span", { className: "text-xs text-zinc-500", children: skill.author })] }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-zinc-400 shrink-0", children: [_jsx(Star, { className: "h-3 w-3" }), _jsx("span", { children: skill.starsCount.toLocaleString() })] })] }) }, skill.id))) })] }));
}
