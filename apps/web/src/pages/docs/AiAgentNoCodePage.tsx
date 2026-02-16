import { Link } from 'wouter';

export default function AiAgentNoCodePage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">No-Code AI Agents</h1>

        <div className="space-y-6 mt-8">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" className="font-semibold text-lg mb-3 text-text-gold">What are No-Code AI Agents?</h2>
            <p className="text-muted-foreground" >
              No-code AI agents democratize artificial intelligence by allowing anyone to create AI-powered capabilities without programming knowledge. Instead of writing code, you use visual interfaces—form-based configuration and natural language descriptions—to define what you want your AI agent to do. This approach removes technical barriers, enabling business analysts, product managers, and domain experts to leverage AI capabilities directly.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" className="font-semibold text-lg mb-3 text-text-gold">How does the Skill Composer work without code?</h2>
            <p className="text-muted-foreground" >
              Describe what you want in plain language—"I need a skill that analyzes code for security vulnerabilities" or "Create a skill that generates unit tests for Python functions." The AI understands your intent and generates a complete, well-structured SKILL.md file. The composer asks clarifying questions to refine requirements, ensuring the generated skill precisely matches your needs.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" className="font-semibold text-lg mb-3 text-text-gold">What are the benefits of No-Code development?</h2>
            <p className="text-muted-foreground" >
              Benefits include accessibility (no programming experience required), speed (create functional skills in minutes), iteration (easily modify and improve skills), collaboration (business users and technical teams work together), and learning (understand AI agent capabilities without technical commitment). Anyone can build AI capabilities regardless of technical background.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" className="font-semibold text-lg mb-3 text-text-gold">What can I build with No-Code AI Agents?</h2>
            <p className="text-muted-foreground" >
              Marketing teams create agents for content generation and campaign analysis. Product managers build agents for user research synthesis. Operations teams automate data entry and reporting workflows. Support teams develop agents for ticket categorization. The key is identifying repetitive, rule-based tasks that benefit from AI assistance. Start with low-stakes applications, then expand to complex processes.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" className="font-semibold text-lg mb-3 text-text-gold">How do I get started without coding?</h2>
            <p className="text-muted-foreground" >
              Explore our marketplace for existing skills—most install with a single click. When you need something custom, use the Skill Composer to describe your requirements. The AI handles technical implementation, generating a proper SKILL.md file you can use directly or refine. For teams, start with a pilot project in one department, document results, then expand gradually.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" className="font-semibold text-lg mb-3 text-text-gold">When should I consider custom development?</h2>
            <p className="text-muted-foreground" >
              While no-code handles most requirements, complex scenarios may benefit from custom SKILL.md development. If you need deeply integration-specific behavior, extremely precise instructions, or platform-native features, manual creation offers more control. However, starting with Skill Composer output provides a solid foundation to build upon even in these cases.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/create"><a className="text-primary hover:underline">Try Skill Composer →</a></Link>
        </div>
      </div>
    </div>
  );
}
