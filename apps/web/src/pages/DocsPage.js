import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const docsPages = [
    { id: 'what-are-agent-skills', title: 'What are Agent Skills?', desc: 'Learn the basics of Agent Skills', icon: '📚' },
    { id: 'how-to-create-agent-skills', title: 'How to Create Agent Skills', desc: 'Step-by-step guide to building skills', icon: '🛠️' },
    { id: 'ai-agent-tutorial', title: 'AI Agent Tutorial', desc: 'Complete guide for beginners', icon: '🎓' },
    { id: 'agent-skills', title: 'Agent Skills', desc: 'Browse and discover skills', icon: '🔍' },
    { id: 'openclaw-skills', title: 'Openclaw Skills', desc: 'Enterprise-grade capabilities', icon: '🚀' },
    { id: 'ai-agent-no-code', title: 'No-Code AI Agents', desc: 'Build without programming', icon: '⚡' },
    { id: 'create-ai-agent-skills', title: 'Create AI Agent Skills', desc: 'Share your expertise', icon: '💡' },
    { id: 'ai-agent-tutorial-faq', title: 'AI Agent FAQ', desc: 'Common questions answered', icon: '❓' },
];
export default function DocsPage() {
    return (_jsx("div", { className: "min-h-[80vh] py-12", style: { backgroundColor: '#121418' }, children: _jsxs("div", { className: "max-w-6xl mx-auto px-4", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "Documentation" }), _jsx("p", { className: "text-xl text-muted-foreground mb-8 max-w-2xl", children: "Everything you need to know about Agent Skills. Learn how to create, install, and use AI agent capabilities." }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: docsPages.map((page) => (_jsxs("a", { href: `/docs/${page.id}`, className: "block p-6 rounded-xl border bg-card hover:border-primary transition", children: [_jsx("div", { className: "text-3xl mb-3", children: page.icon }), _jsx("h3", { className: "font-semibold text-lg mb-2", children: page.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: page.desc })] }, page.id))) })] }) }));
}
