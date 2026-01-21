'use client'

import Link from 'next/link'
import { ArrowLeft, Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import Logo from '@/components/ui/Logo'

export default function MeetingNotesSample() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const content = document.getElementById('sample-content')?.innerText || ''
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try It Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sample Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-4">
              Sample Meeting Notes
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Product Roadmap Q1 Planning
            </h2>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>January 14, 2026</span>
              <span>•</span>
              <span>45 minutes</span>
              <span>•</span>
              <span>5 participants</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* Meeting Notes - Action Items Table (matching actual output) */}
          <div id="sample-content" className="bg-white rounded-lg shadow-sm p-6 mb-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Meeting Notes</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z"/>
                  </svg>
                  Jira
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm9.44-6.84c0 .795-.645 1.44-1.44 1.44H14c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.646-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v6.78z"/>
                  </svg>
                  Trello
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                    <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/>
                  </svg>
                  Linear
                </button>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      disabled
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      Finalize mobile app wireframes for v1.0
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Complete all core screens with simplified offline sync approach. Exclude advanced sync features (scheduled for v1.1). Incorporate beta tester feedback on navigation flow.</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Sarah Martinez</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">1/24/2026</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      high
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      disabled
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      Audit API endpoint performance - large dataset queries
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Profile database query bottlenecks identified in load testing. Document response times for datasets &gt;10K records. Prepare optimization recommendations including caching strategy and index updates.</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">James Chen</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">1/20/2026</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      high
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      disabled
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      Coordinate Q1 resource allocation with department heads
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Confirm 30% engineering bandwidth for performance optimization work. Remaining 70% split between mobile app and new features. Get sign-off from each team lead.</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Emily Patel</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">-</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      medium
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      disabled
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      Draft API v2 project kickoff plan
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Outline scope, milestones, and team assignments for February start. Target beta release Q2. Include backward compatibility requirements and migration guide outline.</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">James Chen</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">-</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      low
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      disabled
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      Update mobile launch timeline in project tracker
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Change target date from February 28 to March 15. Adjust dependent milestones for QA testing phase. Notify stakeholders of revised schedule.</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Emily Patel</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">-</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      medium
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Decisions Made */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Decisions Made</h2>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold mt-1">✓</span>
                <span className="text-gray-700">Mobile app launch moved to March 15 to allow for additional testing and QA</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold mt-1">✓</span>
                <span className="text-gray-700">Allocate 30% of engineering resources to performance optimization for next quarter</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold mt-1">✓</span>
                <span className="text-gray-700">API v2 development will begin in February with beta release targeted for Q2</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold mt-1">✓</span>
                <span className="text-gray-700">Simplify offline sync in v1.0, add advanced features in v1.1</span>
              </li>
            </ul>
          </div>

          {/* Open Questions & Follow-ups */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Open Questions & Follow-ups</h2>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-amber-600 font-bold mt-1">?</span>
                <span className="text-gray-700">What is the exact budget allocation for hiring contractors to support mobile development?</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-600 font-bold mt-1">?</span>
                <span className="text-gray-700">Should we prioritize iOS or Android first, or launch both simultaneously?</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-600 font-bold mt-1">?</span>
                <span className="text-gray-700">Who will lead the database optimization sprint - internal team or external consultant?</span>
              </li>
            </ul>
          </div>

          {/* Full Transcript */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Transcript</h2>
            <div className="prose max-w-none">
              <p className="mb-4 text-gray-700 leading-relaxed">
                Alright team, let's get started with our Q1 planning meeting. I want to focus today on three main areas: the mobile app launch, platform performance, and our API roadmap. Sarah, why don't you start us off with an update on the mobile app?
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                Thanks Emily. So we've made great progress on the mobile app wireframes. The design team has finished all the core screens and we've been getting positive feedback from beta testers. However, I do want to flag one concern. The offline sync functionality is turning out to be more complex than we initially scoped. It might make sense to simplify this for v1.0 and add the advanced features in a follow-up release.
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                That makes sense Sarah. Given our launch timeline, I think simplifying for v1.0 is the right call. We can always enhance it later. James, what about the performance side?
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                Yeah, so I've been running some tests on our API endpoints and I've identified several bottlenecks, particularly around database queries when we're dealing with large datasets. I think we need to dedicate a full sprint to optimization work - query improvements, caching implementation, maybe some database indexing updates. This is critical before we scale to more users.
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                How much time are we talking about for that work, James?
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                I'd say we need about 30% of our engineering bandwidth for the next quarter to really address this properly. It's technical debt that we can't ignore anymore.
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                Okay, so here's what I'm thinking. Let's adjust the mobile launch date to March 15 instead of February to account for the simplified sync approach. That gives Sarah's team more time for testing. We'll allocate 30% of resources to James's performance work, and the remaining 70% continues on new features and the mobile app. Does that work for everyone?
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                That works for me. I'll need to finalize the wireframes by next Friday though to stay on track.
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                I can work with that timeline. I'll start the performance audit this week and have a detailed plan by January 20th.
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                Perfect. One more thing - the API v2. We've been talking about this for a while. I think February is the right time to kick this off, with a beta release targeted for Q2. Thoughts?
              </p>
              <p className="mb-4 text-gray-700 leading-relaxed">
                Agreed. We should definitely start the API v2 work in February.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-3">Ready to transform your meetings?</h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                Get professional meeting notes like this automatically from any recording.
                Start free with 30 minutes per month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/"
                  className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
