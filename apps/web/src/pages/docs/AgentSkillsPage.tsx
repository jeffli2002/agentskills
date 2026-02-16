import { Link } from 'wouter';

export default function AgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">Agent Skills Marketplace</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Discover, install, and share AI agent capabilities. Our marketplace offers 1,000+ skills across development, automation, and business domains.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Browse Skills by Category</h2>
        <p className="text-muted-foreground mb-4">
          Our marketplace organizes agent skills into intuitive categories matching real-world development needs. The AI & Machine Learning category contains skills for model integration, data processing, and ML pipeline assistance. Automation skills help streamline workflows, handle repetitive tasks, and integrate with external services. Documentation skills assist in generating and maintaining technical documentation.
        </p>
        <p className="text-muted-foreground mb-4">
          Additional categories include Code Management (version control, refactoring, code review), DevOps & Tooling (CI/CD, containerization, infrastructure), Security (vulnerability scanning, compliance checking, secure coding), Testing (unit test generation, integration testing, test coverage), Database (schema design, query optimization, migration assistance), Design (UI prototyping, accessibility checking, design system implementation), and Business (CRM integration, analytics, reporting).
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Finding the Right Skills</h2>
        <p className="text-muted-foreground mb-4">
          Search functionality allows you to find skills matching specific requirements. Use keywords like "security," "testing," or "documentation" to narrow results. Filter by category, rating, and popularity to discover high-quality skills. Most skill listings include descriptions, usage examples, and user reviews that help you evaluate fit.
        </p>
        <p className="text-muted-foreground mb-4">
          Pay attention to skill ratings and reviews—community feedback reveals real-world effectiveness. Skills with high ratings typically offer clear instructions, comprehensive coverage, and reliable performance. Don't hesitate to try multiple skills for the same task; different skills may excel in different scenarios.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Installing Skills</h2>
        <p className="text-muted-foreground mb-4">
          Installing skills is designed to be effortless. On any skill page, click "Download ZIP" to get the complete skill package including SKILL.md and any supporting files. Extract the contents to your agent's skills directory—for Claude Code, this is typically ~/.claude/skills/, and for OpenClaw, ~/.openclaw/workspace/skills/. The agent automatically discovers installed skills on startup.
        </p>
        <p className="text-muted-foreground mb-4">
          Our CLI tool simplifies installation further: npx @jefflee2002/agentskills install skill-name handles everything automatically, including directory creation and placement. For VPS environments without Node.js, you can use curl to download skills directly: curl -o ~/.openclaw/workspace/skills/[skill-name]/SKILL.md "https://agentskills.cv/api/skills/[skill-id]/export/openclaw".
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Contributing Skills</h2>
        <p className="text-muted-foreground mb-4">
          The marketplace thrives on community contributions. If you've created useful agent skills, consider sharing them with the community. Skills can be published as public (visible to everyone) or private (only visible to you). Public skills go through community review via ratings and reviews, building your reputation as a skilled creator.
        </p>
        <p className="text-muted-foreground mb-4">
          To create skills, use our Skill Composer—an AI-powered tool that generates well-structured SKILL.md files based on proven patterns. Describe what you want your skill to do, answer clarifying questions, and get a complete skill ready for customization and publishing. High-quality skills with positive reviews gain visibility through featured placements and category highlights.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Community Features</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-3">
          <li><strong>Ratings:</strong> Rate skills on a 5-star scale to help others find quality content</li>
          <li><strong>Reviews:</strong> Leave detailed feedback about your experience with specific skills</li>
          <li><strong>Favorites:</strong> Save skills for quick access in your personal collection</li>
          <li><strong>Categories:</strong> Browse organized collections matching different development needs</li>
          <li><strong>Trending:</strong> Discover popular skills gaining traction in the community</li>
        </ul>

        <div className="mt-12">
          <Link href="/skills"><a className="text-primary hover:underline">Browse All Skills →</a></Link>
        </div>
      </div>
    </div>
  );
}
