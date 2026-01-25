import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getSkill, parseSkillFiles, parseSkillMetadata } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingWidget } from '@/components/skills/RatingWidget';
import {
  TerminalBreadcrumb,
  GitStatsBar,
  FileExplorer,
  PackageCard,
  InstallCommands,
  DownloadSection,
  RelatedSkills,
  SkillMdPreview,
} from '@/components/skill-detail';

export function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSkill() {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getSkill(id);
        if (!data) {
          setError('Skill not found');
        } else {
          setSkill(data);
        }
      } catch (err) {
        console.error('Failed to fetch skill:', err);
        setError('Failed to load skill');
      } finally {
        setLoading(false);
      }
    }
    fetchSkill();
  }, [id]);

  const handleRatingChange = (avgRating: number, ratingCount: number) => {
    if (skill) {
      setSkill({ ...skill, avgRating, ratingCount });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Skeleton breadcrumb */}
        <div className="bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4">
          <div className="container mx-auto">
            <div className="h-5 bg-[#2d2d44] rounded w-48 animate-pulse" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-muted rounded w-2/3" />
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-24 bg-muted rounded" />
                <div className="h-48 bg-muted rounded" />
              </div>
            </div>
            {/* Right column skeleton */}
            <div className="space-y-6">
              <div className="h-40 bg-muted rounded animate-pulse" />
              <div className="h-32 bg-muted rounded animate-pulse" />
              <div className="h-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">{error || 'Skill not found'}</h1>
            <p className="text-muted-foreground mb-8">
              The skill you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/skills">
              <Button>Browse Skills</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse files and metadata from JSON strings
  const files = parseSkillFiles(skill.filesJson);
  const parsedMetadata = parseSkillMetadata(skill.skillMdParsed);

  return (
    <div className="min-h-screen bg-background">
      {/* Terminal Breadcrumb */}
      <TerminalBreadcrumb author={skill.author} skillName={skill.name} />

      <div className="container mx-auto px-4 py-8">
        {/* Main Grid: 2/3 + 1/3 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm">
                      {skill.category}
                    </Badge>
                    <RatingWidget
                      skillId={skill.id}
                      avgRating={skill.avgRating}
                      ratingCount={skill.ratingCount}
                      onRatingChange={handleRatingChange}
                      size="md"
                    />
                  </div>
                </div>
              </div>

              {/* Description with code comment styling */}
              <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] p-4">
                <p className="font-mono text-sm text-zinc-400">
                  <span className="text-zinc-600">{'// '}</span>
                  {skill.description}
                </p>
              </div>
            </div>

            {/* Git Stats Bar */}
            <GitStatsBar
              stars={skill.starsCount}
              forks={skill.forksCount}
              updatedAt={skill.lastCommitAt || skill.updatedAt}
            />

            {/* File Explorer */}
            <FileExplorer files={files} skillName={skill.name} />

            {/* SKILL.md Preview */}
            <SkillMdPreview
              metadata={parsedMetadata}
              content={skill.skillMdContent}
            />
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Package Card */}
            <PackageCard skill={skill} />

            {/* Install Commands */}
            <InstallCommands author={skill.author} skillName={skill.name} />

            {/* Download Section */}
            <DownloadSection skillId={skill.id} skillName={skill.name} />

            {/* Related Skills */}
            <RelatedSkills skillId={skill.id} category={skill.category} />
          </div>
        </div>
      </div>
    </div>
  );
}
