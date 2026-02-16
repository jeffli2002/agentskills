import { Link } from 'wouter';

export default function HowToCreateAgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">How to Create Agent Skills</h1>

        <div className="space-y-6 mt-8">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I create an Agent Skill?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              You can create agent skills using our Skill Composer—an AI-powered tool that generates well-structured SKILL.md files from natural language. Simply describe what you want your skill to do, answer clarifying questions about scope and specifics, and the AI generates a complete, professional SKILL.md file based on proven patterns from top-rated community skills. This approach ensures your skill follows best practices from the start.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What is the SKILL.md format?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              SKILL.md is a simple markdown format that defines your AI agent's capabilities. A well-crafted SKILL.md includes: name (skill identifier), description (what it does), triggers (keywords that activate the skill), instructions (detailed steps), and examples (sample interactions). This open standard is supported by major AI platforms including Claude Code, OpenAI Codex, Cursor, and OpenClaw, ensuring your skills work across different agents.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How does the Skill Composer work?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              The Skill Composer analyzes proven, top-rated skills from our marketplace to generate yours. It learns what works—effective descriptions, logical structures, useful examples—and applies those learnings to your specific needs. You describe your idea in plain language, the AI asks clarifying questions to understand nuances, then generates a complete SKILL.md file. You can review, edit, and refine before publishing.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I write effective skill instructions?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Write clear, specific instructions that leave no room for ambiguity. Break down complex tasks into step-by-step procedures. Include edge cases and common pitfalls. Add concrete examples showing expected inputs and outputs. The more precise your guidance, the better your AI agent will perform the task. Review top-rated skills in the marketplace to learn effective patterns and structures.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I publish my skill to the marketplace?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Once your skill is ready, click "Publish" in the Skill Composer. Choose between public (visible to everyone) or private (only visible to you) visibility. Public skills undergo community review through ratings and reviews, building credibility. To maximize visibility, write a compelling description, select appropriate categories, add relevant tags, and include clear usage examples.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>Can I keep my skills private?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Yes! When publishing, you can choose to publish publicly (visible to everyone) or keep it private (only visible to you in My Skills). Private skills remain accessible in your personal collection for your own use. You can make private skills public later if you decide to share them with the community. This flexibility allows you to develop and test skills before public release.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>How do I test my skill before publishing?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Install your skill locally and test it with various inputs and scenarios. Try edge cases and unusual situations. Have colleagues try it without context to see if instructions are clear. Start with a private publish, use it in real projects, gather feedback, then make it public when confident. Iterating based on real usage leads to better skills.
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: '#1F2328', border: '1px solid #353B44' }}>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#F4C542' }}>What makes a successful Agent Skill?</h2>
            <p className="text-muted-foreground" style={{ color: '#858993' }}>
              Successful skills are specific, well-documented, and thoroughly tested. They solve real problems with clear, actionable instructions. Include multiple examples covering different use cases. Handle edge cases gracefully. Maintain and update based on user feedback. Skills with high ratings typically have comprehensive instructions, relevant examples, and responsive creators who iterate on improvements.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/create"><a className="text-primary hover:underline">Create Your Skill →</a></Link>
        </div>
      </div>
    </div>
  );
}
