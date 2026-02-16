import { Link } from 'wouter';

export default function AiAgentTutorialPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">AI Agent Tutorial: Beginner's Guide</h1>

        <div className="space-y-6 mt-8">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What is an AI Agent?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              An AI agent is an artificial intelligence system capable of autonomously performing tasks, making decisions, and interacting with other systems based on your instructions. Unlike chatbots that simply respond to messages, AI agents can execute code, manipulate files, call APIs, and complete complex multi-step workflows. Modern AI agents like Claude Code and OpenAI Codex understand context, remember preferences, and learn from interactions to provide increasingly relevant assistance tailored to your specific needs.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I get started with AI Agents?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Choose a platform that suits your needs: Claude Code offers deep code understanding, OpenAI Codex provides fast code generation, Cursor combines AI with a modern editor, and OpenClaw offers enterprise-grade features. Once selected, browse our marketplace to install relevant agent skills that extend capabilities. Most skills install in seconds and work immediately with supported platforms. Start with skills matching your immediate needs, then expand as you become more comfortable.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I install Agent Skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Browse our marketplace, find skills matching your needs, and click to view details. Download the ZIP file and extract SKILL.md to your agent's skills directory—for Claude Code, use ~/.claude/skills/, and for OpenClaw, use ~/.openclaw/workspace/skills/. Our CLI tool automates this: npx @jefflee2002/agentskills install skill-name. After installation, your AI agent automatically discovers skills on startup and can invoke them through natural language.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I write effective prompts?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Be specific about requirements, including desired outputs, constraints, and context. Instead of "Write a function," try "Write a TypeScript function that validates email addresses using regex, returning boolean, with JSDoc documentation." Break complex tasks into smaller steps for better results. Use agent skills to provide specialized knowledge—the right skill dramatically improves output quality in specific domains.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Do I need coding skills to use AI Agents?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              No! While coding knowledge helps, many AI agents work effectively through natural language. You can describe what you need in plain English, and the agent handles technical implementation. Our Skill Composer lets you create custom skills without coding—just describe your idea and the AI generates the SKILL.md file. For best results, provide clear context and specific requirements.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What are the best practices for using AI Agents?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Start simple with proven skills from the marketplace before creating custom ones. Always review AI-generated code before using in production—while powerful, AI can make mistakes. Iterate gradually rather than expecting perfection in one try. Provide relevant context for better assistance. Use appropriate skills matching your specific use case for best results. Think of AI agents as collaborators that improve with clear communication.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I enable skills on my VPS?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Use our CLI: npx @jefflee2002/agentskills install skill-name. This auto-detects your agents and places SKILL.md correctly. For VPS without Node.js, use curl: curl -o ~/.openclaw/workspace/skills/[skill-name]/SKILL.md "https://agentskills.cv/api/skills/[skill-id]/export/openclaw". After installation, the skill is immediately available to your AI agent.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Which AI platforms work with Agent Skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Most major platforms support the SKILL.md format: Claude Code, OpenAI Codex, GitHub Copilot, Cursor, and OpenClaw. This cross-platform compatibility means you can build skills once and use them across different AI assistants. Our marketplace serves as a centralized hub where developers discover, share, and install skills regardless of their chosen AI platform.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/skills"><a className="text-primary hover:underline">Browse Skills →</a></Link>
        </div>
      </div>
    </div>
  );
}
