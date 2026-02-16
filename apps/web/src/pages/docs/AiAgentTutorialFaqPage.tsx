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

  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">AI Agent FAQ</h1>
        <p className="text-xl text-muted-foreground mb-8">Common questions about AI agents and Agent Skills.</p>

        <div className="space-y-4 mt-8">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-xl border bg-card">
              <h3 className="font-semibold text-lg mb-3">{faq.q}</h3>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/docs"><a className="text-primary hover:underline">More Documentation →</a></Link>
        </div>
      </div>
    </div>
  );
}
