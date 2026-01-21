import { useState, useEffect } from 'react';
import { Redirect, Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getFavorites } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';

export function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return;

      setLoading(true);
      try {
        const data = await getFavorites();
        setSkills(data);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [user]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/login" />;
  }

  const handleFavoriteChange = (skillId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      // Remove from list when unfavorited
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    }
  };

  const handleRatingChange = (
    skillId: string,
    avgRating: number,
    ratingCount: number
  ) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, avgRating, ratingCount } : s))
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>

      {!loading && skills.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="h-16 w-16 text-muted-foreground mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6">
            Start exploring skills and add them to your favorites!
          </p>
          <Link href="/skills">
            <Button>Browse Skills</Button>
          </Link>
        </div>
      ) : (
        <SkillList
          skills={skills}
          loading={loading}
          emptyMessage="No favorites yet"
          onFavoriteChange={handleFavoriteChange}
          onRatingChange={handleRatingChange}
        />
      )}
    </div>
  );
}
