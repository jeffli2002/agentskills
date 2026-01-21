import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { addFavorite, removeFavorite } from '@/lib/api';
import { useAuth } from '@/context/auth';

interface FavoriteButtonProps {
  skillId: string;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  size?: 'sm' | 'md';
}

export function FavoriteButton({
  skillId,
  isFavorited = false,
  onFavoriteChange,
  size = 'md',
}: FavoriteButtonProps) {
  const { user, login } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (isSubmitting) return;

    if (!user) {
      login();
      return;
    }

    setIsSubmitting(true);
    try {
      if (favorited) {
        await removeFavorite(skillId);
        setFavorited(false);
        onFavoriteChange?.(false);
      } else {
        await addFavorite(skillId);
        setFavorited(true);
        onFavoriteChange?.(true);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonSize = size === 'sm' ? 'sm' : 'icon';

  return (
    <Button
      variant="ghost"
      size={buttonSize}
      onClick={handleClick}
      disabled={isSubmitting}
      className={cn(
        'transition-colors',
        favorited && 'text-red-500 hover:text-red-600'
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={cn(
          iconSize,
          'transition-colors',
          favorited ? 'fill-current' : 'fill-none'
        )}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </Button>
  );
}
