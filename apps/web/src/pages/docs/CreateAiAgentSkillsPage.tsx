import { Link } from 'wouter';

export default function CreateAiAgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">Create AI Agent Skills</h1>
        <p className="text-xl text-muted-foreground mb-8">Share your expertise as reusable AI capabilities.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Why Create Skills?</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
          <li>Package your knowledge for reuse</li>
          <li>Help others benefit from your expertise</li>
          <li>Build a portfolio of AI capabilities</li>
          <li>Earn from premium skills</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">How to Create</h2>
        <ol className="list-decimal pl-6 text-muted-foreground mb-6 space-y-2">
          <li>Identify a specific task or expertise</li>
          <li>Write clear instructions in SKILL.md</li>
          <li>Test with different AI agents</li>
          <li>Publish to the marketplace</li>
        </ol>

        <div className="mt-12">
          <Link href="/create"><a className="text-primary hover:underline">Start Creating →</a></Link>
        </div>
      </div>
    </div>
  );
}
