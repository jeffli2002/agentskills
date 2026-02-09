import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { getSkill, parseSkillFiles, parseSkillMetadata } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingWidget } from '@/components/skills/RatingWidget';
import { TerminalBreadcrumb, GitStatsBar, FileExplorer, PackageCard, InstallCommands, DownloadSection, RelatedSkills, SkillMdPreview, } from '@/components/skill-detail';
export function SkillDetailPage() {
    const { id } = useParams();
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchSkill() {
            if (!id)
                return;
            setLoading(true);
            setError(null);
            try {
                const data = await getSkill(id);
                if (!data) {
                    setError('Skill not found');
                }
                else {
                    setSkill(data);
                }
            }
            catch (err) {
                console.error('Failed to fetch skill:', err);
                setError('Failed to load skill');
            }
            finally {
                setLoading(false);
            }
        }
        fetchSkill();
    }, [id]);
    const handleRatingChange = (avgRating, ratingCount) => {
        if (skill) {
            setSkill({ ...skill, avgRating, ratingCount });
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4", children: _jsx("div", { className: "container mx-auto", children: _jsx("div", { className: "h-5 bg-[#2d2d44] rounded w-48 animate-pulse" }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-2 space-y-6", children: _jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-10 bg-muted rounded w-2/3" }), _jsx("div", { className: "h-6 bg-muted rounded w-1/3" }), _jsx("div", { className: "h-24 bg-muted rounded" }), _jsx("div", { className: "h-48 bg-muted rounded" })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "h-40 bg-muted rounded animate-pulse" }), _jsx("div", { className: "h-32 bg-muted rounded animate-pulse" }), _jsx("div", { className: "h-24 bg-muted rounded animate-pulse" })] })] }) })] }));
    }
    if (error || !skill) {
        return (_jsx("div", { className: "min-h-screen bg-background", children: _jsx("div", { className: "container mx-auto px-4 py-16", children: _jsxs("div", { className: "text-center py-12", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: error || 'Skill not found' }), _jsx("p", { className: "text-muted-foreground mb-8", children: "The skill you're looking for doesn't exist or has been removed." }), _jsx(Link, { href: "/skills", children: _jsx(Button, { children: "Browse Skills" }) })] }) }) }));
    }
    // Parse files and metadata from JSON strings
    const files = parseSkillFiles(skill.filesJson);
    const parsedMetadata = parseSkillMetadata(skill.skillMdParsed);
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(TerminalBreadcrumb, { author: skill.author, skillName: skill.name }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { children: [_jsx("div", { className: "flex items-start justify-between gap-4 mb-4", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: skill.name }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "secondary", className: "text-sm", children: skill.category }), _jsx(RatingWidget, { skillId: skill.id, avgRating: skill.avgRating, ratingCount: skill.ratingCount, onRatingChange: handleRatingChange, size: "md" })] })] }) }), _jsx("div", { className: "bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-4", children: _jsxs("p", { className: "font-mono text-sm text-zinc-400", children: [_jsx("span", { className: "text-zinc-600", children: '// ' }), skill.description] }) })] }), _jsx(GitStatsBar, { stars: skill.starsCount, forks: skill.forksCount, updatedAt: skill.lastCommitAt || skill.updatedAt }), _jsx(FileExplorer, { files: files, skillName: skill.name }), _jsx(SkillMdPreview, { metadata: parsedMetadata, content: skill.skillMdContent })] }), _jsxs("div", { className: "space-y-6", children: [_jsx(PackageCard, { skill: skill }), _jsx(InstallCommands, { author: skill.author, skillName: skill.name }), _jsx(DownloadSection, { skillId: skill.id, skillName: skill.name, isOpenClaw: !skill.githubUrl.startsWith('https://github.com') }), _jsx(RelatedSkills, { skillId: skill.id, category: skill.category })] })] }) })] }));
}
