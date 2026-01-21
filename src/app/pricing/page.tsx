'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'

interface Profile {
  subscription_tier: string
  stripe_customer_id?: string
}

interface Feature {
  text: string
  included: boolean
  isBold?: boolean
  isIndented?: boolean
}

export default function PricingPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistForm, setWaitlistForm] = useState({
    feedback: '',
    use_case: '',
    company: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      // Allow non-logged in users to view pricing
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier, stripe_customer_id')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  const handleCheckout = async (priceType: 'pro_monthly' | 'pro_yearly') => {
    setCheckoutLoading(priceType)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error: any) {
      alert(error.message || 'Failed to start checkout')
      setCheckoutLoading(null)
    }
  }

  const handleBillingPortal = async () => {
    setBillingLoading(true)
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      window.location.href = data.url
    } catch (error: any) {
      alert(error.message || 'Failed to open billing portal')
      setBillingLoading(false)
    }
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWaitlistLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please sign in to join the waitlist')
        return
      }

      const response = await fetch('/api/pro-plus-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          feedback: waitlistForm.feedback,
          use_case: waitlistForm.use_case,
          company: waitlistForm.company,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      alert('Successfully joined the Pro+ waitlist! Check your email for updates.')
      setShowWaitlistModal(false)
      setWaitlistForm({ feedback: '', use_case: '', company: '' })
    } catch (error: any) {
      alert(error.message || 'Failed to join waitlist')
    } finally {
      setWaitlistLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const currentTier = profile?.subscription_tier || 'free'

  const tiers: Array<{
    name: string
    price: string
    period: string
    monthlyPrice?: string
    description: string
    features: Feature[]
    highlighted: boolean
  }> = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out FifthDraft',
      features: [
        { text: '30 minutes/month', included: true },
        { text: 'Meeting Notes mode', included: true },
        { text: 'Browser recording only', included: true },
        { text: '7-day transcript retention', included: true },
        { text: 'AI cleanup & formatting (Claude Haiku 4.5)', included: true },
        { text: 'Markdown export', included: true },
        { text: 'Idea Studio features', included: false },
        { text: 'System audio capture', included: false },
        { text: 'File uploads', included: false },
        { text: 'Lifetime transcripts', included: false },
        { text: 'PDF & DOCX export', included: false },
      ],
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$149',
      period: 'per year',
      monthlyPrice: '$15',
      description: 'For professionals and creators',
      features: [
        { text: '2000 minutes/month (66x more!)', included: true },
        { text: 'Meeting Notes - structured notes & action items', included: true },
        { text: 'Idea Studio - AI-powered brainstorming:', included: true, isBold: true },
        { text: '  • Core ideas extraction & connections', included: true, isIndented: true },
        { text: '  • Expansion opportunities & research questions', included: true, isIndented: true },
        { text: '  • AI Research Assistant (web search)', included: true, isIndented: true },
        { text: '  • Project Brief Generator', included: true, isIndented: true },
        { text: '  • Mind Map visualizations', included: true, isIndented: true },
        { text: '  • Idea Evolution Tracking', included: true, isIndented: true },
        { text: 'Browser recording + System audio capture', included: true },
        { text: 'Upload audio files (up to 120MB)', included: true },
        { text: 'Lifetime transcript retention', included: true },
        { text: 'AI processing (Claude Haiku 4.5)', included: true },
        { text: 'Export to all formats (MD, PDF, DOCX)', included: true },
      ],
      highlighted: true,
    },
    {
      name: 'Pro+',
      price: '$299',
      period: 'per year',
      monthlyPrice: '$30',
      description: 'Team-powered thinking (early access - join waitlist)',
      features: [
        { text: '4000 minutes/month (133x more!)', included: true },
        { text: 'Everything in Pro +', included: true, isBold: true },
        { text: 'Team collaboration:', included: true, isBold: true },
        { text: '  • Shared workspaces & team notes', included: true, isIndented: true },
        { text: '  • Real-time collaboration', included: true, isIndented: true },
        { text: '  • Team member permissions', included: true, isIndented: true },
        { text: 'Upload audio files (up to 240MB) - 4 hour recordings', included: true },
        { text: 'Early access to new features', included: true },
        { text: 'Priority support - faster response times', included: true },
        { text: 'Custom integrations:', included: true, isBold: true },
        { text: '  • API access & webhooks', included: true, isIndented: true },
        { text: '  • Custom export formats', included: true, isIndented: true },
        { text: 'Advanced analytics:', included: true, isBold: true },
        { text: '  • Usage insights & reports', included: true, isIndented: true },
        { text: '  • Team analytics dashboard', included: true, isIndented: true },
      ],
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo href={profile ? "/dashboard" : "/"} size="md" />
            </div>
            <div className="flex items-center gap-4">
              {profile ? (
                <Link
                  href="/dashboard"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Back to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/"
                    className="text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Home
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Flexible Pricing for Every Thinking Style
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Free tier to explore. Pro to unleash Idea Studio. Pro+ for team collaboration (coming soon). No credit card required to start.
          </p>
          {profile && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-50 rounded-full">
              <span className="text-sm text-indigo-700">
                Current plan: <span className="font-semibold capitalize">{currentTier}</span>
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-white rounded-lg shadow-sm p-8 flex flex-col ${
                tier.highlighted
                  ? 'ring-2 ring-indigo-600 relative'
                  : 'border border-neutral-200'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {tier.name === 'Pro+' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Coming Soon - Join Waitlist
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-2xl font-bold text-neutral-900">{tier.name}</h3>
                </div>
                <p className="text-sm text-neutral-600">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-neutral-900">{tier.price}</span>
                  {tier.period && (
                    <span className="ml-2 text-neutral-600">/{tier.period}</span>
                  )}
                </div>
                {tier.highlighted && tier.monthlyPrice && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-600 font-medium">Just $12.42/month billed annually</p>
                    <p className="text-sm text-neutral-600">or {tier.monthlyPrice}/month billed monthly</p>
                    <p className="text-xs text-neutral-500">Save $31 with annual billing</p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-start space-x-2 ${feature.isIndented ? 'ml-4' : ''}`}>
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <svg
                        className="w-5 h-5 text-neutral-300 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? 'text-neutral-700' : 'text-neutral-400'
                      } ${feature.isBold ? 'font-semibold' : ''}`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              {!profile ? (
                // Non-logged in users
                tier.name === 'Free' ? (
                  <Link
                    href="/signup"
                    className="w-full py-3 px-4 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center block"
                  >
                    Start Free Trial
                  </Link>
                ) : tier.name === 'Pro+' ? (
                  <Link
                    href="/signup"
                    className="w-full py-3 px-4 rounded-lg font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors text-center block"
                  >
                    Join Waitlist
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/signup"
                      className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors text-center block"
                    >
                      Get Pro Yearly - $149/year
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full py-2 px-4 rounded-lg font-medium border-2 border-neutral-300 text-neutral-700 hover:border-neutral-400 transition-colors text-center block"
                    >
                      Get Pro Monthly - $15/month
                    </Link>
                  </div>
                )
              ) : (
                // Logged in users
                tier.name === 'Free' ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-lg font-medium bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  >
                    {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
                  </button>
                ) : tier.name === 'Pro+' ? (
                  <button
                    onClick={() => setShowWaitlistModal(true)}
                    disabled={currentTier === 'pro_plus'}
                    className="w-full py-3 px-4 rounded-lg font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {currentTier === 'pro_plus' ? 'Current Plan' : 'Join Waitlist'}
                  </button>
                ) : currentTier === 'pro' || currentTier === 'pro_plus' ? (
                  <button
                    onClick={handleBillingPortal}
                    disabled={billingLoading}
                    className="w-full py-3 px-4 rounded-lg font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {billingLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                      </span>
                    ) : (
                      'Manage Subscription'
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleCheckout('pro_yearly')}
                      disabled={checkoutLoading !== null}
                      className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
                    >
                      {checkoutLoading === 'pro_yearly' ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </span>
                      ) : (
                        'Get Pro Yearly - $149/year'
                      )}
                    </button>
                    <button
                      onClick={() => handleCheckout('pro_monthly')}
                      disabled={checkoutLoading !== null}
                      className="w-full py-2 px-4 rounded-lg font-medium border-2 border-neutral-300 text-neutral-700 hover:border-neutral-400 transition-colors disabled:opacity-50"
                    >
                      {checkoutLoading === 'pro_monthly' ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </span>
                      ) : (
                        'Get Pro Monthly - $15/month'
                      )}
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-neutral-600 text-sm">
                Yes! You can upgrade to Pro anytime. Choose between $15/month (billed monthly) or $149/year (save $31). You can cancel anytime from your billing portal.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                What is Idea Studio?
              </h3>
              <p className="text-neutral-600 text-sm">
                Idea Studio is our premium brainstorming mode that helps you transform raw thoughts into organized, actionable insights using AI-powered features like research assistant, project brief generator, and mind maps.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-neutral-600 text-sm">
                We accept all major credit and debit cards via Stripe. Your payment information is securely handled by Stripe.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Do unused minutes roll over?
              </h3>
              <p className="text-neutral-600 text-sm">
                Minutes reset at the start of each billing cycle and do not roll over. Pro users get 2000 minutes per month.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-neutral-600 mb-4">
            Still have questions? We're here to help.
          </p>
          <Link
            href="mailto:support@fifthdraft.ai"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Contact Support
          </Link>
        </div>
      </main>

      {/* Pro+ Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Join Pro+ Waitlist
            </h2>
            <p className="text-neutral-600 mb-6">
              Tell us about your use case and we'll prioritize your invite.
            </p>

            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Use Case
                </label>
                <input
                  type="text"
                  placeholder="e.g., Team meetings, podcast production"
                  value={waitlistForm.use_case}
                  onChange={(e) =>
                    setWaitlistForm({ ...waitlistForm, use_case: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your company name"
                  value={waitlistForm.company}
                  onChange={(e) =>
                    setWaitlistForm({ ...waitlistForm, company: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Feedback
                </label>
                <textarea
                  placeholder="Any feedback or feature requests?"
                  value={waitlistForm.feedback}
                  onChange={(e) =>
                    setWaitlistForm({ ...waitlistForm, feedback: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWaitlistModal(false)}
                  className="flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:border-neutral-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={waitlistLoading}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {waitlistLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Joining...
                    </span>
                  ) : (
                    'Join Waitlist'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
