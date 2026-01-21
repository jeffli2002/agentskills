import type { Skill, SkillWithUserData } from '@agentskills/shared';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { SkillCard } from './SkillCard';

interface SkillListProps {
  skills: (Skill | SkillWithUserData)[];
  loading?: boolean;
  emptyMessage?: string;
  onFavoriteChange?: (skillId: string, isFavorited: boolean) => void;
  onRatingChange?: (skillId: string, avgRating: number, ratingCount: number) => void;
}

function SkillCardSkeleton() {
  return (
    <Card className="flex flex-col h-full animate-pulse">
      <div className="p-6 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2 mt-2" />
          </div>
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      </div>
      <div className="p-6 pt-0 flex-1 flex flex-col gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-4/5" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 bg-muted rounded-full w-16" />
          <div className="h-4 bg-muted rounded w-12" />
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-4 bg-muted rounded" />
          ))}
          <div className="h-4 bg-muted rounded w-8 ml-1" />
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="h-16 w-16 text-muted-foreground mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}

export function SkillList({
  skills,
  loading = false,
  emptyMessage = 'No skills found',
  onFavoriteChange,
  onRatingChange,
}: SkillListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkillCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          onFavoriteChange={onFavoriteChange}
          onRatingChange={onRatingChange}
        />
      ))}
    </div>
  );
}
