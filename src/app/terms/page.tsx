import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Use - FifthDraft',
  description: 'Terms of Use for FifthDraft AI-powered note-taking platform',
}

export default function TermsOfUse() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
        <p className="text-gray-600 mb-8">Last updated: January 18, 2026</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to FifthDraft. These Terms of Use ("Terms") govern your access to and use of the FifthDraft platform,
              including our website, applications, and services (collectively, the "Services"). By accessing or using our
              Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our Services.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To use our Services, you must:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Be at least 13 years of age (or the age of majority in your jurisdiction)</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Not be prohibited from using the Services under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration and Security</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">3.1 Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">3.2 Account Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these Terms or engage in any
              fraudulent, abusive, or illegal activity.
            </p>
          </section>

          {/* Subscription Plans and Billing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription Plans and Billing</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.1 Subscription Tiers</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We offer multiple subscription tiers:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Free:</strong> 30 minutes/month, Meeting Notes mode, 7-day transcript retention</li>
              <li><strong>Pro:</strong> 2000 minutes/month, Idea Studio with AI Research, lifetime retention ($149/year or $15/month)</li>
              <li><strong>Pro+:</strong> 4000 minutes/month, team collaboration, priority support ($299/year) - waitlist only</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.2 Payment and Billing</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Subscriptions are billed monthly or annually in advance</li>
              <li>All fees are non-refundable unless required by law</li>
              <li>You authorize us to charge your payment method for recurring fees</li>
              <li>Prices may change with 30 days' notice</li>
              <li>Unused minutes do not roll over to the next billing period</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.3 Cancellation and Refunds</h3>
            <p className="text-gray-700 leading-relaxed">
              You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period.
              No refunds will be provided for partial months or unused features.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use Policy</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.1 Permitted Uses</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may use our Services for lawful purposes, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Recording and transcribing meetings, interviews, and voice memos</li>
              <li>Creating notes and action items from audio content</li>
              <li>Brainstorming and organizing ideas</li>
              <li>Collaborating with team members (on applicable plans)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.2 Prohibited Activities</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may NOT:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Record conversations without consent where required by law</li>
              <li>Upload content that is illegal, harmful, threatening, abusive, or discriminatory</li>
              <li>Infringe intellectual property rights of others</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Use automated tools to access the Services (bots, scrapers, etc.)</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Resell, lease, or sublicense the Services</li>
              <li>Use the Services to compete with FifthDraft</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">6.1 Your Content</h3>
            <p className="text-gray-700 leading-relaxed">
              You retain all rights to the content you create using our Services, including your audio recordings,
              transcriptions, and notes. By using our Services, you grant us a limited license to process, store, and
              display your content solely to provide the Services to you.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">6.2 Our Platform</h3>
            <p className="text-gray-700 leading-relaxed">
              FifthDraft and its original content, features, and functionality are owned by FifthDraft and are protected
              by international copyright, trademark, and other intellectual property laws. You may not copy, modify,
              distribute, or create derivative works without our explicit permission.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">6.3 Feedback</h3>
            <p className="text-gray-700 leading-relaxed">
              If you provide feedback, suggestions, or ideas about our Services, we may use them without any obligation
              to compensate you.
            </p>
          </section>

          {/* AI Processing and Data Usage */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. AI Processing and Data Usage</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">7.1 AI Services</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use third-party AI services to process your content:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>OpenAI Whisper API for audio transcription</li>
              <li>Claude Haiku 4.5 API for text cleanup and action item extraction</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              By using our Services, you consent to this processing. We ensure our AI providers do not use your data to
              train their models.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">7.2 Audio Recording Consent</h3>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for obtaining all necessary consents before recording any conversation or audio content.
              Recording laws vary by jurisdiction, and you must comply with all applicable laws.
            </p>
          </section>

          {/* Data Retention and Deletion */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention and Deletion</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Audio recordings are automatically deleted after 48 hours</li>
              <li>Transcriptions and notes are retained while your account is active</li>
              <li>You can manually delete any content at any time</li>
              <li>Upon account termination, your data will be deleted within 30 days</li>
              <li>Backup data may be retained for up to 90 days</li>
            </ul>
          </section>

          {/* Privacy and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy and Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our{' '}
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your information. While we implement industry-standard security
              measures, no system is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Services and Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Services may contain links to third-party websites or integrate with third-party services. We are not
              responsible for the content, privacy policies, or practices of any third-party services. Your use of
              third-party services is at your own risk.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimers and Warranties</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">11.1 Service Availability</h3>
            <p className="text-gray-700 leading-relaxed">
              The Services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind. We do not guarantee
              that the Services will be uninterrupted, error-free, or secure.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">11.2 Accuracy</h3>
            <p className="text-gray-700 leading-relaxed">
              While we strive for accuracy, AI-generated transcriptions and notes may contain errors. You are responsible
              for reviewing and verifying the accuracy of all generated content.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">11.3 No Professional Advice</h3>
            <p className="text-gray-700 leading-relaxed">
              Our Services are for informational purposes only and do not constitute professional, legal, financial, or
              medical advice.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability is limited to the amount you paid us in the 12 months preceding the claim</li>
              <li>We are not responsible for loss of data, profits, revenue, or business opportunities</li>
              <li>These limitations apply even if we were advised of the possibility of such damages</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Some jurisdictions do not allow certain limitations, so these may not apply to you.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless FifthDraft, its officers, directors, employees, and agents from
              any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Your use of the Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your content or recordings</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">14.1 Informal Resolution</h3>
            <p className="text-gray-700 leading-relaxed">
              If you have a dispute with us, please contact us at support@fifthdraft.com to seek an informal resolution
              before pursuing formal legal action.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">14.2 Arbitration</h3>
            <p className="text-gray-700 leading-relaxed">
              Any disputes that cannot be resolved informally will be settled through binding arbitration in accordance
              with the rules of the American Arbitration Association. You waive your right to a jury trial and class action.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">14.3 Governing Law</h3>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms at any time. If we make material changes, we will notify you by email or through
              the Services at least 30 days before the changes take effect. Your continued use of the Services after
              changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Termination</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">16.1 By You</h3>
            <p className="text-gray-700 leading-relaxed">
              You may terminate your account at any time through your account settings or by contacting support.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">16.2 By Us</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may suspend or terminate your access immediately if:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You violate these Terms</li>
              <li>Your account is involved in fraudulent or illegal activity</li>
              <li>Required by law or regulatory requirements</li>
              <li>We cease operating the Services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">16.3 Effect of Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, your right to use the Services ceases immediately. We will delete your data in accordance
              with our retention policy. Provisions that should survive termination (payment obligations, intellectual
              property, disclaimers, limitations of liability) will continue to apply.
            </p>
          </section>

          {/* General Provisions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. General Provisions</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">17.1 Entire Agreement</h3>
            <p className="text-gray-700 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and FifthDraft.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">17.2 Severability</h3>
            <p className="text-gray-700 leading-relaxed">
              If any provision is found to be unenforceable, the remaining provisions will remain in effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">17.3 No Waiver</h3>
            <p className="text-gray-700 leading-relaxed">
              Our failure to enforce any right or provision does not constitute a waiver of that right.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">17.4 Assignment</h3>
            <p className="text-gray-700 leading-relaxed">
              You may not assign these Terms without our written consent. We may assign our rights and obligations to
              any party at any time.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">17.5 Force Majeure</h3>
            <p className="text-gray-700 leading-relaxed">
              We are not liable for any failure or delay in performance due to circumstances beyond our reasonable control.
            </p>
          </section>


          {/* Acknowledgment */}
          <section className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-indigo-900 mb-3">Acknowledgment</h2>
            <p className="text-indigo-800 leading-relaxed">
              BY USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF USE.
            </p>
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
