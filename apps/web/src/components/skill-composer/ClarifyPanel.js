import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
export function ClarifyPanel({ questions, onAnswer, onSkip, loading, round, totalAsked = 0, maxQuestions = 5 }) {
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    // Calculate the actual question number based on previous rounds
    // Ensure we never go below 1
    const previousQuestionsCount = Math.max(0, totalAsked - questions.length);
    const questionNumber = Math.max(1, previousQuestionsCount + currentQuestionIndex + 1);
    const totalQuestions = Math.max(totalAsked, questions.length, 1);
    const handleSingleSelect = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };
    const handleMultiSelect = (questionId, option) => {
        setAnswers(prev => {
            const current = prev[questionId] || [];
            if (current.includes(option)) {
                return { ...prev, [questionId]: current.filter(o => o !== option) };
            }
            return { ...prev, [questionId]: [...current, option] };
        });
    };
    const handleTextChange = (questionId, text) => {
        setAnswers(prev => ({ ...prev, [questionId]: text }));
    };
    const handleNext = () => {
        if (isLastQuestion) {
            // Just submit answers - don't reset state here
            // Parent will either show new questions (remounting component) or start generation
            onAnswer(answers);
        }
        else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };
    const isCurrentAnswered = () => {
        if (!currentQuestion)
            return false;
        const answer = answers[currentQuestion.id];
        if (currentQuestion.type === 'text')
            return typeof answer === 'string' && answer.length > 0;
        if (currentQuestion.type === 'multiple')
            return Array.isArray(answer) && answer.length > 0;
        return typeof answer === 'string' && answer.length > 0;
    };
    if (!currentQuestion) {
        return (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsx(Loader2, { className: "w-6 h-6 animate-spin text-gold" }) }));
    }
    return (_jsxs("div", { className: "h-full flex flex-col p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [_jsx(MessageCircle, { className: "w-5 h-5 text-gold" }), "Quick Questions"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex gap-1", children: Array.from({ length: totalQuestions }).map((_, i) => (_jsx("div", { className: `w-2 h-2 rounded-full transition-colors ${i < questionNumber
                                        ? 'bg-gold'
                                        : 'bg-muted'}` }, i))) }), _jsxs("span", { className: "text-sm font-medium text-gold ml-2", children: [questionNumber, "/", totalQuestions] })] })] }), _jsx("div", { className: "flex-1 flex flex-col justify-center", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-center", children: _jsx("span", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark to-gold text-background text-lg flex items-center justify-center font-bold shadow-lg", children: questionNumber }) }), _jsx("p", { className: "text-center text-lg font-medium px-4", children: currentQuestion.question }), _jsxs("div", { className: "space-y-3 max-w-md mx-auto w-full", children: [currentQuestion.type === 'single' && currentQuestion.options && (currentQuestion.options.map(option => (_jsx("button", { onClick: () => handleSingleSelect(currentQuestion.id, option), className: `w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${answers[currentQuestion.id] === option
                                        ? 'border-gold bg-gold/10 text-foreground shadow-md'
                                        : 'border-border hover:border-gold/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'}`, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${answers[currentQuestion.id] === option ? 'border-gold bg-gold' : 'border-muted-foreground'}`, children: answers[currentQuestion.id] === option && (_jsx(CheckCircle2, { className: "w-3 h-3 text-background" })) }), option] }) }, option)))), currentQuestion.type === 'multiple' && currentQuestion.options && (currentQuestion.options.map(option => {
                                    const selected = (answers[currentQuestion.id] || []).includes(option);
                                    return (_jsx("button", { onClick: () => handleMultiSelect(currentQuestion.id, option), className: `w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${selected
                                            ? 'border-gold bg-gold/10 text-foreground shadow-md'
                                            : 'border-border hover:border-gold/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'}`, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selected ? 'border-gold bg-gold' : 'border-muted-foreground'}`, children: selected && _jsx(CheckCircle2, { className: "w-3 h-3 text-background" }) }), option] }) }, option));
                                })), currentQuestion.type === 'text' && (_jsx(Textarea, { placeholder: "Type your answer...", value: answers[currentQuestion.id] || '', onChange: (e) => handleTextChange(currentQuestion.id, e.target.value), className: "min-h-[100px] resize-none rounded-xl border-2 focus:border-gold" }))] })] }) }), _jsxs("div", { className: "flex items-center justify-between mt-6 pt-4 border-t border-border", children: [_jsxs("div", { className: "flex items-center gap-2", children: [currentQuestionIndex > 0 && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: handleBack, disabled: loading, children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), "Back"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: onSkip, disabled: loading, className: "text-muted-foreground", children: "Skip all" })] }), _jsx(Button, { onClick: handleNext, disabled: !isCurrentAnswered() || loading, className: "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold px-6", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : isLastQuestion ? (_jsxs(_Fragment, { children: ["Continue", _jsx(ArrowRight, { className: "w-4 h-4 ml-2" })] })) : (_jsxs(_Fragment, { children: ["Next", _jsx(ArrowRight, { className: "w-4 h-4 ml-2" })] })) })] })] }));
}
