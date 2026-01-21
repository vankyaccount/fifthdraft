'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mic, Sparkles } from 'lucide-react'

export default function DashboardNav({ profile }: { profile: any }) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Meeting Notes',
      href: '/dashboard/record?mode=meeting',
      icon: <Mic className="w-6 h-6" />
    },
    {
      name: 'Idea Studio',
      href: '/dashboard/record?mode=brainstorming',
      icon: <Sparkles className="w-6 h-6" />,
      isPremium: true
    },
    {
      name: 'Notes',
      href: '/dashboard/notes',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">FifthDraft</h1>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-indigo-600">FifthDraft</h1>
          </div>

          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href.split('?')[0] + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? item.isPremium
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700'
                          : 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`mr-3 ${
                        isActive
                          ? item.isPremium ? 'text-purple-600' : 'text-indigo-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </div>
                    {item.isPremium && (
                      <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full">
                        Pro
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User info at bottom */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {profile?.subscription_tier || 'Free'} Plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <nav className="flex justify-around">
          {navigation.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href.split('?')[0] + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-2 px-1 relative ${
                  isActive
                    ? item.isPremium ? 'text-purple-600' : 'text-indigo-600'
                    : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1 text-center leading-tight">{item.name}</span>
                {item.isPremium && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
