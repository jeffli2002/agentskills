import { Link } from 'wouter';

export default function OpenclawSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">Openclaw Skills</h1>
        <p className="text-xl text-muted-foreground mb-8">Enterprise-grade capabilities for AI agents.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">What is Openclaw?</h2>
        <p className="text-muted-foreground mb-4">Openclaw is an AI assistant framework that provides powerful agent capabilities. Openclaw Skills extend this with specialized functions.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Key Features</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
          <li>Modular skill system</li>
          <li>Easy installation and management</li>
          <li>Compatible with major AI platforms</li>
          <li>Regular updates and new skills</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Get Started</h2>
        <p className="text-muted-foreground">Browse our collection of Openclaw Skills to enhance your AI agent.</p>
      </div>
    </div>
  );
}
