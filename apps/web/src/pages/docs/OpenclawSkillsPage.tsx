import { Link } from 'wouter';

export default function OpenclawSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">Openclaw Skills: Enterprise AI Automation</h1>
        <p className="text-xl text-muted-foreground mb-8">
          OpenClaw is a powerful AI assistant framework providing enterprise-grade capabilities. OpenClaw Skills extend this with specialized functions for professional development teams.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">What is OpenClaw?</h2>
        <p className="text-muted-foreground mb-4">
          OpenClaw is an AI assistant framework designed for professional development environments. It provides a robust foundation for AI-powered automation, with features specifically tailored for enterprise needs including team collaboration, access control, workflow integration, and extensibility. OpenClaw runs as a local service, keeping your code and data secure while providing powerful AI assistance.
        </p>
        <p className="text-muted-foreground mb-4">
          Unlike cloud-based AI assistants, OpenClaw operates entirely on your infrastructure—whether that's your local machine, office server, or private cloud. This makes it ideal for organizations with strict data security requirements, proprietary codebases, or compliance obligations. OpenClaw integrates with your existing tools and workflows, becoming a seamless part of your development process.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">OpenClaw Skills System</h2>
        <p className="text-muted-foreground mb-4">
          OpenClaw Skills extend the framework's core capabilities with specialized functions. Each skill is a modular package containing instructions, examples, and workflows that your OpenClaw assistant can apply to specific tasks. The skill system is designed for flexibility—skills can be combined, stacked, and customized to match your team's unique requirements.
        </p>
        <p className="text-muted-foreground mb-4">
          Skills follow an open standard ensuring compatibility and portability. You can use skills created by the community, modify them for your needs, or create entirely new skills based on your expertise. This ecosystem approach means you benefit from collective knowledge while maintaining full control over your AI capabilities.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Installing Skills for OpenClaw</h2>
        <p className="text-muted-workspace mb-4">
          Installing skills for OpenClaw is straightforward. The typical installation location is ~/.openclaw/workspace/skills/[skill-name]/SKILL.md. You can manually place skill files in this directory, or use our CLI tool which automates the process: npx @jefflee2002/agentskills install skill-name --platform openclaw.
        </p>
        <p className="text-muted-foreground mb-4">
          For server environments without Node.js, skills can be installed via direct download. Use curl to fetch the SKILL.md file directly from our API: curl -o ~/.openclaw/workspace/skills/[skill-name]/SKILL.md "https://agentskills.cv/api/skills/[skill-id]/export/openclaw". After installation, restart OpenClaw or use the reload command to discover new skills.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Converting Skills to OpenClaw Format</h2>
        <p className="text-muted-foreground mb-4">
          Our OpenClaw Converter transforms skills from other platforms into OpenClaw-compatible format. Simply paste a SKILL.md file, import from GitHub, or select a marketplace skill—the converter validates the structure, ensures compatibility, and provides a ready-to-use OpenClaw skill. This allows you to leverage the broader skills ecosystem while using OpenClaw as your primary assistant.
        </p>
        <p className="text-muted-foreground mb-4">
          The converter handles format differences between platforms, ensuring instructions are properly interpreted by OpenClaw. It validates syntax, checks for compatibility issues, and provides warnings about any platform-specific features that might not translate directly. This makes it easy to build your OpenClaw skill library from community resources.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Enterprise Features</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-3">
          <li><strong>Local Deployment:</strong> Keep all data on your infrastructure for security and compliance</li>
          <li><strong>Team Collaboration:</strong> Share skills across team members with consistent configurations</li>
          <li><strong>Access Control:</strong> Fine-grained permissions for skill usage and management</li>
          <li><strong>Workflow Integration:</strong> Connect with CI/CD pipelines, ticketing systems, and development tools</li>
          <li><strong>Custom Skills:</strong> Create private skills for proprietary processes and domain expertise</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Getting Started</h2>
        <p className="text-muted-foreground mb-4">
          To begin using OpenClaw, install the framework on your local machine or server. Browse our marketplace for skills matching your needs, install them using the CLI or direct download, and start benefiting from AI-powered assistance. For teams, consider setting up a shared skills repository for consistent capabilities across all members.
        </p>
      </div>
    </div>
  );
}
