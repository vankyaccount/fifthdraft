'use client'

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Logo from '@/components/ui/Logo';
import { Sparkles, FileText, Lightbulb, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const Homepage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo href="/" size="md" />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                Pricing
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
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Transform Conversations into
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Results</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            FifthDraft uses AI to turn your meetings and brainstorming sessions into actionable insights, structured notes, and professional deliverables.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-neutral-300 text-neutral-700 px-8 py-3 rounded-lg hover:border-neutral-400 transition-colors font-medium"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-4">
            Everything You Need to Capture Ideas
          </h2>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            From quick meetings to deep brainstorming sessions, FifthDraft helps you capture, organize, and act on your ideas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Meeting Notes</h3>
              <p className="text-sm text-neutral-600">
                AI-powered transcription with automatic action items, decisions, and key points extraction.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Idea Studio</h3>
              <p className="text-sm text-neutral-600">
                Transform raw ideas into structured insights with AI research, project briefs, and mind maps.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Smart Organization</h3>
              <p className="text-sm text-neutral-600">
                Organize notes with folders, tags, and powerful search. Find anything instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Export Anywhere</h3>
              <p className="text-sm text-neutral-600">
                Export to Markdown, PDF, DOCX, or integrate with your favorite tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Idea Studio Spotlight */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Pro Feature
              </div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Idea Studio: Your AI Thinking Partner
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Brainstorm, explore, and develop ideas with AI-powered tools designed for creative thinking and innovation.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-700">Extract core ideas and connections from brainstorming sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-700">Generate project briefs and timelines automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-700">AI research assistant with web search integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-700">Visual mind maps to see your ideas come to life</span>
                </li>
              </ul>
              <Link
                href="/samples/idea-studio"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                See Idea Studio in action <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-24 h-24 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to Transform Your Ideas?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Start with 30 free minutes per month. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;