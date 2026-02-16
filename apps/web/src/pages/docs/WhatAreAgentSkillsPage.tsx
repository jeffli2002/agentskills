import { Link } from 'wouter';

export default function WhatAreAgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">What are Agent Skills? Complete Guide</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Agent skills are reusable SKILL.md files that extend AI coding assistants like Claude Code and Codex CLI with specialized capabilities, workflows, and domain expertise.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Understanding Agent Skills</h2>
        <p className="text-muted-foreground mb-4">
          Agent skills are modular capability packages that enhance AI agents. Each skill is defined in a SKILL.md file—a simple, open-format specification that any compatible AI agent can read and execute. With over 1,000+ agent skills available in our marketplace, you can equip your AI assistant with abilities ranging from code review and automated testing to SEO analysis, content generation, and complex workflow automation.
        </p>
        <p className="text-muted-foreground mb-4">
          The power of agent skills lies in their simplicity and reusability. Instead of programming custom behaviors from scratch, you can browse our marketplace, find skills that match your needs, and install them with a single click. Each skill encapsulates proven patterns and best practices gathered from the developer community.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">How Agent Skills Work</h2>
        <p className="text-muted-foreground mb-4">
          When you install an agent skill, the SKILL.md file is placed in your agent's skills directory. The AI agent reads this file when starting up or during conversation, learning about the capabilities, instructions, and workflows defined within. This allows the agent to offer specialized assistance in areas like debugging, documentation writing, database design, security auditing, and hundreds of other domains.
        </p>
        <p className="text-muted-foreground mb-4">
          Agent skills follow an open standard (SKILL.md) that ensures compatibility across platforms. Whether you use Claude Code, OpenAI Codex, Cursor, or other AI coding assistants, you can leverage the same library of skills. This standardization makes it easy to share knowledge and build on each other's work.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Key Benefits</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-3">
          <li><strong>Instant Capability Addition:</strong> Add new AI capabilities in seconds without coding</li>
          <li><strong>Community-Tested:</strong> Skills are rated and reviewed by real developers</li>
          <li><strong>Platform Compatible:</strong> Works with Claude Code, OpenAI Codex, Cursor, and more</li>
          <li><strong>Open Standard:</strong> SKILL.md format ensures interoperability</li>
          <li><strong>Continuous Improvement:</strong> Community feedback drives skill quality</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Popular Use Cases</h2>
        <p className="text-muted-foreground mb-4">
          Developers use agent skills for diverse purposes: code review automation, generating unit tests, analyzing code quality, creating documentation, refactoring legacy code, performing security audits, integrating with APIs, building CI/CD pipelines, and automating repetitive development tasks. The marketplace spans categories including AI & machine learning, automation, DevOps, documentation, code management, security, testing, and business applications.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Getting Started</h2>
        <p className="text-muted-foreground mb-4">
          Browse our marketplace to discover skills relevant to your workflow. Most skills can be installed instantly—simply download the ZIP file and place the SKILL.md in your agent's skills directory. For Claude Code users, the typical location is ~/.claude/skills/. For OpenClaw users, it's ~/.openclaw/workspace/skills/. Use our CLI tool for automatic installation: npx @jefflee2002/agentskills install skill-name.
        </p>

        <div className="mt-12">
          <Link href="/skills"><a className="text-primary hover:underline">Browse Agent Skills →</a></Link>
        </div>
      </div>
    </div>
  );
}
