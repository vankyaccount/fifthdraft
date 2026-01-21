'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Monitor, Mic, Square, AlertCircle } from 'lucide-react'

interface SystemAudioRecorderProps {
  mode: 'meeting' | 'brainstorming'
  onRecordingComplete?: (recordingId: string) => void
}

export default function SystemAudioRecorder({ mode, onRecordingComplete }: SystemAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const systemStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const durationRef = useRef<number>(0) // Track actual duration to avoid closure issues
  const supabase = createClient()

  // Check browser compatibility on mount
  useEffect(() => {
    const checkSupport = () => {
      // Check if getDisplayMedia is supported (Chrome/Edge)
      const supported =
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getDisplayMedia === 'function'

      setIsSupported(supported)

      if (!supported) {
        setError('System Audio Capture is only supported in Chrome and Edge browsers.')
      }
    }

    checkSupport()
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (systemStreamRef.current) {
        systemStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)

      // Request system audio via getDisplayMedia
      // IMPORTANT: Must request video:true even though we only want audio
      // Chrome/Edge don't support video:false with audio capture
      const systemStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Required - cannot be false for getDisplayMedia
        audio: true, // Request system audio
      })

      // Stop video track immediately (we only want audio)
      const videoTrack = systemStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.stop()
        systemStream.removeTrack(videoTrack)
      }

      // Check if system audio track exists
      const systemAudioTracks = systemStream.getAudioTracks()
      if (systemAudioTracks.length === 0) {
        throw new Error('No audio track found. Make sure to enable "Share audio" when selecting the tab/window.')
      }

      systemStreamRef.current = systemStream

      // Request microphone with simpler constraints
      let micStream: MediaStream | null = null
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: true, // Use simple boolean to avoid constraint conflicts
        })
        micStreamRef.current = micStream
      } catch (micError: any) {
        console.warn('Microphone access failed, recording system audio only:', micError)
        // Continue with just system audio if mic fails
      }

      // Create AudioContext with default sample rate to avoid resampling issues
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      // Create source nodes
      const systemSource = audioContext.createMediaStreamSource(systemStream)

      // Create destination for mixed audio
      const destination = audioContext.createMediaStreamDestination()

      // Connect system audio
      systemSource.connect(destination)

      // Connect microphone if available
      if (micStream) {
        try {
          const micSource = audioContext.createMediaStreamSource(micStream)
          micSource.connect(destination)
        } catch (micConnectError) {
          console.warn('Could not mix microphone, recording system audio only:', micConnectError)
        }
      }

      // Check if Opus codec is supported, fall back to default
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      }

      console.log('Using MIME type:', mimeType)

      // Create MediaRecorder with mixed stream
      try {
        const mediaRecorder = new MediaRecorder(destination.stream, {
          mimeType: mimeType,
          audioBitsPerSecond: 128000, // Higher quality for dual source (system + mic)
        } as any)

        mediaRecorderRef.current = mediaRecorder
        chunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = handleRecordingStop

        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event.error)
          setError(`Recording error: ${event.error}`)
        }

        // Handle if user stops screen share
        systemAudioTracks[0].addEventListener('ended', () => {
          if (isRecording) {
            stopRecording()
            setError('System audio sharing was stopped')
          }
        })

        mediaRecorder.start(1000) // Collect data every second
        setIsRecording(true)
        setDuration(0)
        durationRef.current = 0

        // Start timer
        timerRef.current = setInterval(() => {
          durationRef.current += 1
          setDuration(durationRef.current)
        }, 1000)
      } catch (recorderError: any) {
        console.error('Failed to create MediaRecorder:', recorderError)
        throw new Error(`Failed to create recorder: ${recorderError.message}`)
      }
    } catch (error: any) {
      console.error('Error starting system audio recording:', error)

      if (error.name === 'NotAllowedError') {
        setError('Permission denied. Please allow system audio access and select "Share audio" when prompted.')
      } else if (error.name === 'NotFoundError') {
        setError('No audio sources found. Please check your system audio settings.')
      } else if (error.message.includes('Share audio')) {
        setError(error.message)
      } else {
        setError(`Failed to start recording: ${error.message || 'Unknown error'}`)
      }

      // Clean up on error
      if (systemStreamRef.current) {
        systemStreamRef.current.getTracks().forEach(track => track.stop())
        systemStreamRef.current = null
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
        micStreamRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
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

      if (systemStreamRef.current) {
        // Stop all tracks (audio and any remaining video)
        systemStreamRef.current.getTracks().forEach(track => track.stop())
        systemStreamRef.current = null
      }

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
        micStreamRef.current = null
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  const handleRecordingStop = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
    const recordingDuration = durationRef.current // Use ref to get actual duration
    chunksRef.current = []

    console.log('DEBUG SystemAudio handleRecordingStop: recordingDuration from ref =', recordingDuration, 'seconds')
    await uploadRecording(audioBlob, recordingDuration)
  }

  const uploadRecording = async (audioBlob: Blob, recordingDuration: number) => {
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      console.log('DEBUG: Attempting upload with user ID:', user.id, 'email:', user.email)

      // Create unique filename
      const fileName = `${user.id}/${Date.now()}-system.webm`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm;codecs=opus',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Create recording record with recording_type
      console.log('DEBUG SystemAudioRecorder: duration =', recordingDuration, 'seconds')
      const { data: recording, error: dbError } = await supabase
        .from('recordings')
        .insert([
          {
            user_id: user.id,
            mode,
            whisper_mode: false,
            storage_path: fileName,
            file_size: audioBlob.size,
            duration: recordingDuration, // Duration in seconds (not minutes!)
            status: 'queued',
            recording_type: 'system_audio',
          },
        ])
        .select()
        .single()

      console.log('DEBUG SystemAudioRecorder: Recording created with ID:', recording?.id, 'duration:', recording?.duration)

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

      alert('Recording uploaded successfully! Processing started.')
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error?.message || error?.error_description || 'Unknown error'
      alert(`Failed to upload recording: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Unsupported browser
  if (!isSupported) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8">
        <div className="w-full max-w-md bg-amber-50 border-2 border-amber-300 rounded-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Browser Not Supported
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            System Audio Capture requires Chrome or Edge browser. This feature captures both your
            computer's audio output (e.g., from Zoom, Teams) and your microphone simultaneously.
          </p>
          <p className="text-xs text-neutral-500">
            Please switch to Chrome or Edge to use this feature. You can still use the regular
            "Record Audio" tab in any browser.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {/* Info Card */}
      <div className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">System Audio Capture</p>
            <p className="mb-2">
              This will record both your computer's audio output (e.g., from Zoom, Teams, or any
              application) AND your microphone at the same time. Perfect for recording meetings with
              clear audio from all participants.
            </p>
            <p className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
              💡 The browser may show a video preview, but <strong>only audio is captured</strong>. Video is immediately discarded.
            </p>
          </div>
        </div>
      </div>

      {/* Recording UI */}
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
          isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary-100'
        }`}>
          <div className="flex items-center justify-center space-x-1">
            <Monitor className={`w-8 h-8 ${isRecording ? 'text-red-600' : 'text-primary-600'}`} />
            <span className={`text-2xl ${isRecording ? 'text-red-600' : 'text-primary-600'}`}>+</span>
            <Mic className={`w-8 h-8 ${isRecording ? 'text-red-600' : 'text-primary-600'}`} />
          </div>
        </div>
        {isRecording && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white px-3 py-1 rounded-full text-sm font-mono">
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={uploading}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Monitor className="w-5 h-5" />
            <span>Start System + Mic Recording</span>
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
          <Monitor className="w-5 h-5 animate-bounce" />
          <span>Uploading recording...</span>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-neutral-500 text-center max-w-md space-y-2">
        <p className="font-medium text-neutral-700">🎯 How it works:</p>
        <ol className="text-left space-y-1 list-decimal list-inside text-neutral-700">
          <li>Click "Start System + Mic Recording"</li>
          <li><strong className="text-amber-700">Choose the tab/window to capture</strong></li>
          <li><strong className="text-amber-700">✓ IMPORTANT: Check "Share tab audio" or "Share system audio"</strong></li>
          <li>Allow microphone access when prompted</li>
          <li>Both audio sources will be mixed and recorded together</li>
          <li>Click "Stop Recording" when done</li>
        </ol>
        <p className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
          <strong>⚠️ Common Issue:</strong> If recording fails, make sure to <strong>enable "Share audio"</strong> in the browser's screen capture dialog. This checkbox is critical for system audio capture!
        </p>
        <p className="mt-2 text-neutral-600">
          <strong>Video:</strong> You may see a video preview in the permission dialog, but only audio is captured and recorded.
        </p>
        <p className="mt-2">Using WebM codec at 128kbps for high-quality dual-source audio</p>
        <p>~0.96 MB per minute • 48-hour storage retention</p>
      </div>
    </div>
  )
}
