import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-indigo-600 mb-3">FifthDraft</h3>
            <p className="text-gray-600 text-sm mb-4 max-w-md">
              Transform your voice memos into professional meeting notes with AI-powered transcription and intelligent formatting.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/samples/meeting-notes" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Meeting Notes Sample
                </Link>
              </li>
              <li>
                <Link href="/samples/idea-studio" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Idea Studio Sample
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <a href="mailto:support@fifthdraft.com" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="mailto:contact@fifthdraft.com" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2026 FifthDraft. All rights reserved.
            </p>

            {/* Quick Legal Links */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-indigo-600 transition-colors">
                Terms
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center md:text-left">
            <p className="text-xs text-gray-500">
              AI-powered by OpenAI Whisper and Claude Haiku 4.5. Secure data storage with automatic cleanup.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
