import { getCurrentUserWithProfile } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'
import { query } from '@/lib/db/postgres'

// Helper function to check if user's email is verified
async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    const result = await query<{ email_verified: boolean }>(
      'SELECT email_verified FROM auth_users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].email_verified;
  } catch (error) {
    console.error('Error checking email verification status:', error);
    return false; // Default to false if there's an error
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getCurrentUserWithProfile()

  if (!result) {
    // Don't perform a server-side redirect here to avoid conflict with
    // the middleware redirect rules which can cause redirect loops.
    // Instead render a simple fallback prompting the user to log in.
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold">You are not signed in</h2>
          <p className="mt-2 text-sm text-neutral-600">Please <a href="/login" className="text-primary-600 underline">sign in</a> to access the dashboard.</p>
        </div>
      </div>
    )
  }

  const { user, profile } = result

  // Check if user's email is verified, if not redirect to unverified page
  const isVerified = await isEmailVerified(user.id);
  if (!isVerified) {
    // Render a simple page prompting the user to verify their email
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md w-full space-y-8 p-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold">Verify Your Email</h2>
          <p className="text-gray-600">Please verify your email address to access the dashboard.</p>
          <div className="mt-6">
            <a
              href="/unverified"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Verification Page
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Didn't receive the verification email? Check your spam folder or <a href="/unverified" className="text-indigo-600 hover:underline">resend verification</a>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DashboardProvider initialProfile={profile} initialUser={user}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        <DashboardNav profile={profile} />

        {/* Main Content */}
        <div className="lg:pl-64">
          <DashboardHeader user={user} profile={profile} />
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
