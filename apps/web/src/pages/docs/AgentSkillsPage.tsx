import { Link } from 'wouter';

export default function AgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">Agent Skills</h1>
        <p className="text-xl text-muted-foreground mb-8">Discover and install skills for your AI agents.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Browse Skills</h2>
        <p className="text-muted-foreground mb-4">Explore 200,000+ skills across categories:</p>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
          <li>Development (code review, testing, debugging)</li>
          <li>Marketing (SEO, content, social media)</li>
          <li>Productivity (writing, research, analysis)</li>
          <li>Business (sales, customer support)</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">How to Install</h2>
        <p className="text-muted-foreground mb-4">Simply click "Install" on any skill page. Most skills work immediately with supported platforms.</p>

        <div className="mt-12">
          <Link href="/skills"><a className="text-primary hover:underline">Browse All Skills →</a></Link>
        </div>
      </div>
    </div>
  );
}
