import { Link } from 'wouter';

export default function HowToCreateAgentSkillsPage() {
  return (
    <div className="min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs"><a className="text-primary hover:underline mb-8 inline-block">← Back to Docs</a></Link>
        
        <h1 className="text-4xl font-bold mb-6">How to Create Agent Skills</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Learn how to create powerful AI agent skills using our Skill Composer and publish them to the marketplace.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Understanding SKILL.md Format</h2>
        <p className="text-muted-foreground mb-4">
          Every agent skill is defined by a SKILL.md file—a simple markdown document that tells your AI agent what it can do and how to do it. The format is intentionally simple yet powerful, allowing you to encapsulate expertise, automate workflows, and share knowledge with the community. A well-crafted SKILL.md includes clear descriptions, detailed instructions, examples, and best practices that help the AI understand when and how to apply the skill.
        </p>
        <p className="text-muted-foreground mb-4">
          The SKILL.md format has become an industry standard supported by major AI agent platforms including Claude Code, OpenAI Codex, Cursor, and OpenClaw. This means your skills are immediately usable across different AI assistants without modification. The format consists of structured sections: name, description, triggers (keywords that activate the skill), instructions (detailed steps), and examples (sample interactions).
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Using the Skill Composer</h2>
        <p className="text-muted-foreground mb-4">
          Our Skill Composer is an AI-powered tool that makes creating agent skills effortless. Instead of writing SKILL.md from scratch, you describe what you want your skill to do, and our AI generates a complete, well-structured skill file based on proven patterns from top-rated community skills. The composer analyzes what works—effective descriptions, logical structures, useful examples—and applies those learnings to your specific use case.
        </p>
        <p className="text-muted-foreground mb-4">
          To use the Skill Composer, click "Create with AI" on our platform. You'll describe your idea in plain language, for example: "A skill that helps review code for security vulnerabilities." The AI will ask clarifying questions to understand the scope and nuance of your skill. Based on your answers, it generates a complete SKILL.md file that you can review, edit, and refine before publishing.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Manual Skill Creation</h2>
        <p className="text-muted-foreground mb-4">
          For complete control, you can create agent skills manually. Start by creating a folder with your skill name, then add a SKILL.md file inside. The file should follow our standard template with sections for name, description, triggers, instructions, and examples. Pay attention to writing clear, specific instructions—the more precise your guidance, the better your AI agent will perform the task.
        </p>
        <p className="text-muted-foreground mb-4">
          When writing instructions, consider the different scenarios your skill might encounter. Include edge cases, common pitfalls, and best practices. Add concrete examples showing expected inputs and outputs. This helps the AI understand not just what to do, but how to do it well. Review top-rated skills in the marketplace to learn effective patterns.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Publishing Your Skill</h2>
        <p className="text-muted-foreground mb-4">
          Once your skill is ready, you can publish it to the marketplace for others to discover and use. During publishing, you can choose between public (visible to everyone) or private (only visible to you) visibility. Public skills undergo community review through ratings and reviews, which helps build credibility and attract users. Private skills remain in your "My Skills" section for personal use or future public release.
        </p>
        <p className="text-muted-foreground mb-4">
          To maximize your skill's visibility and adoption, write a compelling description, select appropriate categories, add relevant tags, and include clear usage examples. Engage with user feedback—respond to reviews, update your skill based on suggestions, and iterate on improvements. Skills with high ratings appear in featured sections and category highlights.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Best Practices</h2>
        <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-3">
          <li><strong>Be Specific:</strong> Clear, detailed instructions produce better results than vague descriptions</li>
          <li><strong>Include Examples:</strong> Show the AI exactly how to handle different scenarios</li>
          <li><strong>Handle Edge Cases:</strong> Anticipate unusual situations and provide guidance</li>
          <li><strong>Test Thoroughly:</strong> Try your skill with various inputs before publishing</li>
          <li><strong>Iterate Based on Feedback:</strong> Update your skill based on user reviews and suggestions</li>
        </ul>

        <div className="mt-12">
          <Link href="/create"><a className="text-primary hover:underline">Create Your Skill →</a></Link>
        </div>
      </div>
    </div>
  );
}
