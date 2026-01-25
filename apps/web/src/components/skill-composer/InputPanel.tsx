import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Star, GitFork } from 'lucide-react';
import { getCategories } from '@/lib/api';
import type { GeneratedStep } from '@/lib/api';

interface InputPanelProps {
  onGenerate: (prompt: string, category?: string) => void;
  loading: boolean;
  loadingMessage?: string;
  steps: GeneratedStep[];
}

export function InputPanel({ onGenerate, loading, loadingMessage, steps }: InputPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.length >= 10 && !loading) {
      onGenerate(prompt, category || undefined);
    }
  };

  // Extract unique skills used across all steps
  const usedSkills = steps.flatMap(step => step.sources);
  const uniqueSkills = Array.from(
    new Map(usedSkills.map(s => [s.skillId, s])).values()
  ).slice(0, 5);

  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-gold" />
        Describe Your Skill
      </h2>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <Textarea
          placeholder="Describe the skill you want to create. For example: 'A skill that helps format and lint TypeScript code before committing to git'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 min-h-[150px] resize-none"
          maxLength={500}
          disabled={loading}
        />

        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{prompt.length}/500 characters</span>
          {prompt.length < 10 && prompt.length > 0 && (
            <span className="text-destructive">Min 10 characters required</span>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            Category (optional)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            disabled={loading}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          className="mt-6 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90"
          disabled={prompt.length < 10 || loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {loadingMessage || 'Generating...'}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Skill
            </>
          )}
        </Button>
      </form>

      {/* Inspired by section */}
      {uniqueSkills.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Inspired by
          </h3>
          <div className="space-y-2">
            {uniqueSkills.map((skill) => (
              <a
                key={skill.skillId}
                href={`/skills/${skill.skillId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <span className="text-sm text-foreground">{skill.skillName}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    {skill.stars >= 1000 ? `${(skill.stars / 1000).toFixed(1)}k` : skill.stars.toLocaleString()}
                  </span>
                  {skill.forks > 0 && (
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {skill.forks >= 1000 ? `${(skill.forks / 1000).toFixed(1)}k` : skill.forks.toLocaleString()}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
