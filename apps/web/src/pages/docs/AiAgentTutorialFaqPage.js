import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'wouter';
export default function AiAgentTutorialFaqPage() {
    const faqs = [
        { q: 'What are AI agents?', a: 'AI agents are AI systems that can autonomously perform tasks, make decisions, and interact with other systems based on user instructions.' },
        { q: 'Do I need coding skills?', a: 'No! Many AI agents can be built using no-code tools. However, coding skills can help you create more advanced custom skills.' },
        { q: 'Which platforms support Agent Skills?', a: 'Most major platforms: Claude Code, OpenAI Codex, GitHub Copilot, Cursor, and VS Code all support the SKILL.md format.' },
        { q: 'Are Agent Skills free?', a: 'Many skills are free. Premium skills may require payment. Basic skills for individual use are mostly free.' },
        { q: 'How do I install a skill?', a: 'Visit the skill page on our marketplace and click Install. Most skills work immediately with supported platforms.' },
        { q: 'Can I create custom skills?', a: 'Absolutely! Create a SKILL.md file with your instructions and publish it to share with others.' },
    ];
    return (_jsx("div", { className: "min-h-[80vh] py-12", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4", children: [_jsx(Link, { href: "/docs", children: _jsx("a", { className: "text-primary hover:underline mb-8 inline-block", children: "\u2190 Back to Docs" }) }), _jsx("h1", { className: "text-4xl font-bold mb-6", children: "AI Agent FAQ" }), _jsx("p", { className: "text-xl text-muted-foreground mb-8", children: "Common questions about AI agents and Agent Skills." }), _jsx("div", { className: "space-y-4 mt-8", children: faqs.map((faq, i) => (_jsxs("div", { className: "p-6 rounded-xl border bg-card", children: [_jsx("h3", { className: "font-semibold text-lg mb-3", children: faq.q }), _jsx("p", { className: "text-muted-foreground", children: faq.a })] }, i))) }), _jsx("div", { className: "mt-12", children: _jsx(Link, { href: "/docs", children: _jsx("a", { className: "text-primary hover:underline", children: "More Documentation \u2192" }) }) })] }) }));
}
