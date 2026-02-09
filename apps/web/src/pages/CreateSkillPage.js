import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { InputPanel } from '@/components/skill-composer/InputPanel';
import { CanvasPanel } from '@/components/skill-composer/CanvasPanel';
import { PreviewPanel } from '@/components/skill-composer/PreviewPanel';
import { ClarifyPanel } from '@/components/skill-composer/ClarifyPanel';
import { generateSkillStreaming, regenerateSkill, saveSkillDraft, publishSkill, clarifyRequirements, } from '@/lib/api';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
// Helper to extract name from SKILL.md frontmatter
function extractNameFromSkillMd(skillMd) {
    // Try YAML frontmatter: name: skill-name
    const frontmatterMatch = skillMd.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
        if (nameMatch) {
            return nameMatch[1].trim().replace(/^["']|["']$/g, '');
        }
    }
    // Fallback: first # heading
    const headingMatch = skillMd.match(/^#\s+(.+)$/m);
    if (headingMatch) {
        return headingMatch[1].trim();
    }
    return '';
}
// Helper to extract description from SKILL.md frontmatter
function extractDescriptionFromSkillMd(skillMd) {
    // Try YAML frontmatter: description: "..."
    const frontmatterMatch = skillMd.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        // Match description with quotes
        const descMatch = frontmatter.match(/^description:\s*["'](.+)["']$/m);
        if (descMatch) {
            return descMatch[1].trim();
        }
        // Match description without quotes
        const descMatchNoQuotes = frontmatter.match(/^description:\s*(.+)$/m);
        if (descMatchNoQuotes) {
            return descMatchNoQuotes[1].trim().replace(/^["']|["']$/g, '');
        }
    }
    // Fallback: first paragraph after heading
    const paragraphMatch = skillMd.match(/^#.+\n+([^\n#]+)/m);
    if (paragraphMatch) {
        return paragraphMatch[1].trim().substring(0, 200);
    }
    return '';
}
export function CreateSkillPage() {
    const { user, loading: authLoading, login } = useAuth();
    const [, navigate] = useLocation();
    // State
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState(null);
    // Clarification state
    const [clarifying, setClarifying] = useState(false);
    const [clarifyLoading, setClarifyLoading] = useState(false);
    const [clarifyPhaseMessage, setClarifyPhaseMessage] = useState('');
    const [clarifyQuestions, setClarifyQuestions] = useState([]);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [initialPrompt, setInitialPrompt] = useState('');
    const [clarifyRound, setClarifyRound] = useState(0);
    const [totalQuestionsAsked, setTotalQuestionsAsked] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState();
    const MAX_CLARIFY_QUESTIONS = 5;
    // Generated data
    const [creationId, setCreationId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [skillMd, setSkillMd] = useState('');
    const [steps, setSteps] = useState([]);
    const [resources, setResources] = useState([]);
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
    const handleGenerate = async (prompt, category) => {
        console.log('handleGenerate called with:', { prompt, category });
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
            }
            else {
                // Show clarifying questions (limit to remaining quota)
                const questionsToShow = result.questions.slice(0, MAX_CLARIFY_QUESTIONS);
                setClarifyQuestions(questionsToShow);
                setTotalQuestionsAsked(questionsToShow.length);
                setClarifyLoading(false);
                setClarifyPhaseMessage('');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clarify requirements');
            setClarifying(false);
            setClarifyLoading(false);
            setClarifyPhaseMessage('');
        }
    };
    const handleClarifyAnswer = async (answers) => {
        // Prevent double-clicks
        if (clarifyLoading)
            return;
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
        const updatedHistory = [
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
            }
            else {
                // Calculate remaining question quota
                const remainingQuota = MAX_CLARIFY_QUESTIONS - totalQuestionsAsked;
                if (remainingQuota <= 0) {
                    // No more questions allowed, generate directly
                    setClarifying(false);
                    setClarifyLoading(false);
                    await doGenerate(result.refinedPrompt || initialPrompt, selectedCategory);
                }
                else {
                    // Show next round of questions (limited to remaining quota)
                    const questionsToShow = result.questions.slice(0, remainingQuota);
                    // Update questions and total FIRST, then round LAST (triggers remount via key)
                    setClarifyQuestions(questionsToShow);
                    setTotalQuestionsAsked(prev => prev + questionsToShow.length);
                    setClarifyRound(prev => prev + 1);
                    setClarifyLoading(false);
                }
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process answers');
            setClarifyLoading(false);
        }
    };
    const handleClarifySkip = async () => {
        setClarifying(false);
        await doGenerate(initialPrompt, selectedCategory);
    };
    const doGenerate = async (prompt, category) => {
        setGenerating(true);
        setError(null);
        setProgressMessage('Starting generation...');
        setSteps([]); // Clear steps before generation
        setSkillMd(''); // Clear skillMd before generation
        setResources([]); // Clear resources before generation
        console.log('Starting skill generation...');
        try {
            const result = await generateSkillStreaming(prompt, category, (progress) => {
                console.log('Progress:', progress);
                setProgressMessage(progress.message || '');
            }, (step, stepIndex, totalSteps) => {
                console.log('Step received:', stepIndex, step);
                // Add each step progressively as it arrives
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    newSteps[stepIndex] = step;
                    return newSteps;
                });
                setProgressMessage(`Building step ${stepIndex + 1} of ${totalSteps}...`);
            }, (_chunk, fullContent) => {
                // Update skillMd progressively as it streams
                setSkillMd(fullContent);
            });
            console.log('Streaming complete, result:', result);
            setCreationId(result.creationId);
            // Use result values, or extract from skillMd frontmatter as fallback
            const extractedName = result.name || extractNameFromSkillMd(result.skillMd);
            const extractedDesc = result.description || extractDescriptionFromSkillMd(result.skillMd);
            console.log('Generation result:', {
                resultName: result.name,
                resultDesc: result.description,
                extractedName,
                extractedDesc,
                resources: result.resources,
                creationId: result.creationId
            });
            setName(extractedName);
            setDescription(extractedDesc);
            setSkillMd(result.skillMd);
            setSteps(result.steps);
            setResources(result.resources || []);
            setProgressMessage('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate skill');
            setProgressMessage('');
        }
        finally {
            setGenerating(false);
        }
    };
    const handleRegenerate = async () => {
        if (!creationId || !feedback)
            return;
        setGenerating(true);
        setError(null);
        setShowFeedback(false);
        try {
            const result = await regenerateSkill(creationId, feedback);
            const extractedName = result.name || extractNameFromSkillMd(result.skillMd);
            const extractedDesc = result.description || extractDescriptionFromSkillMd(result.skillMd);
            setName(extractedName);
            setDescription(extractedDesc);
            setSkillMd(result.skillMd);
            setSteps(result.steps);
            setResources(result.resources || []);
            setFeedback('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to regenerate skill');
        }
        finally {
            setGenerating(false);
        }
    };
    const handleSave = async (content) => {
        if (!creationId)
            return;
        setSaving(true);
        try {
            await saveSkillDraft(creationId, content);
            setSkillMd(content);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        }
        finally {
            setSaving(false);
        }
    };
    const handlePublish = async (visibility) => {
        if (!creationId || !name || !description)
            return;
        setPublishing(true);
        setError(null);
        try {
            const result = await publishSkill(creationId, name, description, visibility);
            navigate(result.url);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to publish skill');
        }
        finally {
            setPublishing(false);
        }
    };
    if (authLoading) {
        return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-gold" }) }));
    }
    if (!user) {
        return null;
    }
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx("div", { className: "border-b border-border bg-card/50 px-6 py-4", children: _jsxs("div", { className: "max-w-7xl mx-auto flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("a", { href: "/", className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back"] }), _jsx("div", { className: "h-6 w-px bg-border" }), _jsx("h1", { className: "text-lg font-semibold", children: "Skill Composer" })] }), creationId && (_jsx("div", { className: "flex items-center gap-3", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowFeedback(true), disabled: generating, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Regenerate"] }) }))] }) }), error && (_jsx("div", { className: "bg-destructive/10 border-b border-destructive/20 px-6 py-3", children: _jsx("p", { className: "text-sm text-destructive max-w-7xl mx-auto", children: error }) })), _jsxs("div", { className: "flex-1 flex flex-col lg:flex-row", children: [_jsx("div", { className: "w-full lg:w-[40%] border-r border-border bg-card/30", children: clarifying && clarifyQuestions.length > 0 ? (_jsx(ClarifyPanel, { questions: clarifyQuestions, onAnswer: handleClarifyAnswer, onSkip: handleClarifySkip, loading: clarifyLoading, round: clarifyRound, totalAsked: totalQuestionsAsked, maxQuestions: MAX_CLARIFY_QUESTIONS }, `${clarifyRound}-${clarifyQuestions[0]?.id}`)) : (_jsx(InputPanel, { onGenerate: handleGenerate, loading: generating || clarifying, loadingMessage: clarifyPhaseMessage || (generating ? progressMessage : undefined), steps: steps })) }), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx("div", { className: "flex-1", children: _jsx(CanvasPanel, { steps: steps, loading: generating, progressMessage: progressMessage }) }), _jsx(PreviewPanel, { skillMd: skillMd, onSave: handleSave, saving: saving, onPublish: handlePublish, publishing: publishing, canPublish: !!creationId && !!name && !!description, isStreaming: generating && skillMd.length > 0, resources: resources })] })] }), showFeedback && (_jsx("div", { className: "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Refine Your Skill" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Describe what you'd like to change or improve about the generated skill." }), _jsx("textarea", { value: feedback, onChange: (e) => setFeedback(e.target.value), placeholder: "e.g., 'Add error handling for edge cases' or 'Make it work with Python instead of TypeScript'", className: "w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[100px] mb-4" }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "ghost", onClick: () => {
                                        setShowFeedback(false);
                                        setFeedback('');
                                    }, children: "Cancel" }), _jsx(Button, { onClick: handleRegenerate, disabled: !feedback, className: "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold", children: "Regenerate" })] })] }) }))] }));
}
