'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { ChevronDown, ChevronUp, Search, Mail, MessageCircle, FileText, Mic, Sparkles, Download, CreditCard, Shield, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I start recording?',
    answer: 'After logging in, go to your Dashboard and click on either "Meeting Notes" or "Idea Studio" mode. Then click the microphone button to start recording. Make sure to allow microphone access when prompted by your browser.'
  },
  {
    category: 'Getting Started',
    question: 'What\'s the difference between Meeting Notes and Idea Studio?',
    answer: 'Meeting Notes mode is optimized for capturing meetings, calls, and discussions. It extracts action items, decisions, and key points. Idea Studio mode is designed for brainstorming - it helps expand your ideas, find connections, and suggests research directions.'
  },
  {
    category: 'Getting Started',
    question: 'How long does processing take?',
    answer: 'Processing typically takes 1-2 minutes depending on the length of your recording. You\'ll see a progress indicator while your audio is being transcribed and analyzed.'
  },
  {
    category: 'Getting Started',
    question: 'Can I upload existing audio files?',
    answer: 'Yes! Pro users can upload audio files (MP3, WAV, M4A, etc.) up to 120MB. Click the upload button on the recording page to select a file from your device.'
  },

  // Recording & Audio
  {
    category: 'Recording & Audio',
    question: 'What audio formats are supported?',
    answer: 'We support most common audio formats including MP3, WAV, M4A, WEBM, OGG, and FLAC. For best results, we recommend recording at 16kHz or higher sample rate.'
  },
  {
    category: 'Recording & Audio',
    question: 'Can I record system audio (Zoom, Teams, etc.)?',
    answer: 'Yes! Pro users can capture system audio to record virtual meetings. Click "System Audio" on the recording page. Note: This feature requires Chrome or Edge browser and works best on desktop.'
  },
  {
    category: 'Recording & Audio',
    question: 'Why isn\'t my microphone working?',
    answer: 'First, check that you\'ve allowed microphone access in your browser. Look for a microphone icon in your browser\'s address bar. If blocked, click it to allow access. Also ensure no other application is using the microphone. Try refreshing the page after granting permission.'
  },
  {
    category: 'Recording & Audio',
    question: 'Is there a recording time limit?',
    answer: 'Free users can record up to 30 minutes total per month. Pro users get 2000 minutes per month. Individual recordings can be up to 2 hours long for Pro users.'
  },

  // Idea Studio (Pro)
  {
    category: 'Idea Studio',
    question: 'What is AI Research Assistant?',
    answer: 'AI Research Assistant searches the web for relevant information related to your brainstorming session. It provides cited sources and helps validate or expand on your ideas with real-world data.'
  },
  {
    category: 'Idea Studio',
    question: 'What is Project Brief Generator?',
    answer: 'Project Brief Generator transforms your brainstorming session into a structured project plan. It includes objectives, scope, timeline suggestions, resource requirements, and potential risks.'
  },
  {
    category: 'Idea Studio',
    question: 'How does Mind Map work?',
    answer: 'Mind Map creates a visual representation of your ideas showing how concepts connect to each other. It\'s great for seeing the big picture and identifying relationships between different thoughts.'
  },

  // Export & Sharing
  {
    category: 'Export & Sharing',
    question: 'What export formats are available?',
    answer: 'Free users can export to Markdown (.md). Pro users can also export to PDF and DOCX (Word) formats. All exports include your notes, action items, and any generated content.'
  },
  {
    category: 'Export & Sharing',
    question: 'How do I export my notes?',
    answer: 'Open any note and click the "Export" button in the top right. Select your preferred format (Markdown, PDF, or DOCX) and the file will download automatically.'
  },
  {
    category: 'Export & Sharing',
    question: 'Can I share notes with others?',
    answer: 'Currently, you can share notes by exporting them and sending the file. Team sharing features are coming soon with Pro+ tier.'
  },

  // Billing & Subscription
  {
    category: 'Billing & Subscription',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe. Your payment information is securely processed and we never store your full card details.'
  },
  {
    category: 'Billing & Subscription',
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime from Settings > Manage Subscription. Your Pro features will remain active until the end of your current billing period. No refunds are provided for partial months.'
  },
  {
    category: 'Billing & Subscription',
    question: 'Do unused minutes roll over?',
    answer: 'No, minutes reset at the start of each billing cycle. Free users get 30 minutes/month, Pro users get 2000 minutes/month.'
  },
  {
    category: 'Billing & Subscription',
    question: 'What happens if I exceed my minutes limit?',
    answer: 'If you reach your monthly limit, you won\'t be able to create new recordings until your next billing cycle. Your existing notes remain accessible. Consider upgrading to Pro for more minutes.'
  },

  // Privacy & Security
  {
    category: 'Privacy & Security',
    question: 'How is my data protected?',
    answer: 'We use industry-standard encryption for all data in transit and at rest. Your recordings are processed securely and audio files are automatically deleted after 48 hours. We use Supabase for secure data storage with row-level security.'
  },
  {
    category: 'Privacy & Security',
    question: 'Who can access my recordings?',
    answer: 'Only you can access your recordings and notes. Our AI processing partners (OpenAI, Anthropic) process your content but do not store or use it for training. See our Privacy Policy for details.'
  },
  {
    category: 'Privacy & Security',
    question: 'How long is my data retained?',
    answer: 'Audio recordings are deleted after 48 hours. Transcriptions and notes are kept for 7 days for free users, or indefinitely for Pro users. You can manually delete any content at any time.'
  },
  {
    category: 'Privacy & Security',
    question: 'Can I delete my account and all data?',
    answer: 'Yes, you can delete your account from Settings > Danger Zone. This permanently removes all your recordings, notes, and personal data within 30 days.'
  },

  // Troubleshooting
  {
    category: 'Troubleshooting',
    question: 'My transcription seems inaccurate',
    answer: 'Transcription accuracy depends on audio quality. For best results: use a good microphone, minimize background noise, speak clearly, and ensure a stable internet connection. Heavy accents or technical jargon may require manual review.'
  },
  {
    category: 'Troubleshooting',
    question: 'The page isn\'t loading properly',
    answer: 'Try these steps: 1) Clear your browser cache, 2) Disable browser extensions, 3) Try a different browser (Chrome or Edge recommended), 4) Check your internet connection. If issues persist, contact support.'
  },
  {
    category: 'Troubleshooting',
    question: 'I forgot my password',
    answer: 'Click "Forgot your password?" on the login page. Enter your email address and we\'ll send you a reset link. The link expires in 1 hour for security.'
  },
]

const categories = [
  { id: 'all', name: 'All Questions', icon: HelpCircle },
  { id: 'Getting Started', name: 'Getting Started', icon: Mic },
  { id: 'Recording & Audio', name: 'Recording & Audio', icon: Mic },
  { id: 'Idea Studio', name: 'Idea Studio', icon: Sparkles },
  { id: 'Export & Sharing', name: 'Export & Sharing', icon: Download },
  { id: 'Billing & Subscription', name: 'Billing', icon: CreditCard },
  { id: 'Privacy & Security', name: 'Privacy & Security', icon: Shield },
  { id: 'Troubleshooting', name: 'Troubleshooting', icon: FileText },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo href="/" size="md" />
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-indigo-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <p className="text-indigo-100 mb-8">Search our help center or browse categories below</p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your search or browse all categories.</p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 pr-4">
                        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1 block">
                          {faq.category}
                        </span>
                        <span className="font-medium text-gray-900">{faq.question}</span>
                      </div>
                      {expandedItems.has(index) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedItems.has(index) && (
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
              <p className="text-gray-600">Our support team is here to assist you</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a
                href="mailto:support@fifthdraft.com"
                className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Support</h3>
                  <p className="text-sm text-gray-600">support@fifthdraft.com</p>
                </div>
              </a>

              <Link
                href="/pricing"
                className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Plans</h3>
                  <p className="text-sm text-gray-600">Compare features & pricing</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Link
            href="/terms"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <FileText className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Terms of Service</h3>
            <p className="text-sm text-gray-600">Read our terms and conditions</p>
          </Link>

          <Link
            href="/privacy"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <Shield className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Privacy Policy</h3>
            <p className="text-sm text-gray-600">How we protect your data</p>
          </Link>

          <Link
            href="/dashboard"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <Mic className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Start Recording</h3>
            <p className="text-sm text-gray-600">Go to your dashboard</p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <Link href="/pricing" className="hover:text-indigo-600">Pricing</Link>
            <Link href="/privacy" className="hover:text-indigo-600">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-600">Terms</Link>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            © {new Date().getFullYear()} FifthDraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
