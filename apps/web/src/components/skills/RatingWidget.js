import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { rateSkill } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { ThumbsUp } from 'lucide-react';
export function RatingWidget({ skillId, avgRating, ratingCount, userRating, onRatingChange, readonly = false, size = 'md', }) {
    const { user, login } = useAuth();
    const [hoveredRating, setHoveredRating] = useState(null);
    const [currentUserRating, setCurrentUserRating] = useState(userRating);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const displayRating = hoveredRating ?? currentUserRating ?? avgRating;
    const handleClick = async (rating) => {
        if (readonly || isSubmitting)
            return;
        if (!user) {
            login();
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await rateSkill(skillId, rating);
            setCurrentUserRating(rating);
            onRatingChange?.(result.avgRating, result.ratingCount);
        }
        catch (error) {
            console.error('Failed to rate skill:', error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
    return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "flex items-center", onMouseLeave: () => !readonly && setHoveredRating(null), children: [1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= displayRating;
                    return (_jsx("button", { type: "button", disabled: readonly || isSubmitting, className: cn('p-0.5 transition-colors', readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110', isSubmitting && 'opacity-50'), onClick: () => handleClick(star), onMouseEnter: () => !readonly && setHoveredRating(star), "aria-label": `Rate ${star} out of 5`, children: _jsx(ThumbsUp, { className: cn(starSize, 'transition-colors', !isActive && 'text-muted-foreground'), style: isActive ? { color: '#D4A017', fill: '#D4A017' } : { fill: 'none' } }) }, star));
                }) }), _jsxs("span", { className: cn('text-muted-foreground', textSize), children: ["(", ratingCount, ")"] })] }));
}
