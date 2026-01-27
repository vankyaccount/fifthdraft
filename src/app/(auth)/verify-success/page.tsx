'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function VerifySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const verified = searchParams.get('verified');
  
  useEffect(() => {
    if (verified === 'true') {
      // Wait a moment to ensure cookies are processed, then redirect to dashboard
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      // If not verified, redirect to login
      router.push('/login');
    }
  }, [router, verified]);

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
          <p className="text-gray-600 mb-4">Your email has been successfully verified.</p>
          <div className="flex items-center justify-center text-gray-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    </div>
  );
}