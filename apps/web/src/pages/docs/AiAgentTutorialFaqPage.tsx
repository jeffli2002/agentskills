import { Link } from 'wouter';

export default function AiAgentTutorialFaqPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">AI Agent FAQ</h1>

        <div className="space-y-6 mt-8">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What are AI agents?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              AI agents are artificial intelligence systems capable of autonomously performing tasks, making decisions, and interacting with other systems based on user instructions. Unlike chatbots that simply respond to messages, AI agents can execute code, manipulate files, call APIs, and complete complex multi-step workflows. They understand context, remember preferences, and learn from interactions to provide increasingly relevant assistance.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Do I need coding skills to use AI agents?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              No! Many AI agents can be used effectively through natural language alone. Describe what you need in plain English, and the agent handles technical implementation. Our Skill Composer lets you create custom skills without coding. While coding skills help for advanced customization, the core functionality is accessible to everyone.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Which platforms support Agent Skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Most major platforms support the SKILL.md format: Claude Code, OpenAI Codex, GitHub Copilot, Cursor, and OpenClaw. This cross-platform compatibility means you can build skills once and use them across different AI assistants. Our marketplace serves as a centralized hub where developers discover, share, and install skills regardless of their chosen platform.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Are Agent Skills free?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Many skills are free. Basic skills for individual use are free. Premium skills may require payment. We believe in open knowledge sharing to help the AI agent community grow. Creators earn recognition through ratings, favorites, and community visibility. This open approach has resulted in a thriving ecosystem of over 1,000 community-contributed skills.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I install a skill?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Visit the skill page and click Install or Download ZIP. Extract SKILL.md to your agent's skills directory—for Claude Code, use ~/.claude/skills/, for OpenClaw use ~/.openclaw/workspace/skills/. Our CLI automates: npx @jefflee2002/agentskills install skill-name. The agent automatically discovers installed skills on startup.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Can I create custom skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Absolutely! Use our Skill Composer to describe what you want in plain language. The AI generates a complete SKILL.md file based on proven patterns. You can review, edit, and refine before publishing. Skills can be kept private for personal use or published publicly for the community. This makes skill creation accessible to everyone regardless of technical background.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I enable skills on my VPS?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Use our CLI tool: npx @jefflee2002/agentskills install skill-name --global. This auto-detects your agents and places SKILL.md correctly. For VPS without Node.js, use curl: curl -o ~/.openclaw/workspace/skills/[skill-name]/SKILL.md "https://agentskills.cv/api/skills/[skill-id]/export/openclaw". After installation, restart your agent to discover new skills.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What are the best practices for using AI agents?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Start simple with proven skills from the marketplace. Always review AI-generated code before production use. Iterate gradually rather than expecting perfection. Provide relevant context for better assistance. Use appropriate skills matching your specific use case. Think of AI agents as collaborators that improve with clear communication.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/docs"><a className="text-primary hover:underline">More Documentation →</a></Link>
        </div>
      </div>
    </div>
  );
}
