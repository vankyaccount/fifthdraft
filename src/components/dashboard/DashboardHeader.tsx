'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardHeader({ user, profile }: { user: any; profile: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white shadow-sm lg:static lg:overflow-y-visible">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 lg:border-none">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.subscription_tier === 'enterprise'
                ? 'Unlimited minutes'
                : `${profile?.minutes_used || 0} / ${profile?.minutes_quota || 30} minutes used this month`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Upgrade button for free users */}
            {profile?.subscription_tier === 'free' && (
              <button
                onClick={() => router.push('/dashboard/settings?tab=billing')}
                className="hidden sm:block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
