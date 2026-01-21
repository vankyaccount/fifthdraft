'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'

type WritingStyle = {
  tone: 'professional' | 'casual' | 'academic' | 'creative'
  formality: 'formal' | 'balanced' | 'informal'
  verbosity: 'concise' | 'balanced' | 'detailed'
}

type NoteStructure = {
  summary: boolean
  keyPoints: boolean
  fullTranscript: boolean
  actionItems: boolean
  decisions: boolean
  questions: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState('')
  const [writingStyle, setWritingStyle] = useState<WritingStyle>({
    tone: 'professional',
    formality: 'balanced',
    verbosity: 'balanced'
  })
  const [noteStructure, setNoteStructure] = useState<NoteStructure>({
    summary: true,
    keyPoints: true,
    fullTranscript: true,
    actionItems: true,
    decisions: true,
    questions: true
  })

  const handleComplete = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('Error getting user:', userError)
        router.push('/login')
        return
      }

      // Save name and preferences to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          onboarding_completed: true,
          settings: {
            writing_style: writingStyle,
            note_structure: noteStructure,
            output_preferences: {
              defaultExportFormat: 'markdown',
              includeMetadata: true
            }
          }
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error saving preferences:', updateError)
        // Continue to dashboard even if save fails - user can set preferences later
      } else {
        console.log('Preferences saved successfully')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Unexpected error:', error)
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <Logo href="/dashboard" size="md" />
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {step + 1} of 4
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round(((step + 1) / 4) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 0: Welcome & Name */}
        {step === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to FifthDraft! 👋
              </h1>
              <p className="text-gray-600">
                Let's get to know you and set up your perfect note-taking experience
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name (optional)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none transition-colors"
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                This helps personalize your experience. You can skip this if you prefer.
              </p>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(1)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Writing Style */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Personalize Your Writing Style
            </h1>
            <p className="text-gray-600 mb-8">
              Tell us how you'd like your notes to sound. You can always change this later.
            </p>

            <div className="space-y-8">
              {/* Tone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tone
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['professional', 'casual', 'academic', 'creative'] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setWritingStyle({ ...writingStyle, tone })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        writingStyle.tone === tone
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium capitalize">{tone}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formality */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Formality
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['formal', 'balanced', 'informal'] as const).map((formality) => (
                    <button
                      key={formality}
                      onClick={() => setWritingStyle({ ...writingStyle, formality })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        writingStyle.formality === formality
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium capitalize">{formality}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verbosity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Detail Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['concise', 'balanced', 'detailed'] as const).map((verbosity) => (
                    <button
                      key={verbosity}
                      onClick={() => setWritingStyle({ ...writingStyle, verbosity })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        writingStyle.verbosity === verbosity
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium capitalize">{verbosity}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Preview: How your notes will look
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  {writingStyle.tone === 'professional' && writingStyle.verbosity === 'concise' && (
                    <p>
                      The team agreed to launch the feature by Q2. Sarah will handle design;
                      Mike covers development.
                    </p>
                  )}
                  {writingStyle.tone === 'professional' && writingStyle.verbosity === 'balanced' && (
                    <p>
                      During today's meeting, the team reached consensus on launching the new
                      feature by the end of Q2. Sarah has been assigned to handle the design
                      work, while Mike will cover the development tasks.
                    </p>
                  )}
                  {writingStyle.tone === 'casual' && (
                    <p>
                      So we talked about the new feature today and everyone's on board to ship
                      it by Q2. Sarah's going to take care of the design stuff, and Mike's
                      handling the dev work.
                    </p>
                  )}
                  {writingStyle.tone === 'academic' && (
                    <p>
                      The committee convened to discuss the proposed feature implementation.
                      Following deliberation, a unanimous decision was reached to proceed with
                      deployment during the second quarter.
                    </p>
                  )}
                  {writingStyle.tone === 'creative' && (
                    <p>
                      Picture this: the team gathered around the table, energy buzzing, and
                      boom—unanimous agreement to bring this feature to life by Q2. Sarah's
                      artistic vision will shape the design...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(0)}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Note Structure */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Note Structure
            </h1>
            <p className="text-gray-600 mb-8">
              Select which sections you'd like to include in your notes by default.
            </p>

            <div className="space-y-4">
              {(Object.keys(noteStructure) as Array<keyof NoteStructure>).map((key) => {
                const labels = {
                  summary: 'Summary',
                  keyPoints: 'Key Points',
                  fullTranscript: 'Full Transcript',
                  actionItems: 'Action Items',
                  decisions: 'Decisions',
                  questions: 'Questions & Follow-ups'
                }
                const descriptions = {
                  summary: 'A brief overview at the top of your note',
                  keyPoints: 'Bullet-point highlights of main ideas',
                  fullTranscript: 'Complete cleaned transcript',
                  actionItems: 'Automatically extracted tasks with assignees',
                  decisions: 'Important decisions made during the conversation',
                  questions: 'Open questions and follow-up items'
                }

                return (
                  <label
                    key={key}
                    className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-300 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={noteStructure[key]}
                      onChange={(e) => setNoteStructure({
                        ...noteStructure,
                        [key]: e.target.checked
                      })}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{labels[key]}</div>
                      <div className="text-sm text-gray-600">{descriptions[key]}</div>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You're All Set! 🎉
            </h1>
            <p className="text-gray-600 mb-8">
              Here's a summary of your preferences. You can change these anytime in Settings.
            </p>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Writing Style</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tone:</span>
                    <span className="ml-2 font-medium capitalize">{writingStyle.tone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Formality:</span>
                    <span className="ml-2 font-medium capitalize">{writingStyle.formality}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Detail:</span>
                    <span className="ml-2 font-medium capitalize">{writingStyle.verbosity}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Note Sections</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(noteStructure).map(([key, enabled]) => {
                    if (!enabled) return null
                    const labels: Record<string, string> = {
                      summary: 'Summary',
                      keyPoints: 'Key Points',
                      fullTranscript: 'Full Transcript',
                      actionItems: 'Action Items',
                      decisions: 'Decisions',
                      questions: 'Questions'
                    }
                    return (
                      <span
                        key={key}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {labels[key]}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-900 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Record your first voice memo using the microphone button</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Watch as AI transforms your audio into polished notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Export, share, or chat with your notes using the Interactive Brain</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
