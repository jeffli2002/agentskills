import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { WorkflowNode } from './WorkflowNode';
import { Sparkles, Loader2, Brain, Wand2, CheckCircle2 } from 'lucide-react';
// Determine the phase from the progress message
function getPhaseInfo(message) {
    const lowerMessage = message.toLowerCase();
    // Check if we're in skillMd writing phase
    const isSkillMdPhase = lowerMessage.includes('skill.md') || lowerMessage.includes('writing skill');
    if (lowerMessage.includes('analyzing') || lowerMessage.includes('connecting')) {
        return { icon: _jsx(Loader2, { className: "w-5 h-5 animate-spin text-gold" }), phase: 'Initializing', isSkillMdPhase };
    }
    if (lowerMessage.includes('thinking') || lowerMessage.includes('analyzing') ||
        lowerMessage.includes('understanding') || lowerMessage.includes('planning') ||
        lowerMessage.includes('designing') || lowerMessage.includes('preparing')) {
        return { icon: _jsx(Brain, { className: "w-5 h-5 text-purple-400 animate-pulse" }), phase: 'Thinking', isSkillMdPhase };
    }
    if (lowerMessage.includes('generating') || lowerMessage.includes('writing') ||
        lowerMessage.includes('creating')) {
        return { icon: _jsx(Wand2, { className: "w-5 h-5 text-gold animate-pulse" }), phase: 'Generating', isSkillMdPhase };
    }
    if (lowerMessage.includes('finalizing') || lowerMessage.includes('saving')) {
        return { icon: _jsx(CheckCircle2, { className: "w-5 h-5 text-green-400" }), phase: 'Finalizing', isSkillMdPhase };
    }
    if (lowerMessage.includes('building step')) {
        return { icon: _jsx(Wand2, { className: "w-5 h-5 text-gold" }), phase: 'Building', isSkillMdPhase };
    }
    return { icon: _jsx(Loader2, { className: "w-5 h-5 animate-spin text-gold" }), phase: 'Processing', isSkillMdPhase };
}
export function CanvasPanel({ steps, loading, progressMessage }) {
    // Track which step indices are "new" (just appeared)
    const [newStepIndices, setNewStepIndices] = useState(new Set());
    const prevStepsLengthRef = useRef(0);
    // Check if we're in the skillMd writing phase (steps are done)
    const { isSkillMdPhase } = getPhaseInfo(progressMessage || '');
    const stepsComplete = steps.length > 0 && isSkillMdPhase;
    useEffect(() => {
        // When steps array grows, mark new indices as "new"
        if (steps.length > prevStepsLengthRef.current) {
            const newIndices = new Set();
            for (let i = prevStepsLengthRef.current; i < steps.length; i++) {
                newIndices.add(i);
            }
            setNewStepIndices(newIndices);
            // Clear "new" status after animation completes (~1s)
            const timeout = setTimeout(() => {
                setNewStepIndices(new Set());
            }, 1000);
            prevStepsLengthRef.current = steps.length;
            return () => clearTimeout(timeout);
        }
        // Reset when steps are cleared
        if (steps.length === 0) {
            prevStepsLengthRef.current = 0;
            setNewStepIndices(new Set());
        }
    }, [steps.length]);
    // Show empty state only when not loading and no steps
    if (!loading && steps.length === 0) {
        return (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-muted-foreground", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4", children: _jsx(Sparkles, { className: "w-8 h-8 text-gold/50" }) }), _jsx("p", { className: "text-sm", children: "Your workflow will appear here" }), _jsx("p", { className: "text-xs mt-1", children: "Describe your skill to get started" })] }));
    }
    // Show loading state when generating and no steps yet
    if (loading && steps.length === 0) {
        const { icon, phase } = getPhaseInfo(progressMessage || '');
        return (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-muted-foreground px-8", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6", children: icon }), _jsxs("div", { className: "text-center max-w-sm", children: [_jsx("p", { className: "text-xs text-gold/70 uppercase tracking-wider mb-1", children: phase }), _jsx("p", { className: "text-sm font-medium text-foreground mb-2 transition-all duration-300", children: progressMessage || 'Generating skill...' })] }), _jsx("div", { className: "w-48 h-1 bg-muted rounded-full mt-6 overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light animate-shimmer bg-[length:200%_100%]" }) })] }));
    }
    // Show steps progressively (with loading indicator if still generating steps)
    return (_jsx("div", { className: "h-full overflow-auto p-6", children: _jsxs("div", { className: "max-w-lg mx-auto space-y-2", children: [steps.map((step, idx) => (_jsx(WorkflowNode, { step: step, isLast: (!loading || stepsComplete) && idx === steps.length - 1, isNew: newStepIndices.has(idx) }, idx))), loading && !stepsComplete && (_jsxs("div", { className: "flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card/30 animate-pulse", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0", children: _jsx(Loader2, { className: "w-4 h-4 animate-spin text-gold" }) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: "text-sm text-muted-foreground", children: progressMessage || 'Generating next step...' }) })] })), loading && stepsComplete && (_jsxs("div", { className: "flex items-center gap-3 p-4 rounded-lg border border-green-500/30 bg-green-500/5", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0", children: _jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" }) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: "text-sm text-green-400", children: "Workflow complete! Writing SKILL.md..." }) })] }))] }) }));
}
