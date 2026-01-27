'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/client';
import { resendVerificationEmail } from '@/lib/auth/client';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function UnverifiedPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'loading' | 'unverified' | 'verified' | 'sent'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const result = await getCurrentUser();
      if (result.user) {
        if (result.user.emailVerified) {
          setStatus('verified');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setEmail(result.user.email);
          setStatus('unverified');
        }
      } else {
        // If not logged in, redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      router.push('/login');
    }
  };

  const handleResendEmail = async () => {
    setStatus('loading');
    try {
      const result = await resendVerificationEmail(email);
      if (result.error) {
        setMessage(result.error);
        setStatus('unverified');
      } else {
        setMessage('Verification email sent! Check your inbox.');
        setStatus('sent');
      }
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.');
      setStatus('unverified');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="flex justify-center mb-8">
            <Logo href="/" size="md" />
          </div>
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Checking Status...</h2>
            <p className="text-gray-600">Please wait while we verify your account status.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="flex justify-center mb-8">
            <Logo href="/" size="md" />
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">Your email has been verified. Redirecting to dashboard...</p>
            <div className="flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Store the current status in a variable to help TypeScript
  const currentStatus = status;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="flex justify-center mb-8">
          <Logo href="/" size="md" />
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 mb-2">
            We've sent a verification link to:
          </p>
          <p className="font-medium text-gray-900 mb-6">{email}</p>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${
              currentStatus === 'sent' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
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
              disabled={currentStatus === 'loading'}
              className="w-full border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {currentStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Skip for now (limited features)
            </button>

            <button
              onClick={() => router.push('/logout')}
              className="block text-sm text-gray-600 hover:text-gray-900 mt-4"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}