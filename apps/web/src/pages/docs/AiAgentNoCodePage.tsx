import { Link } from 'wouter';

export default function AiAgentNoCodePage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">No-Code AI Agents</h1>
        <p className="text-xl text-muted-foreground mb-8">Build AI agents without writing code.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">What is No-Code?</h2>
        <p className="text-muted-foreground mb-4">No-code platforms let you create AI agents using visual interfaces - no programming required.</p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Benefits</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
          <li>No programming knowledge needed</li>
          <li>Fast prototyping and deployment</li>
          <li>Easy to modify and maintain</li>
          <li>Share with team members</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">How It Works</h2>
        <p className="text-muted-foreground">Choose from pre-built skills, configure them through the UI, and deploy your agent in minutes.</p>
      </div>
    </div>
  );
}
