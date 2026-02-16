import { Link } from 'wouter';

export default function AiAgentNoCodePage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">No-Code AI Agents: Build Without Programming</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create powerful AI agent capabilities without writing code. Our no-code tools make AI automation accessible to everyone.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Understanding No-Code AI Agents</h2>
        <p className="text-muted-foreground mb-4">
          No-code AI agents democratize artificial intelligence by allowing anyone to create AI-powered capabilities without programming knowledge. Instead of writing code, you use visual interfaces—drag-and-drop builders, form-based configuration, and natural language descriptions—to define what you want your AI agent to do. This approach removes technical barriers, enabling business analysts, product managers, and domain experts to leverage AI capabilities directly.
        </p>
        <p className="text-muted-foreground mb-4">
          The no-code movement has transformed software development, and AI agents are the next frontier. By combining intuitive interfaces with powerful AI models, anyone can build agents that automate workflows, analyze data, generate content, and handle complex tasks—all without writing a single line of code. Our platform provides the tools and marketplace to make this a reality.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Skill Composer: No-Code Skill Creation</h2>
        <p className="text-muted-foreground mb-4">
          Our Skill Composer represents the future of no-code AI agent development. Instead of manually writing SKILL.md files, you describe what you want in plain language—"I need a skill that analyzes code for security vulnerabilities" or "Create a skill that generates unit tests for Python functions." The AI understands your intent and generates a complete, well-structured skill file.
        </p>
        <p className="text-muted-foreground mb-4">
          The Skill Composer asks clarifying questions to refine your requirements, ensuring the generated skill precisely matches your needs. You can preview the generated SKILL.md, make edits if necessary, and publish directly to the marketplace. This bridges the gap between natural language ideas and technical implementations, making agent skill creation accessible to everyone.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Benefits of No-Code Development</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-3">
          <li><strong>Accessibility:</strong> No programming experience required—describe what you need in words</li>
          <li><strong>Speed:</strong> Create functional skills in minutes instead of hours</li>
          <li><strong>Iteration:</strong> Easily modify and improve skills based on results</li>
          <li><strong>Collaboration:</strong> Business users and technical teams can work together effectively</li>
          <li><strong>Learning:</strong> Understand AI agent capabilities without technical commitment</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Real-World Applications</h2>
        <p className="text-muted-foreground mb-4">
          No-code AI agents serve diverse business needs. Marketing teams create agents for content generation, social media management, and campaign analysis. Product managers build agents for user research synthesis and requirement documentation. Operations teams automate data entry, scheduling, and reporting workflows. Support teams develop agents for ticket categorization and response drafting.
        </p>
        <p className="text-muted-foreground mb-4">
          The key is identifying repetitive, rule-based tasks that benefit from AI assistance. Start with low-stakes applications to build confidence, then expand to more complex processes. Our marketplace provides pre-built skills you can use immediately or customize for your specific needs—no coding required.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Getting Started Without Code</h2>
        <p className="text-muted-foreground mb-4">
          Begin by exploring our marketplace for existing skills matching your needs. Most skills install with a single click and work immediately—no configuration required. When you need something custom, use the Skill Composer to describe your requirements. The AI handles technical implementation, generating a proper SKILL.md file you can use directly or refine further.
        </p>
        <p className="text-muted-foreground mb-4">
          For teams, consider starting with a pilot project in one department. Document results, gather feedback, and expand gradually. The skills you create can be shared across your organization, multiplying the value of each no-code agent you build.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">When to Consider Custom Development</h2>
        <p className="text-muted-foreground mb-4">
          While no-code tools handle most requirements, complex scenarios may benefit from custom SKILL.md development. If you need deeply integration-specific behavior, extremely precise instructions, or platform-native features, manual skill creation offers more control. However, even in these cases, starting with Skill Composer output provides a solid foundation to build upon.
        </p>

        <div className="mt-12">
          <Link href="/create"><a className="text-primary hover:underline">Try No-Code Skill Composer →</a></Link>
        </div>
      </div>
    </div>
  );
}
