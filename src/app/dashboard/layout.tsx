import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
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

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
