import { useState, useEffect } from 'react';
import { Redirect, Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getMySkills } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';
import { Sparkles } from 'lucide-react';

export function MySkillsPage() {
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMySkills() {
      if (!user) return;

      setLoading(true);
      try {
        const data = await getMySkills();
        setSkills(data);
      } catch (error) {
        console.error('Failed to fetch my skills:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMySkills();
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Skills</h1>
        <Link href="/create">
          <Button className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90">
            <Sparkles className="w-4 h-4 mr-2" />
            Create New Skill
          </Button>
        </Link>
      </div>

      {!loading && skills.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gold/50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No skills created yet</h2>
          <p className="text-muted-foreground mb-6">
            Use the AI Skill Composer to create your first skill!
          </p>
          <Link href="/create">
            <Button className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Your First Skill
            </Button>
          </Link>
        </div>
      ) : (
        <SkillList
          skills={skills}
          loading={loading}
          emptyMessage="No skills created yet"
          onRatingChange={handleRatingChange}
        />
      )}
    </div>
  );
}
