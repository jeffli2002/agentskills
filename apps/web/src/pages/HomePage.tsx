import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getSkills } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';

export function HomePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopSkills() {
      try {
        const response = await getSkills({ sort: 'stars', limit: 6 });
        setSkills(response.data);
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopSkills();
  }, []);

  const handleFavoriteChange = (skillId: string, isFavorited: boolean) => {
    // Update skill in state if needed
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, isFavorited } : s
      )
    );
  };

  const handleRatingChange = (skillId: string, avgRating: number, ratingCount: number) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, avgRating, ratingCount } : s
      )
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Agent Skills Marketplace
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover, download, and share powerful skills for your AI agents.
            Extend your agent's capabilities with community-built tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/skills">
              <Button size="lg">Browse Skills</Button>
            </Link>
            <a
              href="https://github.com/agentskills"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Top Skills Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Skills</h2>
            <Link href="/skills">
              <Button variant="ghost">View all</Button>
            </Link>
          </div>
          <SkillList
            skills={skills}
            loading={loading}
            emptyMessage="No skills available yet"
            onFavoriteChange={handleFavoriteChange}
            onRatingChange={handleRatingChange}
          />
        </div>
      </section>
    </div>
  );
}
