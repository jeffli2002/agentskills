import { useState } from 'react';
import { cn } from '@/lib/utils';
import { rateSkill } from '@/lib/api';
import { useAuth } from '@/context/auth';

interface RatingWidgetProps {
  skillId: string;
  avgRating: number;
  ratingCount: number;
  userRating?: number;
  onRatingChange?: (avgRating: number, ratingCount: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

export function RatingWidget({
  skillId,
  avgRating,
  ratingCount,
  userRating,
  onRatingChange,
  readonly = false,
  size = 'md',
}: RatingWidgetProps) {
  const { user, login } = useAuth();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [currentUserRating, setCurrentUserRating] = useState(userRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayRating = hoveredRating ?? currentUserRating ?? avgRating;

  const handleClick = async (rating: number) => {
    if (readonly || isSubmitting) return;

    if (!user) {
      login();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await rateSkill(skillId, rating);
      setCurrentUserRating(rating);
      onRatingChange?.(result.avgRating, result.ratingCount);
    } catch (error) {
      console.error('Failed to rate skill:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center"
        onMouseLeave={() => !readonly && setHoveredRating(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly || isSubmitting}
            className={cn(
              'p-0.5 transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              isSubmitting && 'opacity-50'
            )}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoveredRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              className={cn(
                starSize,
                'transition-colors',
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-muted-foreground'
              )}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
      <span className={cn('text-muted-foreground', textSize)}>
        ({ratingCount})
      </span>
    </div>
  );
}
