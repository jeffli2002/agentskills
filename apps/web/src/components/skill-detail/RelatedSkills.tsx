import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getRelatedSkills } from '@/lib/api';
import type { RelatedSkill } from '@agentskills/shared';

interface RelatedSkillsProps {
  skillId: string;
  category: string;
}

function getInitials(name: string): string {
  return name
    .split(/[\s-_]/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function RelatedSkills({ skillId, category }: RelatedSkillsProps) {
  const [skills, setSkills] = useState<RelatedSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const data = await getRelatedSkills(skillId, category);
        setSkills(data);
      } catch (err) {
        console.error('Failed to fetch related skills:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [skillId, category]);

  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-4">
        <h3 className="font-semibold text-[#e4e4e7] mb-4">Related Skills</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2d2d44]" />
              <div className="flex-1">
                <div className="h-4 bg-[#2d2d44] rounded w-3/4 mb-1" />
                <div className="h-3 bg-[#2d2d44] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (skills.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2d2d44]">
        <h3 className="font-semibold text-[#e4e4e7]">Related Skills</h3>
      </div>

      <div className="p-2">
        {skills.map((skill) => (
          <Link key={skill.id} href={`/skills/${skill.id}`}>
            <a className="flex items-center gap-3 p-2 rounded-md hover:bg-[#2d2d44]/50 transition-colors group">
              <Avatar className="h-8 w-8">
                <AvatarImage src={skill.authorAvatarUrl || undefined} alt={skill.author} />
                <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
                  {getInitials(skill.author)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <code className="block text-sm text-zinc-300 group-hover:text-amber-400 transition-colors font-mono truncate">
                  <span className="text-zinc-500">import </span>
                  <span className="text-emerald-400">"{skill.name}"</span>
                </code>
                <span className="text-xs text-zinc-500">{skill.author}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
                <Star className="h-3 w-3" />
                <span>{skill.starsCount.toLocaleString()}</span>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
