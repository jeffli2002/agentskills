import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { InputPanel } from '@/components/skill-composer/InputPanel';
import { CanvasPanel } from '@/components/skill-composer/CanvasPanel';
import { PreviewPanel } from '@/components/skill-composer/PreviewPanel';
import { ClarifyPanel } from '@/components/skill-composer/ClarifyPanel';
import {
  generateSkill,
  generateSkillStreaming,
  regenerateSkill,
  saveSkillDraft,
  publishSkill,
  clarifyRequirements,
  type GenerateResponse,
  type GeneratedStep,
  type ClarifyQuestion,
  type ConversationMessage,
  type StreamProgress,
} from '@/lib/api';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';

export function CreateSkillPage() {
  const { user, loading: authLoading, login } = useAuth();
  const [, navigate] = useLocation();

  // State
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clarification state
  const [clarifying, setClarifying] = useState(false);
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyPhaseMessage, setClarifyPhaseMessage] = useState('');
  const [clarifyQuestions, setClarifyQuestions] = useState<ClarifyQuestion[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [clarifyRound, setClarifyRound] = useState(0);
  const [totalQuestionsAsked, setTotalQuestionsAsked] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const MAX_CLARIFY_QUESTIONS = 5;

  // Generated data
  const [creationId, setCreationId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skillMd, setSkillMd] = useState('');
  const [steps, setSteps] = useState<GeneratedStep[]>([]);
  const [progressMessage, setProgressMessage] = useState('');

  // Feedback for regeneration
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      login();
    }
  }, [user, authLoading, login]);

  const handleGenerate = async (prompt: string, category?: string) => {
    // Reset all previous state
    setError(null);
    setCreationId(null);
    setName('');
    setDescription('');
    setSkillMd('');
    setSteps([]);
    setProgressMessage('');
    setClarifyQuestions([]); // Reset clarify questions before new generation
    setClarifyLoading(true);
    setClarifyPhaseMessage('Analyzing your request...');

    // Set up clarification flow
    setInitialPrompt(prompt);
    setSelectedCategory(category);
    setClarifying(true);
    setClarifyRound(1);
    setConversationHistory([]);
    setTotalQuestionsAsked(0);

    try {
      // Update phase message after a short delay
      const phaseTimeout = setTimeout(() => {
        setClarifyPhaseMessage('Generating clarifying questions...');
      }, 1500);

      const result = await clarifyRequirements(prompt, []);
      clearTimeout(phaseTimeout);

      if (result.isComplete) {
        // Requirements are clear, generate directly
        setClarifying(false);
        setClarifyLoading(false);
        setClarifyPhaseMessage('');
        await doGenerate(result.refinedPrompt || prompt, category);
      } else {
        // Show clarifying questions (limit to remaining quota)
        const questionsToShow = result.questions.slice(0, MAX_CLARIFY_QUESTIONS);
        setClarifyQuestions(questionsToShow);
        setTotalQuestionsAsked(questionsToShow.length);
        setClarifyLoading(false);
        setClarifyPhaseMessage('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clarify requirements');
      setClarifying(false);
      setClarifyLoading(false);
      setClarifyPhaseMessage('');
    }
  };

  const handleClarifyAnswer = async (answers: Record<string, string | string[]>) => {
    // Prevent double-clicks
    if (clarifyLoading) return;

    setError(null);
    setClarifyLoading(true);

    // Format answers as a conversation message
    const answerText = Object.entries(answers)
      .map(([qId, answer]) => {
        const question = clarifyQuestions.find(q => q.id === qId);
        const answerStr = Array.isArray(answer) ? answer.join(', ') : answer;
        return `${question?.question || qId}: ${answerStr}`;
      })
      .join('\n');

    // Add to conversation history
    const updatedHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: 'assistant', content: JSON.stringify(clarifyQuestions) },
      { role: 'user', content: answerText },
    ];
    setConversationHistory(updatedHistory);

    // Check if we've reached the question limit
    if (totalQuestionsAsked >= MAX_CLARIFY_QUESTIONS) {
      setClarifying(false);
      setClarifyLoading(false);
      await doGenerate(initialPrompt, selectedCategory);
      return;
    }

    try {
      const result = await clarifyRequirements(initialPrompt, updatedHistory);

      if (result.isComplete) {
        // Requirements are clear, generate the skill
        setClarifying(false);
        setClarifyLoading(false);
        await doGenerate(result.refinedPrompt || initialPrompt, selectedCategory);
      } else {
        // Calculate remaining question quota
        const remainingQuota = MAX_CLARIFY_QUESTIONS - totalQuestionsAsked;

        if (remainingQuota <= 0) {
          // No more questions allowed, generate directly
          setClarifying(false);
          setClarifyLoading(false);
          await doGenerate(result.refinedPrompt || initialPrompt, selectedCategory);
        } else {
          // Show next round of questions (limited to remaining quota)
          const questionsToShow = result.questions.slice(0, remainingQuota);
          // Update questions and total FIRST, then round LAST (triggers remount via key)
          setClarifyQuestions(questionsToShow);
          setTotalQuestionsAsked(prev => prev + questionsToShow.length);
          setClarifyRound(prev => prev + 1);
          setClarifyLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process answers');
      setClarifyLoading(false);
    }
  };

  const handleClarifySkip = async () => {
    setClarifying(false);
    await doGenerate(initialPrompt, selectedCategory);
  };

  const doGenerate = async (prompt: string, category?: string) => {
    setGenerating(true);
    setError(null);
    setProgressMessage('Starting generation...');
    setSteps([]); // Clear steps before generation
    setSkillMd(''); // Clear skillMd before generation

    try {
      const result = await generateSkillStreaming(
        prompt,
        category,
        (progress) => {
          setProgressMessage(progress.message || '');
        },
        (step, stepIndex, totalSteps) => {
          // Add each step progressively as it arrives
          setSteps(prevSteps => {
            const newSteps = [...prevSteps];
            newSteps[stepIndex] = step;
            return newSteps;
          });
          setProgressMessage(`Building step ${stepIndex + 1} of ${totalSteps}...`);
        },
        (_chunk, fullContent) => {
          // Update skillMd progressively as it streams
          setSkillMd(fullContent);
        }
      );
      setCreationId(result.creationId);
      setName(result.name);
      setDescription(result.description);
      setSkillMd(result.skillMd);
      setSteps(result.steps);
      setProgressMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate skill');
      setProgressMessage('');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!creationId || !feedback) return;

    setGenerating(true);
    setError(null);
    setShowFeedback(false);

    try {
      const result = await regenerateSkill(creationId, feedback);
      setName(result.name);
      setDescription(result.description);
      setSkillMd(result.skillMd);
      setSteps(result.steps);
      setFeedback('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate skill');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (content: string) => {
    if (!creationId) return;

    setSaving(true);
    try {
      await saveSkillDraft(creationId, content);
      setSkillMd(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (visibility: 'public' | 'private') => {
    if (!creationId || !name || !description) return;

    setPublishing(true);
    setError(null);

    try {
      const result = await publishSkill(creationId, name, description, visibility);
      navigate(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish skill');
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </a>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold">
              Skill Composer
            </h1>
          </div>

          {creationId && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeedback(true)}
                disabled={generating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3">
          <p className="text-sm text-destructive max-w-7xl mx-auto">{error}</p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel - Input or Clarify */}
        <div className="w-full lg:w-[40%] border-r border-border bg-card/30">
          {clarifying && clarifyQuestions.length > 0 ? (
            <ClarifyPanel
              key={`${clarifyRound}-${clarifyQuestions[0]?.id}`}
              questions={clarifyQuestions}
              onAnswer={handleClarifyAnswer}
              onSkip={handleClarifySkip}
              loading={clarifyLoading}
              round={clarifyRound}
              totalAsked={totalQuestionsAsked}
              maxQuestions={MAX_CLARIFY_QUESTIONS}
            />
          ) : (
            <InputPanel
              onGenerate={handleGenerate}
              loading={generating || clarifying}
              loadingMessage={clarifyPhaseMessage || (generating ? progressMessage : undefined)}
              steps={steps}
            />
          )}
        </div>

        {/* Right panel - Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <CanvasPanel steps={steps} loading={generating} progressMessage={progressMessage} />
          </div>

          {/* Bottom panel - Preview */}
          <PreviewPanel
            skillMd={skillMd}
            onSave={handleSave}
            saving={saving}
            onPublish={handlePublish}
            publishing={publishing}
            canPublish={!!creationId && !!name && !!description}
            isStreaming={generating && skillMd.length > 0}
          />
        </div>
      </div>

      {/* Feedback modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Refine Your Skill</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Describe what you'd like to change or improve about the generated skill.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., 'Add error handling for edge cases' or 'Make it work with Python instead of TypeScript'"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[100px] mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowFeedback(false);
                  setFeedback('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRegenerate}
                disabled={!feedback}
                className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold"
              >
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
