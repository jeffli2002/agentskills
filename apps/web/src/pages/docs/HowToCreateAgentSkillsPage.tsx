import { Link } from 'wouter';

export default function HowToCreateAgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">How to Create Agent Skills</h1>
        <p className="text-xl text-muted-foreground mb-8">Step-by-step guide to building your own AI agent skills.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Create Your SKILL.md</h2>
        <p className="text-muted-foreground mb-4">Every agent skill needs a SKILL.md file with:</p>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
          <li><strong>name:</strong> The skill name</li>
          <li><strong>description:</strong> What the skill does</li>
          <li><strong>instructions:</strong> Detailed steps for the AI</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Example</h2>
        <pre className="p-4 rounded-xl bg-card border text-sm overflow-x-auto">
{`# My Skill
name: seo-analyzer
description: Analyzes website SEO
instructions: |
  1. Fetch the webpage
  2. Check meta tags
  3. Analyze content structure
  4. Provide recommendations`}
        </pre>

        <div className="mt-12">
          <Link href="/create"><a className="text-primary hover:underline">Create Your Skill →</a></Link>
        </div>
      </div>
    </div>
  );
}
