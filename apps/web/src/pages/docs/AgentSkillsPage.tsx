import { Link } from 'wouter';

export default function AgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">Agent Skills Marketplace</h1>

        <div className="space-y-6 mt-8">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What is the Agent Skills Marketplace?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Our marketplace is a centralized platform where developers discover, install, and share AI agent capabilities. With over 1,000+ skills available, you can equip your AI assistant with abilities ranging from code review and automated testing to SEO analysis, content generation, and complex workflow automation. Skills are organized by category, rated by the community, and available for instant installation.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I find skills by category?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Browse categories including AI & Machine Learning, Automation, DevOps & Tooling, Documentation, Code Management, Security, Testing, Database, Design, Frontend, Backend, and Business. Each category contains skills tailored to specific tasks. Use search with keywords like "security," "testing," or "documentation" to narrow results. Filter by rating and popularity to discover high-quality skills.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I install a skill?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Click "Download ZIP" on any skill page to get the complete package. Extract to your agent's skills directory—for Claude Code, use ~/.claude/skills/, for OpenClaw, use ~/.openclaw/workspace/skills/. Our CLI automates: npx @jefflee2002/agentskills install skill-name. For VPS without Node.js, use curl to download directly from our API.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do ratings and reviews work?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Skills are rated on a 5-star scale by community members. You can also leave detailed reviews sharing your experience. High-rated skills appear in featured sections and category highlights. Ratings help others discover quality content and provide feedback to creators. Engage with reviews—creators can respond and update skills based on suggestions.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Can I contribute skills to the marketplace?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Absolutely! Use our Skill Composer to create skills from natural language descriptions, then publish to the marketplace. Choose public (visible to everyone) or private (only you) visibility. Public skills gain community exposure through ratings and reviews. High-quality skills with positive feedback appear in featured placements.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I save skills for later?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Click the "Favorite" button on any skill to save it to your personal collection. Favorited skills appear in your "My Skills" section for quick access. This helps you organize skills across different projects and revisit them easily. You can unfavorite at any time.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What are popular skill categories?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Top categories include Code Review (security, quality, best practices), Testing (unit tests, integration tests, coverage), Documentation (readme, API docs, comments), Automation (CI/CD, deployment, workflows), AI & ML (model integration, data processing), and Business (CRM, analytics, reporting). Each category has hundreds of specialized skills.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/skills"><a className="text-primary hover:underline">Browse All Skills →</a></Link>
        </div>
      </div>
    </div>
  );
}
