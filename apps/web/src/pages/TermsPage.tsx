import { Link } from 'wouter';

export function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
      <p className="text-muted-foreground mb-8">Last updated: January 25, 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using Agent Skills Marketplace ("the Service") at agentskills.cv, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Agent Skills Marketplace is a platform for discovering, downloading, creating, and sharing AI agent skills for tools like Claude Code and other AI coding assistants. The Service provides:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
            <li>A directory of community-curated AI agent skills</li>
            <li>AI Skill Composer for creating custom skills using natural language</li>
            <li>Skill download and installation instructions</li>
            <li>User ratings and favorites</li>
            <li>Personal skill management (My Skills)</li>
            <li>Public and private skill publishing options</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <h3 className="text-xl font-medium mb-3">3.1 Registration</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You may browse the Service without an account. To access certain features (favorites, ratings, AI Skill Composer, My Skills), you must sign in using Google authentication.
          </p>

          <h3 className="text-xl font-medium mb-3">3.2 Account Responsibility</h3>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the security of your account and all activities under your account, including skills you create and publish. Notify us immediately of any unauthorized use.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Use the Service for any illegal purpose</li>
            <li>Submit false or misleading information</li>
            <li>Upload or create malicious skills designed to harm users</li>
            <li>Use the AI Skill Composer to generate harmful, offensive, or illegal content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Scrape or collect data without permission</li>
            <li>Harass or abuse other users</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Publish skills that contain malware, exploits, or security vulnerabilities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Content and Skills</h2>
          <h3 className="text-xl font-medium mb-3">5.1 Third-Party Content</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Skills listed on our platform may be sourced from public GitHub repositories and other third-party sources. We do not own or control this content. Each skill is subject to its own license terms as specified by its creator.
          </p>

          <h3 className="text-xl font-medium mb-3">5.2 User-Created Skills</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you create skills using the AI Skill Composer, you retain ownership of the content you create. By publishing a skill publicly, you grant other users the right to download and use your skill. You may choose to keep skills private for personal use only.
          </p>

          <h3 className="text-xl font-medium mb-3">5.3 AI-Generated Content</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Skills created through the AI Skill Composer are generated using AI models. You are responsible for reviewing and verifying any AI-generated content before publishing. We do not guarantee the accuracy, completeness, or fitness for purpose of AI-generated skills.
          </p>

          <h3 className="text-xl font-medium mb-3">5.4 No Warranty on Skills</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not guarantee that any skill will work as described, be free of bugs, or be safe to use. You use skills at your own risk. Always review skill code before installation.
          </p>

          <h3 className="text-xl font-medium mb-3">5.5 User-Generated Content</h3>
          <p className="text-muted-foreground leading-relaxed">
            By submitting ratings or other content, you grant us a non-exclusive, royalty-free license to use, display, and distribute that content on our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service's design, features, and original content are owned by Agent Skills Marketplace and protected by copyright and other intellectual property laws. Skills listed on the platform remain the property of their respective creators.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE OR ANY SKILLS DOWNLOADED THROUGH THE SERVICE.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to indemnify and hold harmless Agent Skills Marketplace from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may suspend or terminate your access to the Service at any time for any reason, including violation of these Terms. You may stop using the Service at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms. We will post the updated Terms with a new effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms, please contact us at legal@agentskills.cv.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t">
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
        <span className="mx-4 text-muted-foreground">|</span>
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
