import { Star, GitFork, Clock } from 'lucide-react';

interface GitStatsBarProps {
  stars: number;
  forks: number;
  updatedAt: number | null;
}

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return 'Unknown';

  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function GitStatsBar({ stars, forks, updatedAt }: GitStatsBarProps) {
  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-4">
      <div className="flex items-center gap-2 mb-3">
        <code className="font-mono text-xs text-zinc-500">
          <span className="text-emerald-400">$</span> git log --oneline --stat
        </code>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-sm">
            <span className="text-amber-400 font-semibold">{stars.toLocaleString()}</span>
            <span className="text-zinc-400 ml-1">stars</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-blue-400" />
          <span className="font-mono text-sm">
            <span className="text-blue-400 font-semibold">{forks.toLocaleString()}</span>
            <span className="text-zinc-400 ml-1">forks</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-sm">
            <span className="text-zinc-400">updated </span>
            <span className="text-emerald-400">{formatRelativeTime(updatedAt)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
