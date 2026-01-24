import { Link } from 'wouter';

export function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: January 24, 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Agent Skills Marketplace ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our website at agentskills.cv.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-3">2.1 Account Information</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you sign in with Google, we collect:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Your name</li>
            <li>Email address</li>
            <li>Profile picture URL</li>
            <li>Google account ID</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">2.2 Usage Data</h3>
          <p className="text-muted-foreground leading-relaxed">
            We automatically collect certain information when you visit our website, including:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
            <li>Device information</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">2.3 User Activity</h3>
          <p className="text-muted-foreground leading-relaxed">
            We track your interactions with the platform, such as:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Skills you favorite or download</li>
            <li>Ratings and reviews you submit</li>
            <li>Search queries</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Provide and maintain our services</li>
            <li>Authenticate your account</li>
            <li>Personalize your experience</li>
            <li>Track favorites and preferences</li>
            <li>Improve our platform</li>
            <li>Analyze usage patterns via Google Analytics</li>
            <li>Communicate important updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not sell your personal data. We may share information with:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>Service Providers:</strong> Google (authentication, analytics), Cloudflare (hosting, security)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use cookies and similar technologies for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>Essential Cookies:</strong> Session management and authentication</li>
            <li><strong>Analytics Cookies:</strong> Google Analytics to understand usage</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            You can disable cookies in your browser settings, but some features may not work properly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate security measures including HTTPS encryption, secure authentication via OAuth 2.0, and regular security reviews. However, no internet transmission is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Depending on your location, you may have the right to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Object to data processing</li>
            <li>Data portability</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            To exercise these rights, contact us at privacy@agentskills.cv.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your account at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our service is not intended for children under 13. We do not knowingly collect data from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this policy periodically. We will notify you of significant changes by posting the new policy on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this privacy policy, please contact us at privacy@agentskills.cv.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t">
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
        <span className="mx-4 text-muted-foreground">|</span>
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Use
        </Link>
      </div>
    </div>
  );
}
