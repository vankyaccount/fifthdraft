import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - FifthDraft',
  description: 'Privacy Policy for FifthDraft AI-powered note-taking platform',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 18, 2026</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to FifthDraft ("we," "our," or "us"). We are committed to protecting your privacy and personal data.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
              AI-powered note-taking platform and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">2.1 Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We collect information that you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Account information (name, email address, password)</li>
              <li>Profile information and preferences</li>
              <li>Payment and billing information (processed securely through Stripe)</li>
              <li>Subscription and usage data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">2.2 Content You Create</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Audio recordings and voice memos</li>
              <li>Transcriptions and notes</li>
              <li>Action items and decisions</li>
              <li>Chat conversations with AI</li>
              <li>Custom templates and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">2.3 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (features used, session duration)</li>
              <li>Log data (IP address, access times, pages viewed)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your audio recordings and generate transcriptions</li>
              <li>Use AI (OpenAI Whisper and Claude Haiku 4.5) to clean and format your notes</li>
              <li>Extract action items and insights from your content</li>
              <li>Manage your account and subscription</li>
              <li>Process payments and prevent fraud</li>
              <li>Send you service updates, security alerts, and support messages</li>
              <li>Respond to your requests and customer support inquiries</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* AI Processing and Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. AI Processing and Third-Party Services</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.1 AI Service Providers</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Your audio recordings and transcriptions are processed by:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>OpenAI Whisper API:</strong> For audio-to-text transcription</li>
              <li><strong>Claude Haiku 4.5 API:</strong> For text cleanup, formatting, and action item extraction</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We have agreements with these providers to ensure they handle your data securely and do not use it to train
              their models without your consent.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.2 Other Third-Party Services</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Stripe:</strong> Payment processing (we never store your full credit card information)</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Storage and Security</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.1 Data Storage</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Your data is stored on secure servers provided by Supabase</li>
              <li>Audio recordings are automatically deleted after 48 hours</li>
              <li>Transcriptions and notes are retained as long as you maintain your account</li>
              <li>We implement industry-standard encryption for data in transit and at rest</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.2 Security Measures</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Row-level security policies to protect your data</li>
              <li>Encrypted connections (HTTPS/TLS)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>

          {/* Data Sharing and Disclosure */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>With your consent:</strong> When you explicitly authorize us to share information</li>
              <li><strong>Service providers:</strong> With third parties who help us operate our platform (as described above)</li>
              <li><strong>Team members:</strong> If you're on a Team or Enterprise plan, with other members of your organization</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          {/* Your Rights and Choices */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your notes and data in portable formats</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data portability:</strong> Transfer your data to another service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise these rights, please contact us at privacy@fifthdraft.com
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Audio recordings: Automatically deleted after 48 hours</li>
              <li>Transcriptions and notes: Retained while your account is active</li>
              <li>Account information: Deleted within 30 days of account closure</li>
              <li>Backup data: Removed from backups within 90 days</li>
              <li>Legal or compliance data: Retained as required by law</li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve platform performance</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for users under the age of 13. We do not knowingly collect personal information
              from children under 13. If you become aware that a child has provided us with personal information, please
              contact us immediately.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence.
              We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
              the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our services
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>


          {/* GDPR and CCPA Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. GDPR and CCPA Rights</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">13.1 European Users (GDPR)</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you are located in the European Economic Area, you have additional rights under GDPR:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Right to object to processing of your personal data</li>
              <li>Right to restrict processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
              <li>Right to withdraw consent at any time</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">13.2 California Users (CCPA)</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you are a California resident, you have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Know what personal information we collect and how we use it</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of the sale of personal information (we do not sell your data)</li>
              <li>Non-discrimination for exercising your rights</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-indigo-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-indigo-600">
              Terms of Use
            </Link>
            <Link href="/" className="hover:text-indigo-600">
              Home
            </Link>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            © 2026 FifthDraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
