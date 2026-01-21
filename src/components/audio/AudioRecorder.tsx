'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mic, Square, Upload, X, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface AudioRecorderProps {
  mode: 'meeting' | 'brainstorming'
  onRecordingComplete?: (recordingId: string) => void
}

export default function AudioRecorder({ mode, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [whisperMode, setWhisperMode] = useState(false)
  const [userTier, setUserTier] = useState<string>('free')
  const [uploadTab, setUploadTab] = useState<'record' | 'upload'>('record')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const durationRef = useRef<number>(0) // Track actual duration to avoid closure issues
  const supabase = createClient()

  // Fetch user tier on mount
  useEffect(() => {
    const fetchUserTier = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserTier(profile.subscription_tier)
        }
      }
    }
    fetchUserTier()
  }, [supabase])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        }
      })

      streamRef.current = stream

      // Check if Opus codec is supported
      const mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn('Opus not supported, falling back to default')
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        audioBitsPerSecond: 24000, // 24 kbps for efficient voice
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = handleRecordingStop

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setDuration(0)
      durationRef.current = 0

      // Start timer
      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setDuration(durationRef.current)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  const handleRecordingStop = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
    const recordingDuration = durationRef.current // Use ref to get actual duration
    chunksRef.current = []

    console.log('DEBUG handleRecordingStop: recordingDuration from ref =', recordingDuration, 'seconds')
    await uploadRecording(audioBlob, recordingDuration)
  }

  const uploadRecording = async (audioBlob: Blob, recordingDuration: number) => {
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create unique filename
      const fileName = `${user.id}/${Date.now()}.webm`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm;codecs=opus',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Create recording record
      console.log('DEBUG AudioRecorder: duration =', recordingDuration, 'seconds')
      const { data: recording, error: dbError } = await supabase
        .from('recordings')
        .insert([
          {
            user_id: user.id,
            mode,
            whisper_mode: whisperMode,
            storage_path: fileName,
            file_size: audioBlob.size,
            duration: recordingDuration, // Duration in seconds (not minutes!)
            status: 'queued',
          },
        ])
        .select()
        .single()

      console.log('DEBUG AudioRecorder: Recording created with ID:', recording?.id, 'duration:', recording?.duration)

      if (dbError) throw dbError

      // Trigger transcription API
      await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: recording.id }),
      })

      if (onRecordingComplete) {
        onRecordingComplete(recording.id)
      }

      // Show appropriate message based on mode
      if (mode === 'brainstorming') {
        alert('🎉 Recording uploaded successfully!\n\n⏱️ Idea Studio Processing: 1-2 minutes\n\nWe\'re generating comprehensive insights including:\n• Core Ideas & Connections\n• Expansion Opportunities\n• Research Questions\n• Creative Prompts\n• Next Steps\n\n💡 We prioritize accuracy over speed to deliver maximum value!')
      } else {
        alert('Recording uploaded successfully! Processing started.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload recording. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getMaxDuration = () => {
    switch (userTier) {
      case 'free': return 30 // 30 minutes
      case 'pro': return 120 // 2 hours
      case 'team': return 240 // 4 hours
      case 'enterprise': return 480 // 8 hours
      default: return 30
    }
  }

  const getMaxFileSize = () => {
    const maxMinutes = getMaxDuration()
    // Estimate: ~1MB per minute for typical audio files
    return maxMinutes * 1024 * 1024 // MB to bytes
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // CRITICAL: Block file uploads for free tier - show upgrade modal
    if (userTier === 'free') {
      setShowUpgradeModal(true)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/ogg']
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      alert('Invalid file type. Please upload an audio file (MP3, WAV, M4A, WebM, or OGG).')
      return
    }

    // Validate file size based on tier
    const maxSize = getMaxFileSize()
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / 1024 / 1024)
      alert(`File size exceeds your tier limit of ${maxMB}MB (${getMaxDuration()} minutes). Please upgrade your plan or use a shorter recording.`)
      return
    }

    // Estimate duration (rough estimate: 1MB ≈ 1 minute)
    const estimatedMinutes = Math.round(file.size / 1024 / 1024)

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create unique filename
      const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Create recording record
      const { data: recording, error: dbError } = await supabase
        .from('recordings')
        .insert([
          {
            user_id: user.id,
            mode,
            whisper_mode: false,
            storage_path: fileName,
            file_size: file.size,
            duration: estimatedMinutes,
            status: 'queued',
          },
        ])
        .select()
        .single()

      if (dbError) throw dbError

      // Trigger transcription API
      await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: recording.id }),
      })

      if (onRecordingComplete) {
        onRecordingComplete(recording.id)
      }

      alert('File uploaded successfully! Processing started.')

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setUploadTab('record')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            uploadTab === 'record'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Mic className="w-4 h-4" />
            <span>Record Audio</span>
          </div>
        </button>
        <button
          onClick={() => setUploadTab('upload')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            uploadTab === 'upload'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </div>
        </button>
      </div>

      {/* Record Tab */}
      {uploadTab === 'record' && (
        <div className="flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary-100'
            }`}>
              <Mic className={`w-16 h-16 ${isRecording ? 'text-red-600' : 'text-primary-600'}`} />
            </div>
            {isRecording && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white px-3 py-1 rounded-full text-sm font-mono">
                {formatDuration(duration)}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="whisperMode"
              checked={whisperMode}
              onChange={(e) => setWhisperMode(e.target.checked)}
              disabled={isRecording}
              className="rounded"
            />
            <label htmlFor="whisperMode" className="text-sm text-neutral-700">
              Whisper Mode (for quiet recording)
            </label>
          </div>

          <div className="flex space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={uploading}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Square className="w-5 h-5" />
                <span>Stop Recording</span>
              </button>
            )}
          </div>

          {uploading && (
            <div className="flex items-center space-x-2 text-primary-600">
              <Upload className="w-5 h-5 animate-bounce" />
              <span>Uploading recording...</span>
            </div>
          )}

          <div className="text-xs text-neutral-500 text-center max-w-md">
            <p>Using Opus codec at 24kbps, 16kHz mono for optimal quality and efficiency</p>
            <p className="mt-1">~0.18 MB per minute • 48-hour storage retention</p>
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {uploadTab === 'upload' && (
        <div className="flex flex-col items-center space-y-6 p-8">
          <div className="w-full max-w-md">
            {userTier === 'free' ? (
              /* Free tier - show upgrade prompt */
              <div className="border-2 border-dashed border-primary-300 bg-primary-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  File Upload - Pro Feature
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Upload audio files (MP3, WAV, M4A, WebM, OGG) with Pro, Team, or Enterprise plans
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-xs text-neutral-500 mb-2">Your current tier:</p>
                  <p className="text-sm font-semibold text-neutral-900 mb-3">
                    Free - 30 minutes/month (Recording only)
                  </p>
                  <div className="border-t border-neutral-200 pt-3">
                    <p className="text-xs text-neutral-500 mb-2">Upgrade to unlock:</p>
                    <ul className="text-sm text-left text-neutral-700 space-y-1">
                      <li>✓ Upload files up to 120MB</li>
                      <li>✓ 100 minutes/month quota</li>
                      <li>✓ Lifetime transcript access</li>
                      <li>✓ AI-powered features</li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Upgrade to Pro</span>
                </button>
              </div>
            ) : (
              /* Paid tiers - show upload UI */
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <Upload className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Upload Audio File
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  MP3, WAV, M4A, WebM, or OGG files
                </p>
                <p className="text-xs text-neutral-500 mb-4">
                  Your tier: <span className="font-semibold capitalize">{userTier}</span> •
                  Max: {getMaxDuration()} minutes ({Math.round(getMaxFileSize() / 1024 / 1024)}MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                </label>
              </div>
            )}
          </div>

          {uploading && (
            <div className="flex items-center space-x-2 text-primary-600">
              <Upload className="w-5 h-5 animate-bounce" />
              <span>Processing upload...</span>
            </div>
          )}

          <div className="text-xs text-neutral-500 text-center max-w-md space-y-2">
            <p className="font-medium">Tier Limits:</p>
            <ul className="space-y-1">
              <li>• Free: 30 min/month (30MB)</li>
              <li>• Pro: 2 hours/month (120MB)</li>
              <li>• Team: 4 hours/month (240MB)</li>
              <li>• Enterprise: 8 hours/month (480MB)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Upgrade to Pro</h3>
            </div>

            <p className="text-neutral-600 mb-6">
              File uploads are available for Pro, Team, and Enterprise users. Upgrade now to unlock:
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-neutral-900">Upload Audio Files</p>
                  <p className="text-sm text-neutral-600">MP3, WAV, M4A up to 120MB</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-neutral-900">100 Minutes/Month</p>
                  <p className="text-sm text-neutral-600">vs 30 minutes on Free tier</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-neutral-900">AI-Powered Features</p>
                  <p className="text-sm text-neutral-600">Chat, Templates, Better AI model</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-neutral-900">Lifetime Transcripts</p>
                  <p className="text-sm text-neutral-600">vs 7-day retention on Free tier</p>
                </div>
              </li>
            </ul>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
              >
                Maybe Later
              </button>
              <Link
                href="/pricing"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center font-medium"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
