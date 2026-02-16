import { Link } from 'wouter';

export default function WhatAreAgentSkillsPage() {
  const faqs = [
    { q: 'What are Agent Skills?', a: 'Agent Skills are lightweight, open-format modules that extend AI agent capabilities. Each skill contains a SKILL.md file that defines what the AI can do.' },
    { q: 'How do I install Agent Skills?', a: 'Visit our marketplace, find a skill you need, and click install. Most agent skills work immediately with platforms like Claude Code and OpenAI Codex.' },
    { q: 'How to create my own Agent Skill?', a: 'Create a folder with a SKILL.md file inside. Include a name, description, and detailed instructions. Upload to our marketplace to share.' },
    { q: 'Are Agent Skills free?', a: 'Many agent skills are free. Some premium skills may require payment. Basic skills for individual use are mostly free.' },
    { q: 'Which AI platforms support Agent Skills?', a: 'Most major platforms support the open SKILL.md format: Claude Code, OpenAI Codex, GitHub Copilot, Cursor, and VS Code.' },
  ];

  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs">
          <a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a>
        </Link>
        
        <h1 className="text-4xl font-bold mb-6">What are Agent Skills? A Complete Guide</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Agent Skills are modular capabilities that extend AI agent functionality.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Understanding Agent Skills</h2>
        <p className="text-muted-foreground mb-4">
          Agent skills are instruction sets that define how an AI agent should behave. When you install an agent skill, your AI gains access to specialized knowledge and workflows.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Frequently Asked Questions</h2>
        <div className="space-y-4 mt-6">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-xl border bg-card">
              <h3 className="font-semibold text-lg mb-3">{faq.q}</h3>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/skills">
            <a className="text-primary hover:underline">Browse Skills →</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
