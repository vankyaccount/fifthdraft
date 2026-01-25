import { getCurrentUserWithProfile } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'

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
