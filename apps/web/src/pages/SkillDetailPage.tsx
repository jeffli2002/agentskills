import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getSkill, getDownloadUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingWidget } from '@/components/skills/RatingWidget';
import { FavoriteButton } from '@/components/skills/FavoriteButton';

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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded w-1/4 mb-8" />
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li>
            <Link href="/">
              <a className="hover:text-foreground">Home</a>
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/skills">
              <a className="hover:text-foreground">Skills</a>
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground">{skill.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
              <p className="text-muted-foreground">by {skill.author}</p>
            </div>
            <FavoriteButton skillId={skill.id} size="md" />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {skill.category}
            </Badge>
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
              <span>{skill.starsCount.toLocaleString()} stars</span>
            </div>
            <RatingWidget
              skillId={skill.id}
              avgRating={skill.avgRating}
              ratingCount={skill.ratingCount}
              onRatingChange={handleRatingChange}
              size="md"
            />
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {skill.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Get This Skill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a
                href={getDownloadUrl(skill.id)}
                download
                className="inline-flex items-center justify-center w-full whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </a>
              <a
                href={skill.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                View on GitHub
              </a>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">File Size</span>
                <span>{(skill.fileSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Downloads</span>
                <span>{skill.downloadCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {new Date(skill.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span>
                  {new Date(skill.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
