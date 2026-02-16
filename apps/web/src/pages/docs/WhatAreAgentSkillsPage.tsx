import { Link } from 'wouter';

export default function WhatAreAgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12" style={{ backgroundColor: '#121418' }}>
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6" style={{ color: '#E4E6EA' }}>What are Agent Skills? Complete Guide</h1>

        <div className="space-y-6 mt-8">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What are Agent Skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Agent skills are reusable SKILL.md files that extend AI coding assistants like Claude Code and Codex CLI with specialized capabilities, workflows, and domain expertise. Each skill is a modular package that defines what an AI agent can do—ranging from code review and automated testing to SEO analysis, content generation, and complex workflow automation. With over 1,000+ agent skills available in our marketplace, you can equip your AI assistant with abilities across diverse domains including development, marketing, operations, and business.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do Agent Skills work?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              When you install an agent skill, the SKILL.md file is placed in your agent's skills directory. The AI agent reads this file when starting up or during conversation, learning about the capabilities, instructions, and workflows defined within. This allows the agent to offer specialized assistance in areas like debugging, documentation writing, database design, security auditing, and hundreds of other domains. The skills follow an open standard ensuring compatibility across platforms like Claude Code, OpenAI Codex, Cursor, and OpenClaw.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How to install Agent Skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Installing agent skills is simple. Browse our marketplace, find skills matching your needs, and click "Download ZIP" to get the SKILL.md file. Place it in your agent's skills directory—for Claude Code, typically ~/.claude/skills/, and for OpenClaw, ~/.openclaw/workspace/skills/. Our CLI tool automates this: npx @jefflee2002/agentskills install skill-name. The agent automatically discovers skills on startup. For VPS environments without Node.js, use curl to download directly from our API.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Are Agent Skills free to use?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Yes! All skills in our marketplace are free to download and use. We believe in open knowledge sharing to help the AI agent community grow. Creators earn recognition through ratings, favorites, and community visibility. Premium features like advanced analytics or team management may require payment, but the core skill library remains free. This open approach has resulted in a thriving ecosystem of over 1,000 community-contributed skills.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Which AI platforms support Agent Skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Most major AI agent platforms support the SKILL.md format, including Claude Code, OpenAI Codex, GitHub Copilot, Cursor, and OpenClaw. This cross-platform compatibility means you can build skills once and use them across different AI assistants. Our platform serves as a centralized marketplace where developers can discover, share, and install skills regardless of which AI platform they use. The standardized format ensures consistent behavior across different agents.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How to create my own Agent Skill?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Use our Skill Composer—an AI-powered tool that generates well-structured SKILL.md files from natural language descriptions. Click "Create with AI," describe what you want your skill to do (e.g., "A skill that helps review code for security vulnerabilities"), answer clarifying questions, and get a complete skill ready for customization and publishing. The composer learns from top-rated community skills to generate professional-quality outputs based on proven patterns.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What are popular use cases for Agent Skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Developers use agent skills for diverse purposes: code review automation, generating unit tests, analyzing code quality, creating documentation, refactoring legacy code, performing security audits, integrating with APIs, building CI/CD pipelines, and automating repetitive development tasks. The marketplace spans categories including AI & machine learning, automation, DevOps, documentation, code management, security, testing, and business applications. Skills can be combined for complex workflows.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I enable skills on my VPS or local machine?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Use our CLI tool: npx @jefflee2002/agentskills install skill-name --global. This auto-detects your agents (OpenClaw, Claude Code, Cursor, etc.) and places the SKILL.md in the right directory. On a VPS without Node.js, use curl: curl -o ~/.openclaw/workspace/skills/[skill-name]/SKILL.md "https://agentskills.cv/api/skills/[skill-id]/export/openclaw". For manual installation, copy downloaded SKILL.md to your agent's skills directory.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How are skills reviewed and rated?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Skills are rated by the community on a 5-star scale. You can favorite skills to save them for later and help others discover quality content. Popular skills with high ratings appear in featured sections and category highlights. Creators can respond to reviews, update skills based on feedback, and iterate on improvements. This community-driven quality assurance helps ensure high-quality skills rise to the top.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/skills"><a className="text-primary hover:underline">Browse Agent Skills →</a></Link>
        </div>
      </div>
    </div>
  );
}
