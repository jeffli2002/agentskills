import { Link } from 'wouter';
import type { Skill, SkillWithUserData } from '@agentskills/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingWidget } from './RatingWidget';
import { FavoriteButton } from './FavoriteButton';

interface SkillCardProps {
  skill: Skill | SkillWithUserData;
  onFavoriteChange?: (skillId: string, isFavorited: boolean) => void;
  onRatingChange?: (skillId: string, avgRating: number, ratingCount: number) => void;
}

function isSkillWithUserData(skill: Skill | SkillWithUserData): skill is SkillWithUserData {
  return 'isFavorited' in skill || 'userRating' in skill;
}

export function SkillCard({ skill, onFavoriteChange, onRatingChange }: SkillCardProps) {
  const userRating = isSkillWithUserData(skill) ? skill.userRating : undefined;
  const isFavorited = isSkillWithUserData(skill) ? skill.isFavorited : undefined;

  return (
    <Card className="flex flex-col h-full transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/skills/${skill.id}`}>
              <CardTitle className="text-lg hover:text-primary cursor-pointer truncate">
                {skill.name}
              </CardTitle>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              by {skill.author}
            </p>
          </div>
          <FavoriteButton
            skillId={skill.id}
            isFavorited={isFavorited}
            onFavoriteChange={(favorited) => onFavoriteChange?.(skill.id, favorited)}
            size="sm"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <CardDescription className="line-clamp-2 flex-1">
          {skill.description}
        </CardDescription>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{skill.category}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <svg
              className="h-4 w-4"
              fill="none"
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
            <span>{skill.starsCount.toLocaleString()}</span>
          </div>
        </div>
        <RatingWidget
          skillId={skill.id}
          avgRating={skill.avgRating}
          ratingCount={skill.ratingCount}
          userRating={userRating}
          onRatingChange={(avgRating, ratingCount) =>
            onRatingChange?.(skill.id, avgRating, ratingCount)
          }
          size="sm"
        />
      </CardContent>
    </Card>
  );
}
