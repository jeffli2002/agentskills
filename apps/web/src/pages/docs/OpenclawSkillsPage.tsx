import { Link } from 'wouter';

export default function OpenclawSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">OpenClaw Skills: Enterprise AI</h1>

        <div className="space-y-6 mt-8">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What is OpenClaw?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              OpenClaw is an AI assistant framework designed for professional development environments. It provides a robust foundation for AI-powered automation with features specifically tailored for enterprise needs including team collaboration, access control, workflow integration, and extensibility. OpenClaw runs as a local service, keeping your code and data secure while providing powerful AI assistance.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How does OpenClaw ensure security?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Unlike cloud-based AI assistants, OpenClaw operates entirely on your infrastructure—whether your local machine, office server, or private cloud. This makes it ideal for organizations with strict data security requirements, proprietary codebases, or compliance obligations. All data stays within your environment, and you maintain full control over access and usage.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I install skills for OpenClaw?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Install to ~/.openclaw/workspace/skills/[skill-name]/SKILL.md. Use our CLI tool: npx @jefflee2002/agentskills install skill-name --platform openclaw. For server environments without Node.js, use curl: curl -o ~/.openclaw/workspace/skills/[skill-name]/SKILL.md "https://agentskills.cv/api/skills/[skill-id]/export/openclaw". Restart OpenClaw after installation.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How does the OpenClaw Converter work?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              The converter transforms skills from other platforms into OpenClaw-compatible format. Paste a SKILL.md file, import from GitHub, or select a marketplace skill—the converter validates structure, ensures compatibility, and provides a ready-to-use OpenClaw skill. It handles format differences and provides warnings about platform-specific features.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What enterprise features does OpenClaw offer?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Enterprise features include local deployment (keep data on your infrastructure), team collaboration (share skills across team members with consistent configurations), access control (fine-grained permissions), workflow integration (connect with CI/CD, ticketing systems, development tools), and custom skills (private skills for proprietary processes).
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I convert skills to OpenClaw format?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Use our OpenClaw Converter tool on the platform. Paste any SKILL.md content, select OpenClaw as target, and the tool generates a compatible version. This allows you to leverage the broader skills ecosystem while using OpenClaw as your primary assistant. The converter validates syntax and checks for compatibility issues.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do teams use OpenClaw?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Teams set up a shared skills repository for consistent capabilities across all members. Administrators configure access controls determining who can use or modify skills. Team members benefit from standardized AI assistance while maintaining security boundaries. Skills can be customized for team-specific workflows and integrated with internal tools.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/skills"><a className="text-primary hover:underline">Browse OpenClaw Skills →</a></Link>
        </div>
      </div>
    </div>
  );
}
