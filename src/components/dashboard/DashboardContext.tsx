'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface User {
  id: string
  email: string
}

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

    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setProfile(data.profile)
        }
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
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
