'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import AudioRecorder from '@/components/audio/AudioRecorder'
import SystemAudioRecorder from '@/components/audio/SystemAudioRecorder'
import Link from 'next/link'
import { Mic, Monitor, Sparkles, Lightbulb, Zap } from 'lucide-react'

function RecordPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = (searchParams.get('mode') || 'meeting') as 'meeting' | 'brainstorming'
  const [recordingMode, setRecordingMode] = useState<'standard' | 'system'>('standard')

  const handleRecordingComplete = (recordingId: string) => {
    router.push('/dashboard')
  }

  // Idea Studio (brainstorming) mode has premium styling
  const isIdeaStudio = mode === 'brainstorming'

  return (
    <div className={`min-h-screen ${isIdeaStudio ? 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50' : 'bg-neutral-50'}`}>
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                FifthDraft
              </Link>
              <span className="text-neutral-400">•</span>
              <span className={`capitalize font-medium ${isIdeaStudio ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600' : 'text-neutral-700'}`}>
                {isIdeaStudio ? 'Idea Studio' : 'Meeting Mode'}
              </span>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className={`rounded-lg shadow-lg p-8 ${
          isIdeaStudio
            ? 'bg-white/80 backdrop-blur-sm border-2 border-purple-200'
            : 'bg-white shadow-sm'
        }`}>
          {/* Premium Badge for Idea Studio */}
          {isIdeaStudio && (
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium shadow-lg animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>Premium Feature - Testing Phase</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          )}

          <h1 className={`text-2xl font-bold text-center mb-2 ${
            isIdeaStudio ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600' : ''
          }`}>
            {mode === 'meeting' ? 'Record Meeting Notes' : 'Idea Studio'}
          </h1>
          <p className="text-center text-neutral-600 mb-4">
            {mode === 'meeting'
              ? 'Record your meeting and get structured notes with action items'
              : 'Transform your raw thoughts into structured insights with AI-powered research and creative exploration'
            }
          </p>

          {/* What You'll Get - Idea Studio */}
          {isIdeaStudio && (
            <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 rounded-xl border-2 border-purple-200 shadow-md">
              <h3 className="text-lg font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                ✨ What You'll Get After Recording
              </h3>

              {/* Recording Guidelines */}
              <div className="mb-4 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900 text-center">
                  <strong>💡 Recommended:</strong> Record for <strong>2-5 minutes</strong> to provide enough context for comprehensive AI analysis
                </p>
                <p className="text-xs text-purple-700 text-center mt-1">
                  ⏱️ Processing takes 1-2 minutes — we prioritize accuracy over speed to maximize value and minimize costs
                </p>
              </div>

              <div className="space-y-4">
                {/* Core Brainstorming Insights */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    Core Brainstorming Insights
                  </h4>
                  <ul className="space-y-2 text-sm text-neutral-700 ml-7">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2 font-bold">•</span>
                      <span><strong>Core Ideas:</strong> Main concepts extracted and organized</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2 font-bold">•</span>
                      <span><strong>Idea Connections:</strong> How your thoughts relate to each other</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2 font-bold">•</span>
                      <span><strong>Expansion Opportunities:</strong> Directions to explore further</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2 font-bold">•</span>
                      <span><strong>Research Questions:</strong> What needs deeper investigation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2 font-bold">•</span>
                      <span><strong>Obstacles & Solutions:</strong> Potential challenges identified</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2 font-bold">•</span>
                      <span><strong>Creative Prompts:</strong> Questions to spark deeper thinking</span>
                    </li>
                  </ul>
                </div>

                {/* AI-Powered Tools */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100 hover:border-purple-300 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="font-semibold text-sm text-purple-900">AI Research</span>
                    </div>
                    <p className="text-xs text-neutral-600">Automatic web research with sources</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-indigo-100 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span className="font-semibold text-sm text-indigo-900">Project Brief</span>
                    </div>
                    <p className="text-xs text-neutral-600">Structured plan with timeline & resources</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-pink-100 hover:border-pink-300 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-5 h-5 text-pink-600 flex-shrink-0" />
                      <span className="font-semibold text-sm text-pink-900">Mind Map</span>
                    </div>
                    <p className="text-xs text-neutral-600">Visual representation of your ideas</p>
                  </div>
                </div>

                {/* Clean Transcript */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                  <p className="text-sm text-neutral-700 text-center">
                    <strong className="text-purple-900">Plus:</strong> Clean, polished transcript with filler words removed ✨
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recording Mode Selector */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setRecordingMode('standard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  recordingMode === 'standard'
                    ? `${isIdeaStudio ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white text-primary-600'} shadow-sm`
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Microphone Only</span>
              </button>
              <button
                onClick={() => setRecordingMode('system')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  recordingMode === 'system'
                    ? `${isIdeaStudio ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white text-primary-600'} shadow-sm`
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>System Audio Capture</span>
              </button>
            </div>
          </div>

          {/* Render appropriate recorder based on mode */}
          {recordingMode === 'standard' ? (
            <AudioRecorder mode={mode} onRecordingComplete={handleRecordingComplete} />
          ) : (
            <SystemAudioRecorder mode={mode} onRecordingComplete={handleRecordingComplete} />
          )}

          {/* Tips */}
          <div className={`mt-8 p-4 rounded-lg ${
            isIdeaStudio
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
              : 'bg-neutral-50'
          }`}>
            <h3 className={`font-medium mb-2 ${
              isIdeaStudio ? 'text-purple-900' : 'text-neutral-900'
            }`}>
              {isIdeaStudio ? '✨ Idea Studio Tips:' : 'Tips for Best Results:'}
            </h3>
            {isIdeaStudio ? (
              <ul className="text-sm text-neutral-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">💡</span>
                  <span><strong>Speak freely:</strong> Don't worry about structure - just capture your raw thoughts and ideas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">🎯</span>
                  <span><strong>Think out loud:</strong> Explore different angles, ask questions, challenge your own assumptions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">🔍</span>
                  <span><strong>AI will help:</strong> Our AI identifies research needs, expands ideas, and suggests next steps</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✨</span>
                  <span><strong>Connect ideas:</strong> Mention related projects or past brainstorms - we'll link them automatically</span>
                </li>
                <li className="flex items-start">
                  <span className="text-neutral-600 mr-2">🎙️</span>
                  <span>Recording uses Opus codec (~0.18 MB/minute) • Audio auto-deleted after 48 hours for privacy</span>
                </li>
              </ul>
            ) : recordingMode === 'standard' ? (
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Minimize background noise for better accuracy</li>
                <li>• Enable Whisper Mode for quiet/low-volume recording</li>
                <li>• Recording uses Opus codec (~0.18 MB/minute)</li>
                <li>• Audio is auto-deleted after 48 hours for privacy</li>
              </ul>
            ) : (
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Make sure to check "Share tab audio" or "Share system audio" in the browser dialog</li>
                <li>• You may see a video preview, but only audio is captured (video is discarded)</li>
                <li>• Both system audio and microphone will be recorded simultaneously</li>
                <li>• Perfect for recording Zoom, Teams, or Google Meet calls</li>
                <li>• Uses higher quality codec (~0.96 MB/minute) for dual sources</li>
                <li>• Only supported in Chrome and Edge browsers</li>
                <li>• Audio is auto-deleted after 48 hours for privacy</li>
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecordPageContent />
    </Suspense>
  )
}
