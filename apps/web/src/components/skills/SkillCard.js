import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingWidget } from './RatingWidget';
import { FavoriteButton } from './FavoriteButton';
function isSkillWithUserData(skill) {
    return 'isFavorited' in skill || 'userRating' in skill;
}
export function SkillCard({ skill, onFavoriteChange, onRatingChange }) {
    const userRating = isSkillWithUserData(skill) ? skill.userRating : undefined;
    const isFavorited = isSkillWithUserData(skill) ? skill.isFavorited : undefined;
    return (_jsxs(Card, { className: "flex flex-col h-full transition-shadow hover:shadow-md", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx(Link, { href: `/skills/${skill.id}`, children: _jsx(CardTitle, { className: "text-lg hover:text-primary cursor-pointer truncate", children: skill.name }) }), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["by ", skill.author] })] }), _jsx(FavoriteButton, { skillId: skill.id, isFavorited: isFavorited, onFavoriteChange: (favorited) => onFavoriteChange?.(skill.id, favorited), size: "sm" })] }) }), _jsxs(CardContent, { className: "flex-1 flex flex-col gap-3", children: [_jsx(CardDescription, { className: "line-clamp-2 flex-1", children: skill.description }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx(Badge, { variant: "secondary", children: skill.category }), _jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [_jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }) }), _jsx("span", { children: skill.starsCount.toLocaleString() })] })] }), _jsx(RatingWidget, { skillId: skill.id, avgRating: skill.avgRating, ratingCount: skill.ratingCount, userRating: userRating, onRatingChange: (avgRating, ratingCount) => onRatingChange?.(skill.id, avgRating, ratingCount), size: "sm" })] })] }));
}
