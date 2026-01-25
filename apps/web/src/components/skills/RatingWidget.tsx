import { useState } from 'react';
import { cn } from '@/lib/utils';
import { rateSkill } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { ThumbsUp } from 'lucide-react';

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
            aria-label={`Rate ${star} out of 5`}
          >
            <ThumbsUp
              className={cn(
                starSize,
                'transition-colors',
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
      <span className={cn('text-muted-foreground', textSize)}>
        ({ratingCount})
      </span>
    </div>
  );
}
