import { ExternalLink, Share2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/skills/FavoriteButton';
import { Tooltip } from '@/components/ui/tooltip';
import type { Skill } from '@agentskills/shared';

interface PackageCardProps {
  skill: Skill;
}

function getInitials(name: string): string {
  return name
    .split(/[\s-_]/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PackageCard({ skill }: PackageCardProps) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: skill.name,
          text: skill.description,
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    }
  };

  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-5">
      {/* Author info */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={skill.authorAvatarUrl || undefined} alt={skill.author} />
          <AvatarFallback className="bg-amber-500/20 text-amber-400">
            {getInitials(skill.author)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#e4e4e7] truncate">{skill.author}</h3>
          <p className="text-sm text-zinc-400">Creator</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <FavoriteButton skillId={skill.id} size="md" className="flex-1" />
        <Tooltip content="Share">
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="border-[#2d2d44] bg-transparent hover:bg-[#2d2d44]"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>

      {/* GitHub link */}
      <a
        href={skill.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400 transition-colors"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="truncate">{skill.githubUrl.replace('https://github.com/', '')}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    </div>
  );
}
