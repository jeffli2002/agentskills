import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Redirect, Link } from 'wouter';
import { getMySkills } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';
import { Sparkles } from 'lucide-react';
export function MySkillsPage() {
    const { user, loading: authLoading } = useAuth();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchMySkills() {
            if (!user)
                return;
            setLoading(true);
            try {
                const data = await getMySkills();
                setSkills(data);
            }
            catch (error) {
                console.error('Failed to fetch my skills:', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchMySkills();
    }, [user]);
    // Show loading while checking auth
    if (authLoading) {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-muted rounded w-1/4 mb-8" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-64 bg-muted rounded" }, i))) })] }) }));
    }
    // Redirect to login if not authenticated
    if (!user) {
        return _jsx(Redirect, { to: "/login" });
    }
    const handleRatingChange = (skillId, avgRating, ratingCount) => {
        setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...s, avgRating, ratingCount } : s)));
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsx("h1", { className: "text-3xl font-bold", children: "My Skills" }), _jsx(Link, { href: "/create", children: _jsxs(Button, { className: "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90", children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), "Create New Skill"] }) })] }), !loading && skills.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4", children: _jsx(Sparkles, { className: "w-8 h-8 text-gold/50" }) }), _jsx("h2", { className: "text-xl font-semibold mb-2", children: "No skills created yet" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Use the Skill Composer to create your first skill!" }), _jsx(Link, { href: "/create", children: _jsxs(Button, { className: "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90", children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), "Create Your First Skill"] }) })] })) : (_jsx(SkillList, { skills: skills, loading: loading, emptyMessage: "No skills created yet", onRatingChange: handleRatingChange }))] }));
}
