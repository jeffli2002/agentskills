import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { ClarifyQuestion, ConversationMessage } from '@/lib/api';

interface ClarifyPanelProps {
  questions: ClarifyQuestion[];
  onAnswer: (answers: Record<string, string | string[]>) => void;
  onSkip: () => void;
  loading: boolean;
  round: number;
  totalAsked?: number;
  maxQuestions?: number;
}

export function ClarifyPanel({ questions, onAnswer, onSkip, loading, round, totalAsked = 0, maxQuestions = 5 }: ClarifyPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Calculate the actual question number based on previous rounds
  // Ensure we never go below 1
  const previousQuestionsCount = Math.max(0, totalAsked - questions.length);
  const questionNumber = Math.max(1, previousQuestionsCount + currentQuestionIndex + 1);
  const totalQuestions = Math.max(totalAsked, questions.length, 1);

  const handleSingleSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleMultiSelect = (questionId: string, option: string) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || [];
      if (current.includes(option)) {
        return { ...prev, [questionId]: current.filter(o => o !== option) };
      }
      return { ...prev, [questionId]: [...current, option] };
    });
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Just submit answers - don't reset state here
      // Parent will either show new questions (remounting component) or start generation
      onAnswer(answers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isCurrentAnswered = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'text') return typeof answer === 'string' && answer.length > 0;
    if (currentQuestion.type === 'multiple') return Array.isArray(answer) && answer.length > 0;
    return typeof answer === 'string' && answer.length > 0;
  };

  if (!currentQuestion) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gold" />
          Quick Questions
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < questionNumber
                    ? 'bg-gold'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gold ml-2">
            {questionNumber}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Question content - centered */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          {/* Question number badge */}
          <div className="flex justify-center">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark to-gold text-background text-lg flex items-center justify-center font-bold shadow-lg">
              {questionNumber}
            </span>
          </div>

          {/* Question text */}
          <p className="text-center text-lg font-medium px-4">
            {currentQuestion.question}
          </p>

          {/* Answer options */}
          <div className="space-y-3 max-w-md mx-auto w-full">
            {currentQuestion.type === 'single' && currentQuestion.options && (
              currentQuestion.options.map(option => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect(currentQuestion.id, option)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'border-gold bg-gold/10 text-foreground shadow-md'
                      : 'border-border hover:border-gold/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      answers[currentQuestion.id] === option ? 'border-gold bg-gold' : 'border-muted-foreground'
                    }`}>
                      {answers[currentQuestion.id] === option && (
                        <CheckCircle2 className="w-3 h-3 text-background" />
                      )}
                    </div>
                    {option}
                  </div>
                </button>
              ))
            )}

            {currentQuestion.type === 'multiple' && currentQuestion.options && (
              currentQuestion.options.map(option => {
                const selected = ((answers[currentQuestion.id] as string[]) || []).includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleMultiSelect(currentQuestion.id, option)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                      selected
                        ? 'border-gold bg-gold/10 text-foreground shadow-md'
                        : 'border-border hover:border-gold/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selected ? 'border-gold bg-gold' : 'border-muted-foreground'
                      }`}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-background" />}
                      </div>
                      {option}
                    </div>
                  </button>
                );
              })
            )}

            {currentQuestion.type === 'text' && (
              <Textarea
                placeholder="Type your answer..."
                value={(answers[currentQuestion.id] as string) || ''}
                onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                className="min-h-[100px] resize-none rounded-xl border-2 focus:border-gold"
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {currentQuestionIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            disabled={loading}
            className="text-muted-foreground"
          >
            Skip all
          </Button>
        </div>
        <Button
          onClick={handleNext}
          disabled={!isCurrentAnswered() || loading}
          className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold px-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : isLastQuestion ? (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
