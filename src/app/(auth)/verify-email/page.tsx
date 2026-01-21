'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const checkVerification = async () => {
      // Check if there's a token in the URL (from email link)
      const token = searchParams.get('token')
      const type = searchParams.get('type')

      if (token && type === 'email') {
        setStatus('verifying')
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          })

          if (error) {
            setStatus('error')
            setMessage(error.message)
          } else {
            setStatus('success')
            setMessage('Your email has been verified!')
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } catch (err) {
          setStatus('error')
          setMessage('Verification failed. Please try again.')
        }
      } else {
        // No token - show pending state
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setEmail(user.email || '')
          if (user.email_confirmed_at) {
            setStatus('success')
            setMessage('Your email is already verified!')
          } else {
            setStatus('pending')
          }
        } else {
          // Not logged in
          router.push('/login')
        }
      }
    }

    checkVerification()
  }, [searchParams, supabase, router])

  const handleResendEmail = async () => {
    setStatus('verifying')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        setStatus('error')
        setMessage(error.message)
      } else {
        setStatus('pending')
        setMessage('Verification email sent! Check your inbox.')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Failed to resend email. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="flex justify-center mb-8">
          <Logo href="/" size="md" />
        </div>

        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-2">{message}</p>
            <p className="text-gray-500 text-sm mb-6">
              The link may have expired or been used already.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Resend Verification Email
              </button>
              <Link
                href="/login"
                className="block text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* Pending State - Waiting for user to check email */}
        {status === 'pending' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-2">
              We've sent a verification link to:
            </p>
            <p className="font-medium text-gray-900 mb-6">{email}</p>

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {message}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Didn't receive the email?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                className="w-full border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                Resend Verification Email
              </button>
              <Link
                href="/dashboard"
                className="block text-gray-600 hover:text-gray-900"
              >
                Skip for now (limited features)
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading fallback component
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="flex justify-center mb-8">
          <Logo href="/" size="md" />
        </div>
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense wrapper
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
