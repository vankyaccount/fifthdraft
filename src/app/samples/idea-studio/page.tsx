'use client'

import Link from 'next/link'
import { ArrowLeft, Download, Copy, Check, Lightbulb, TrendingUp, HelpCircle, Target, AlertCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Logo from '@/components/ui/Logo'

export default function IdeaStudioSample() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const content = document.getElementById('sample-content')?.innerText || ''
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo />
              <span className="text-neutral-400">•</span>
              <span className="flex items-center space-x-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Idea Studio</span>
              </span>
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                Try Pro Free
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
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-sm font-medium mb-4">
              <Lightbulb className="w-4 h-4 mr-2" />
              Sample Idea Studio Analysis
            </div>
            <div className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-lg shadow-sm p-6">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Sustainable Coffee Shop Concept
              </h2>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <span className="capitalize">brainstorming mode</span>
                <span>•</span>
                <span>January 15, 2026</span>
                <span>•</span>
                <span>23 minutes</span>
              </div>
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

          {/* Sample Content */}
          <div id="sample-content" className="space-y-6">
            {/* Core Ideas - Matching actual implementation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 border-purple-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-purple-900">
                <Lightbulb className="w-6 h-6 mr-2 text-purple-600" />
                Core Ideas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                  <h3 className="font-semibold text-purple-900 mb-2">Zero-Waste Operations</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Implementing comprehensive composting, reusable cup programs, and eliminating single-use plastics to create a fully circular waste system
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      → Local Partnerships
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      → Customer Education
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                  <h3 className="font-semibold text-purple-900 mb-2">Direct Trade Coffee Sourcing</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Building direct relationships with coffee farmers to ensure fair pricing, quality control, and transparency in the supply chain
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      → Brand Story
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      → Premium Positioning
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                  <h3 className="font-semibold text-purple-900 mb-2">Community Hub Model</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Creating a space that goes beyond coffee by hosting workshops, local artist showcases, and sustainability education events
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      → Revenue Diversification
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      → Local Partnerships
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                  <h3 className="font-semibold text-purple-900 mb-2">Transparent Pricing Model</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Displaying the full cost breakdown for each product, showing exactly how much goes to farmers, operations, and local community initiatives
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      → Brand Trust
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      → Direct Trade
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expansion Opportunities - Matching actual implementation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 border-indigo-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-900">
                <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
                Expansion Opportunities
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-indigo-900 mb-2">Zero-Waste Operations</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Partner with local urban farms to compost coffee grounds</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Develop branded reusable cup subscription program</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Create educational content about waste reduction for customers</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-indigo-900 mb-2">Direct Trade Coffee Sourcing</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Organize customer trips to visit partner coffee farms</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Create video series documenting farmer stories and growing process</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Sell premium single-origin beans with detailed provenance information</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-indigo-900 mb-2">Community Hub Model</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Host monthly sustainability workshops and panel discussions</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Rotate local artist exhibitions with commission-free sales</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">→</span>
                      <span>Offer barista training courses as additional revenue stream</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Research Questions - Matching actual implementation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 border-blue-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-900">
                <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                Research Questions
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mr-3 mt-0.5">?</span>
                  <span className="text-gray-700">What are the startup costs for zero-waste coffee shop operations in our target market?</span>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mr-3 mt-0.5">?</span>
                  <span className="text-gray-700">How can we establish direct trade relationships with coffee farmers and handle import processes?</span>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mr-3 mt-0.5">?</span>
                  <span className="text-gray-700">What certifications do we need for sustainability claims (B-Corp, Fair Trade, Organic)?</span>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mr-3 mt-0.5">?</span>
                  <span className="text-gray-700">What's the customer willingness to pay premium prices for sustainable coffee in our area?</span>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mr-3 mt-0.5">?</span>
                  <span className="text-gray-700">How have other community-focused coffee shops structured their event programming and space rental?</span>
                </li>
              </ul>
            </div>

            {/* Potential Obstacles - Matching actual implementation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 border-amber-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-900">
                <AlertCircle className="w-6 h-6 mr-2 text-amber-600" />
                Potential Obstacles
              </h2>
              <ul className="space-y-2">
                <li className="flex items-start p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <span className="text-amber-600 font-bold mr-3">⚠</span>
                  <span className="text-gray-700">Higher costs for sustainable operations may reduce profit margins in competitive market</span>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <span className="text-amber-600 font-bold mr-3">⚠</span>
                  <span className="text-gray-700">Complexity of managing direct trade relationships across international borders and logistics</span>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <span className="text-amber-600 font-bold mr-3">⚠</span>
                  <span className="text-gray-700">Customer education needed to justify premium pricing versus conventional coffee shops</span>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <span className="text-amber-600 font-bold mr-3">⚠</span>
                  <span className="text-gray-700">Balancing commercial space needs with community event programming</span>
                </li>
              </ul>
            </div>

            {/* Creative Prompts - Matching actual implementation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 border-pink-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-pink-900">
                <Sparkles className="w-6 h-6 mr-2 text-pink-600" />
                Creative Prompts
              </h2>
              <ul className="space-y-3">
                <li className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <span className="text-gray-700 italic">💭 What if customers could "adopt" a coffee farmer and track their beans from farm to cup?</span>
                </li>
                <li className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <span className="text-gray-700 italic">💭 How might we gamify sustainability - rewarding customers for bringing reusable cups or composting?</span>
                </li>
                <li className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <span className="text-gray-700 italic">💭 Could we create a mobile app showing environmental impact of customer choices in real-time?</span>
                </li>
                <li className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <span className="text-gray-700 italic">💭 What if the coffee shop doubled as a zero-waste product retail space for local sustainable goods?</span>
                </li>
                <li className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <span className="text-gray-700 italic">💭 How could we make supply chain transparency exciting and interactive for customers?</span>
                </li>
              </ul>
            </div>

            {/* Next Steps - Matching actual implementation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-2 border-purple-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-purple-900">
                <Target className="w-6 h-6 mr-2 text-purple-600" />
                Next Steps
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <span className="text-purple-600 font-bold mr-3 mt-0.5">1.</span>
                  <div className="flex-1">
                    <span className="text-gray-700">Research sustainable coffee shop costs and create detailed financial projections</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      high
                    </span>
                  </div>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <span className="text-purple-600 font-bold mr-3 mt-0.5">2.</span>
                  <div className="flex-1">
                    <span className="text-gray-700">Visit 3-5 existing sustainable coffee shops to learn from their operations</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      high
                    </span>
                  </div>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <span className="text-purple-600 font-bold mr-3 mt-0.5">3.</span>
                  <div className="flex-1">
                    <span className="text-gray-700">Connect with coffee importing consultants to understand direct trade logistics</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      medium
                    </span>
                  </div>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <span className="text-purple-600 font-bold mr-3 mt-0.5">4.</span>
                  <div className="flex-1">
                    <span className="text-gray-700">Scout potential locations in neighborhoods with sustainability-conscious demographics</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      medium
                    </span>
                  </div>
                </li>
                <li className="flex items-start p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <span className="text-purple-600 font-bold mr-3 mt-0.5">5.</span>
                  <div className="flex-1">
                    <span className="text-gray-700">Develop brand identity and visual design reflecting transparency and sustainability values</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      low
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Full Transcript */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Transcript</h2>
              <div className="prose max-w-none">
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Okay, so I've been thinking about this coffee shop idea for a while now. I really want it to be different, you know? Not just another generic cafe. I'm thinking sustainable, eco-friendly, but also like a real community hub. Let me just brainstorm out loud here.
                </p>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  First thing - zero waste. I want to go full zero waste. That means composting everything we can, working with local urban farms to take our coffee grounds. We'd need reusable cups, maybe a subscription program where people can get their own branded cup. No single-use plastics at all. The challenge is making sure customers actually participate, so we'd need some kind of education component.
                </p>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Next, the coffee itself. I don't want to just buy from a distributor. I want direct trade relationships with farmers. Fair pricing, quality control, knowing exactly where our beans come from. Maybe we could even organize trips for customers to visit the farms? That would be amazing for building the story. The transparency angle is huge - we could break down the exact cost of every cup and show how much goes to the farmer versus operations.
                </p>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Community hub aspect - this is important. I'm imagining workshops on sustainability, local artist showcases, maybe barista training classes. The space needs to be flexible. During the day it's a coffee shop, but evenings and weekends it transforms into an event space. We could host panel discussions, film screenings about environmental issues, maybe partner with local environmental nonprofits.
                </p>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Revenue streams beyond just coffee - event space rental, workshop fees, selling premium beans retail, maybe even consulting for other businesses that want to go sustainable. Membership program could work too - like a monthly subscription that gets you discounts plus early access to events.
                </p>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Challenges I need to think through: The costs are going to be higher with all the sustainable practices. Can we charge premium prices and still compete? Location is critical - need a neighborhood that actually cares about this stuff and can afford it. The direct trade relationships will be complex to set up and maintain. Legal and import stuff I don't fully understand yet.
                </p>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  What if we did like... an adoption program? Customers could "adopt" a specific farmer or farm, get updates about harvests, see photos, maybe even video calls? That would be super engaging. Or gamification - reward people for sustainable choices with points or badges or something.
                </p>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  I should probably visit some existing sustainable coffee shops, talk to their owners. Research the certification process - B-Corp, Fair Trade, Organic certifications. Figure out the real startup costs. Connect with coffee importing experts. Maybe find a mentor who's done something similar.
                </p>
              </div>
            </div>
          </div>

          {/* AI Research Sample */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border-2 border-green-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-green-900">
              <Lightbulb className="w-6 h-6 mr-2 text-green-600" />
              AI Research Findings
            </h2>

            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-gray-700">
                Based on the sustainable coffee shop concept, we conducted research on zero-waste operations, direct trade coffee sourcing, and community-focused business models. The findings indicate strong consumer interest in sustainable practices, with 73% of millennials willing to pay premium prices for environmentally responsible products.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-green-900 mb-2">Key Insights:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span className="text-gray-700">Zero-waste coffee shops can reduce operational waste by 80-90% through composting programs and reusable cup incentives</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span className="text-gray-700">Direct trade relationships typically add $0.50-$1.00 per cup in costs but allow 30-40% higher margins through premium positioning</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span className="text-gray-700">Community-focused coffee shops with event programming see 25% higher customer retention rates</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-green-900 mb-3">Research Details:</h3>
              <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-gray-900 mb-2">What are the startup costs for zero-waste coffee shop operations?</h4>
                <p className="text-gray-700 mb-2 text-sm">
                  Initial investment for zero-waste infrastructure ranges from $15,000-$30,000, including commercial composting systems ($3,000-$5,000), reusable cup inventory and washing stations ($2,000-$4,000), and partnerships with local recycling facilities. ROI typically achieved within 18-24 months through waste reduction savings and premium pricing.
                </p>
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Sources:</p>
                  <ul className="space-y-1">
                    <li>
                      <a href="#" className="text-xs text-green-600 hover:text-green-800 hover:underline">
                        Sustainable Restaurant Association - Zero Waste Guide 2025
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-xs text-green-600 hover:text-green-800 hover:underline">
                        National Coffee Association - Sustainability Report
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Project Brief Sample */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border-2 border-indigo-200 mb-6">
            <div className="p-6 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📋</span>
                <h2 className="text-2xl font-bold text-indigo-900">Project Brief</h2>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Sustainable Coffee Hub: Zero-Waste Community Cafe</h3>
            </div>

            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Executive Overview</h3>
              <p className="text-gray-700 leading-relaxed">
                This project aims to establish a sustainable, zero-waste coffee shop that serves as a community hub while maintaining profitable operations through direct trade sourcing and premium positioning. The cafe will differentiate itself through radical transparency in pricing, comprehensive sustainability practices, and active community engagement through workshops and events.
              </p>
            </div>

            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals & Objectives</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-purple-200">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">1</span>
                  <span className="text-gray-700">Achieve 90% waste diversion from landfills within first year of operation</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-purple-200">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">2</span>
                  <span className="text-gray-700">Establish direct trade relationships with 3-5 coffee farming cooperatives</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-purple-200">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">3</span>
                  <span className="text-gray-700">Create a thriving community space hosting 20+ events per month</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/30 to-cyan-50/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Highlights</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">Phase 1: Planning & Setup</h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">8-12 weeks</span>
                  </div>
                  <p className="text-sm text-gray-700">Location scouting, supplier relationships, equipment procurement</p>
                </div>
                <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Phase 2: Build-out & Soft Launch</h4>
                  <p className="text-sm text-gray-700">Interior construction, staff training, community preview events</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 text-center border-t border-indigo-100">
              <p className="text-sm text-gray-600 italic">Generated by FifthDraft Idea Studio</p>
            </div>
          </div>

          {/* Mind Map Sample */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border-2 border-pink-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-pink-900">
              <Sparkles className="w-6 h-6 mr-2 text-pink-600" />
              Mind Map
            </h2>
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-8 border-2 border-pink-200">
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg shadow-lg">
                  Sustainable Coffee Shop
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <div className="h-0.5 w-8 bg-purple-400"></div>
                    <div className="flex-1 p-3 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
                      <p className="font-semibold text-purple-900">Zero-Waste Operations</p>
                    </div>
                  </div>
                  <div className="ml-12 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="h-0.5 w-4 bg-purple-300"></div>
                      <p className="text-sm text-gray-700">Composting Program</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="h-0.5 w-4 bg-purple-300"></div>
                      <p className="text-sm text-gray-700">Reusable Cups</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <div className="h-0.5 w-8 bg-indigo-400"></div>
                    <div className="flex-1 p-3 bg-white rounded-lg border-2 border-indigo-300 shadow-sm">
                      <p className="font-semibold text-indigo-900">Direct Trade Coffee</p>
                    </div>
                  </div>
                  <div className="ml-12 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      <div className="h-0.5 w-4 bg-indigo-300"></div>
                      <p className="text-sm text-gray-700">Farmer Partnerships</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      <div className="h-0.5 w-4 bg-indigo-300"></div>
                      <p className="text-sm text-gray-700">Transparent Pricing</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                    <div className="h-0.5 w-8 bg-pink-400"></div>
                    <div className="flex-1 p-3 bg-white rounded-lg border-2 border-pink-300 shadow-sm">
                      <p className="font-semibold text-pink-900">Community Hub</p>
                    </div>
                  </div>
                  <div className="ml-12 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <div className="h-0.5 w-4 bg-pink-300"></div>
                      <p className="text-sm text-gray-700">Workshops & Events</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <div className="h-0.5 w-4 bg-pink-300"></div>
                      <p className="text-sm text-gray-700">Local Artist Showcases</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div className="h-0.5 w-8 bg-blue-400"></div>
                    <div className="flex-1 p-3 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
                      <p className="font-semibold text-blue-900">Revenue Streams</p>
                    </div>
                  </div>
                  <div className="ml-12 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="h-0.5 w-4 bg-blue-300"></div>
                      <p className="text-sm text-gray-700">Premium Coffee Sales</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="h-0.5 w-4 bg-blue-300"></div>
                      <p className="text-sm text-gray-700">Event Space Rental</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 mt-8 italic">
                Visual representation of interconnected ideas and concepts
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-2xl p-8 text-white">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                Pro Feature
              </div>
              <h3 className="text-2xl font-bold mb-3">Turn Your Ideas Into Action</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Idea Studio transforms raw brainstorming into structured plans with AI-powered insights,
                research assistance, and project brief generation. Available with Pro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/pricing"
                  className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/10 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
              <p className="text-sm text-purple-200 mt-4">
                Pro: $12.42/month billed annually - Includes 2000 minutes & all Idea Studio features
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
