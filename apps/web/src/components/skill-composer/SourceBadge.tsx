import { Star, GitFork } from 'lucide-react';

interface SourceBadgeProps {
  skillId: string;
  skillName: string;
  stars: number;
  forks: number;
  reason: string;
}

export function SourceBadge({ skillId, skillName, stars, forks, reason }: SourceBadgeProps) {
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
            <Star className="w-3 h-3 fill-gold text-gold" />
            {(stars || 0) >= 1000 ? `${((stars || 0) / 1000).toFixed(1)}k` : (stars || 0).toLocaleString()}
          </span>
          {(forks || 0) > 0 && (
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              {(forks || 0) >= 1000 ? `${((forks || 0) / 1000).toFixed(1)}k` : (forks || 0).toLocaleString()}
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
