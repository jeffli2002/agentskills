import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Redirect, Link } from 'wouter';
import { getFavorites } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';
export function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchFavorites() {
            if (!user)
                return;
            setLoading(true);
            try {
                const data = await getFavorites();
                setSkills(data);
            }
            catch (error) {
                console.error('Failed to fetch favorites:', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchFavorites();
    }, [user]);
    // Show loading while checking auth
    if (authLoading) {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-muted rounded w-1/4 mb-8" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-64 bg-muted rounded" }, i))) })] }) }));
    }
    // Redirect to login if not authenticated
    if (!user) {
        return _jsx(Redirect, { to: "/login" });
    }
    const handleFavoriteChange = (skillId, isFavorited) => {
        if (!isFavorited) {
            // Remove from list when unfavorited
            setSkills((prev) => prev.filter((s) => s.id !== skillId));
        }
    };
    const handleRatingChange = (skillId, avgRating, ratingCount) => {
        setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...s, avgRating, ratingCount } : s)));
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8", children: "Your Favorites" }), !loading && skills.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "h-16 w-16 text-muted-foreground mx-auto mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }) }), _jsx("h2", { className: "text-xl font-semibold mb-2", children: "No favorites yet" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Start exploring skills and add them to your favorites!" }), _jsx(Link, { href: "/skills", children: _jsx(Button, { children: "Browse Skills" }) })] })) : (_jsx(SkillList, { skills: skills, loading: loading, emptyMessage: "No favorites yet", onFavoriteChange: handleFavoriteChange, onRatingChange: handleRatingChange }))] }));
}
