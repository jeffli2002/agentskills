import { Link } from 'wouter';

export default function AiAgentTutorialPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">AI Agent Tutorial: Complete Beginner's Guide</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Learn how to use AI agents effectively with Agent Skills to supercharge your development workflow.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">What is an AI Agent?</h2>
        <p className="text-muted-foreground mb-4">
          An AI agent is an artificial intelligence system capable of autonomously performing tasks, making decisions, and interacting with other systems based on your instructions. Unlike traditional chatbots that simply respond to messages, AI agents can execute code, manipulate files, call APIs, and complete complex multi-step workflows. Modern AI agents like Claude Code and OpenAI Codex understand context, remember preferences, and learn from interactions to provide increasingly relevant assistance.
        </p>
        <p className="text-muted-foreground mb-4">
          The key difference between basic AI assistants and AI agents lies in agency—the ability to take action. While a chatbot might explain how to write a function, an AI agent can actually write, test, and debug the code for you. This makes AI agents invaluable for developers seeking to automate repetitive tasks, accelerate development cycles, and focus on higher-level problem solving.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Getting Started with AI Agents</h2>
        <p className="text-muted-foreground mb-4">
          To begin using AI agents, choose a platform that suits your needs. Claude Code offers deep code understanding and strong development capabilities. OpenAI Codex provides fast code generation and broad language support. Cursor combines AI assistance with a modern editor experience. Our platform supports all major AI agent platforms through the standardized SKILL.md format.
        </p>
        <p className="text-muted-foreground mb-4">
          Once you've selected your AI agent, install relevant agent skills to extend its capabilities. Browse our marketplace for skills matching your use case—whether you need help with code review, testing, documentation, security auditing, or domain-specific tasks. Most skills install in seconds and work immediately with supported platforms.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Installing Agent Skills</h2>
        <p className="text-muted-foreground mb-4">
          Installing agent skills is straightforward. Browse our marketplace, find skills that match your needs, and click to view details. Most skills can be installed by downloading the ZIP file and extracting the SKILL.md to your agent's skills directory. For Claude Code, place the file in ~/.claude/skills/. For OpenClaw, use ~/.openclaw/workspace/skills/. Our CLI tool automates this process: npx @jefflee2002/agentskills install skill-name.
        </p>
        <p className="text-muted-foreground mb-4">
          After installation, your AI agent automatically discovers the new skills on startup. You can then invoke skills through natural language—simply describe what you need, and the agent will apply the appropriate skill. Some skills activate automatically based on keywords in your conversation.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Effective Prompting Techniques</h2>
        <p className="text-muted-foreground mb-4">
          Getting the best results from AI agents requires effective communication. Be specific about your requirements, including desired outputs, constraints, and context. Instead of "Write a function," try "Write a TypeScript function that validates email addresses using regex, returning boolean, with JSDoc documentation." Provide relevant background information when needed.
        </p>
        <p className="text-muted-foreground mb-4">
          Break complex tasks into smaller steps for better results. If you need a complete feature implemented, ask the agent to first design the approach, then implement incrementally, reviewing each step. Use agent skills to provide specialized knowledge—the right skill can dramatically improve output quality in specific domains.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Best Practices</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-3">
          <li><strong>Start Simple:</strong> Begin with proven skills from the marketplace before creating custom ones</li>
          <li><strong>Review Outputs:</strong> Always verify AI-generated code before using in production</li>
          <li><strong>Iterate Gradually:</strong> Refine prompts based on results rather than expecting perfection</li>
          <li><strong>Use Appropriate Skills:</strong> Select skills matching your specific use case for best results</li>
          <li><strong>Provide Context:</strong> Give the AI relevant background information for better assistance</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Next Steps</h2>
        <p className="text-muted-foreground mb-4">
          Explore our marketplace to discover agent skills that match your needs. Start with popular skills in your domain, then create custom skills for specialized requirements. Join our community to share knowledge and learn from other developers.
        </p>
      </div>
    </div>
  );
}
