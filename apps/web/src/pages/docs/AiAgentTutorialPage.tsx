import { Link } from 'wouter';

export default function AiAgentTutorialPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">AI Agent Tutorial</h1>
        <p className="text-xl text-muted-foreground mb-8">Complete guide to getting started with AI agents.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">What is an AI Agent?</h2>
        <p className="text-muted-foreground mb-4">An AI agent is an AI system that can autonomously perform tasks, make decisions, and interact with other systems.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Getting Started</h2>
        <ol className="list-decimal pl-6 text-muted-foreground mb-6 space-y-2">
          <li>Choose an AI platform (Claude Code, OpenAI Codex, etc.)</li>
          <li>Install Agent Skills for your use case</li>
          <li>Configure and customize as needed</li>
          <li>Start using your AI agent</li>
        </ol>

        <h2 className="text-2xl font-bold mb-4 mt-8">Best Practices</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Start with proven skills from the marketplace</li>
          <li before production>Test thoroughly use</li>
          <li>Keep skills focused and modular</li>
        </ul>
      </div>
    </div>
  );
}
