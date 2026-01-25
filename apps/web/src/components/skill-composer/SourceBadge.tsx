import { Star, Eye } from 'lucide-react';

interface SourceBadgeProps {
  skillId: string;
  skillName: string;
  views: number;
  rating: number;
  reason: string;
}

export function SourceBadge({ skillId, skillName, views, rating, reason }: SourceBadgeProps) {
  return (
    <a
      href={`/skills/${skillId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-border/50 bg-muted/30 p-3 hover:border-gold/50 hover:bg-muted/50 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground group-hover:text-gold transition-colors">
          {skillName}
        </span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views.toLocaleString()}
          </span>
          {rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-gold text-gold" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="text-gold/80 font-medium">Why: </span>
        {reason}
      </p>
    </a>
  );
}
