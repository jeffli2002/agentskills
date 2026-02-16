import { Link } from 'wouter';

export default function CreateAiAgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">Create AI Agent Skills</h1>

        <div className="space-y-6 mt-8">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I create an Agent Skill?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Use our Skill Composer—an AI-powered tool that generates well-structured SKILL.md files from natural language. Click "Create with AI," describe your idea (e.g., "A skill that helps review code for security vulnerabilities"), answer clarifying questions, and get a complete skill ready for customization and publishing. The composer learns from top-rated community skills to generate professional-quality outputs.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Why should I create Agent Skills?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Creating skills lets you package your knowledge for reuse, help others benefit from your expertise, build a portfolio of AI capabilities, and potentially earn from premium skills. Skills formalize your expertise in a reusable format that AI agents can apply consistently. Your knowledge becomes accessible to anyone who installs your skill.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I write effective skill instructions?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Be specific and detailed—clear instructions produce better results than vague descriptions. Include examples showing the AI exactly how to handle different scenarios. Handle edge cases by anticipating unusual situations and providing guidance. Test thoroughly with various inputs before publishing. Iterate based on feedback from users to improve over time.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I publish my skill?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Click "Publish" in the Skill Composer. Choose public (visible to everyone) or private (only you) visibility. Public skills undergo community review via ratings and reviews, building credibility. Write a compelling description, select appropriate categories, add relevant tags, and include clear usage examples to maximize visibility and adoption.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Can I keep skills private?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Yes! When publishing, choose private visibility. Private skills remain in your "My Skills" section for personal use. You can make them public later if you decide to share with the community. This allows you to develop, test, and refine skills before public release.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I get my skills rated highly?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              High-rated skills have clear instructions, comprehensive coverage, and reliable performance. Respond to reviews, update based on feedback, and iterate on improvements. Include multiple examples covering different use cases. Handle edge cases gracefully. Skills with positive reviews gain visibility through featured placements and category highlights.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What makes a successful skill?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Successful skills solve real problems with clear, actionable instructions. They are specific, well-documented, and thoroughly tested. Include multiple examples covering different use cases. Handle edge cases gracefully. Maintain and update based on user feedback. The best skills become go-to resources for specific tasks in the community.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/create"><a className="text-primary hover:underline">Start Creating →</a></Link>
        </div>
      </div>
    </div>
  );
}
