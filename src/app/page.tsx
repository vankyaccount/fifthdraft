'use client'

import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Footer from '@/components/layout/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo href="/" size="md" />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Thinking into{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Actionable Insights</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              FifthDraft is your AI-powered thinking companion featuring Idea Studio—the most powerful brainstorming-to-insight transformation platform. Record your ideas from anywhere, and let AI expand them into structured plans, research paths, and breakthrough thinking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Try Idea Studio Free
              </Link>
              <Link
                href="/pricing"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                View Plans & Pro+
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Free tier: 30 minutes/month - No credit card required
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent font-semibold">500+ professionals transforming their thinking with Idea Studio</span>
            </div>
          </div>

          {/* Two Powerful Modes Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Two Powerful Modes</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Transform ideas with Idea Studio or take professional meeting notes. Capture your thinking anywhere, anytime.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">

              {/* Idea Studio Mode - Moved to First Position */}
              <div id="idea-studio" className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-8 rounded-xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-shadow relative overflow-hidden md:col-span-1">
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                    The Differentiator
                  </span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-3">Idea Studio</h3>
                <p className="text-gray-700 mb-4">
                  <strong>The game-changer:</strong> Transform raw brainstorming into organized, actionable insights with AI that truly understands your thinking.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Core ideas extraction & connections</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Expansion opportunities</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> AI Research Assistant</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Project Brief Generator</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Mind Map visualizations</li>
                </ul>
                <Link
                  href="/samples/idea-studio"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  See Idea Studio in action <span className="ml-1">→</span>
                </Link>
              </div>

              {/* Meeting Notes Mode */}
              <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-indigo-200 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Professional Meeting Notes</h3>
                <p className="text-gray-600 mb-4">
                  The essential foundation: structured notes with action items, decisions, and key points. Available in all tiers.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center"><span className="text-indigo-500 mr-2">✓</span> Automatic transcription</li>
                  <li className="flex items-center"><span className="text-indigo-500 mr-2">✓</span> Action items extraction</li>
                  <li className="flex items-center"><span className="text-indigo-500 mr-2">✓</span> Key decisions highlighted</li>
                  <li className="flex items-center"><span className="text-indigo-500 mr-2">✓</span> Clean, professional formatting</li>
                </ul>
                <Link
                  href="/samples/meeting-notes"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  See sample <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mt-24">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">What Our Users Say</h3>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Hear from professionals who transformed their workflow with FifthDraft
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "FifthDraft saves me 2 hours every week on meeting notes. The action items extraction is spot-on, and I never miss a follow-up anymore."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    SM
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">Sarah Martinez</p>
                    <p className="text-sm text-gray-500">Product Manager</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Idea Studio is a game-changer for brainstorming. I ramble my thoughts, and it organizes everything into a coherent project plan. Amazing!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                    JC
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">James Chen</p>
                    <p className="text-sm text-gray-500">Startup Founder</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "As a consultant, I'm in back-to-back meetings all day. FifthDraft keeps me organized and ensures I deliver on every commitment."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    EP
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">Emily Patel</p>
                    <p className="text-sm text-gray-500">Business Consultant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Idea Studio Deep Dive */}
          <div className="mt-24 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-2xl p-12 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-flex items-center px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                  Introducing Idea Studio
                </span>
                <h3 className="text-4xl font-bold mb-4">Your AI-Powered Brainstorming Partner</h3>
                <p className="text-purple-200 text-lg max-w-2xl mx-auto">
                  Idea Studio transforms how you develop ideas. Record your thoughts freely, and let AI help you expand, connect, and execute.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-3">&#128161;</div>
                  <h4 className="text-lg font-semibold mb-2">Core Ideas Extraction</h4>
                  <p className="text-purple-200 text-sm">AI identifies your main concepts and shows how they connect to each other.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-3">&#128640;</div>
                  <h4 className="text-lg font-semibold mb-2">Expansion Opportunities</h4>
                  <p className="text-purple-200 text-sm">Discover new directions and angles to explore for each of your ideas.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-3">&#128269;</div>
                  <h4 className="text-lg font-semibold mb-2">Research Questions</h4>
                  <p className="text-purple-200 text-sm">Identify what needs investigation to move your ideas forward.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-3">&#127757;</div>
                  <h4 className="text-lg font-semibold mb-2">AI Research Assistant</h4>
                  <p className="text-purple-200 text-sm">Automatically search the web for relevant information with cited sources.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-3">&#128203;</div>
                  <h4 className="text-lg font-semibold mb-2">Project Brief Generator</h4>
                  <p className="text-purple-200 text-sm">Transform brainstorms into structured project plans with timelines and resources.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-3">&#128506;</div>
                  <h4 className="text-lg font-semibold mb-2">Mind Map Visualization</h4>
                  <p className="text-purple-200 text-sm">See your ideas visually mapped with connections and relationships.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Cleanup</h3>
              <p className="text-gray-600">
                Our "FifthDraft Pass" removes filler words, fixes grammar, and organizes your thoughts into professional prose.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Anywhere</h3>
              <p className="text-gray-600">
                Export your notes as Markdown, PDF, or DOCX. Copy to clipboard or download for use in any application.
              </p>
            </div>
          </div>

          {/* Pricing Teaser - Pro+ Focus */}
          <div className="mt-24 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
              Team Collaboration Coming
            </div>
            <h3 className="text-3xl font-bold mb-4">Transform Your Thinking with Idea Studio</h3>
            <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
              Start free with 30 minutes/month. Unlock Idea Studio with Pro (2000 min/month, $149/year).
              <span className="block mt-2">Join the Pro+ waitlist for team collaboration features coming soon.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors shadow-lg font-semibold"
              >
                Try Idea Studio Free
              </Link>
              <Link
                href="/pricing"
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/10 transition-colors"
              >
                View Pro & Pro+ Plans
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
