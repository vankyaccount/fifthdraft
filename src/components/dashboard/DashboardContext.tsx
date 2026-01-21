'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name?: string
  subscription_tier: string
  subscription_status?: string
  minutes_quota: number
  minutes_used: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

interface DashboardContextType {
  user: User | null
  profile: Profile | null
  refreshProfile: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({
  children,
  initialProfile,
  initialUser,
}: {
  children: ReactNode
  initialProfile: Profile | null
  initialUser: User | null
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [user] = useState<User | null>(initialUser)

  const refreshProfile = useCallback(async () => {
    if (!user) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }, [user])

  return (
    <DashboardContext.Provider value={{ user, profile, refreshProfile }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
