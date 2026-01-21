'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { Settings, CheckCircle, AlertCircle, User, CreditCard, Trash2, X } from 'lucide-react'

interface WritingPreference {
  style: 'formal' | 'casual' | 'technical' | 'creative'
  detail_level: 'brief' | 'standard' | 'detailed'
  tone: 'professional' | 'friendly' | 'neutral'
  include_timestamps: boolean
  include_speaker_labels: boolean
}

interface UserSettings {
  id: string
  writing_preference: WritingPreference
  updated_at: string
}

const WRITING_STYLES = [
  {
    id: 'formal',
    name: 'Formal',
    description: 'Professional and structured writing style suitable for business documents',
    icon: '📋'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Friendly and conversational writing style for relaxed notes',
    icon: '💬'
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Technical terminology and precision for specialized content',
    icon: '⚙️'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Expressive and narrative-driven writing for brainstorming',
    icon: '✨'
  }
]

const DETAIL_LEVELS = [
  {
    id: 'brief',
    name: 'Brief',
    description: 'Key points and summary only'
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced detail with main points and examples'
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Comprehensive with all details and nuances'
  }
]

const TONES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Maintains business standards and decorum'
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm and approachable tone'
  },
  {
    id: 'neutral',
    name: 'Neutral',
    description: 'Objective and impartial presentation'
  }
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile } = useDashboard()
  const [supabase] = useState(() => createClient())
  const [fullName, setFullName] = useState('')
  const [preferences, setPreferences] = useState<WritingPreference>({
    style: 'formal',
    detail_level: 'standard',
    tone: 'professional',
    include_timestamps: true,
    include_speaker_labels: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    if (user && profile) {
      fetchSettings()
    }
  }, [user, profile])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // Initialize full name from profile
      setFullName(profile?.full_name || '')

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error)
        return
      }

      if (data) {
        setPreferences(data.writing_preference || preferences)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    try {
      setSaving(true)
      setMessage(null)

      // Update profile with new full name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      // Update writing preferences
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert(
          {
            id: user.id,
            writing_preference: preferences,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        )

      if (settingsError) {
        throw settingsError
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleBillingPortal = async () => {
    setBillingLoading(true)
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      window.location.href = data.url
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to open billing portal' })
      setBillingLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return
    }

    setDeleteLoading(true)
    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      // Account deleted successfully - redirect to home and show message
      alert('Account successfully deleted. All your data has been removed.')
      router.push('/')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account. Please try again.' })
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">Customize your profile and note-taking preferences</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <p
            className={`${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">This name will appear in the dashboard and your notes.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">Your email cannot be changed here.</p>
          </div>
        </div>
      </div>

      {/* Writing Style Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Writing Style</h2>
        <p className="text-gray-600 mb-6">Choose how your notes should be written</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WRITING_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setPreferences({ ...preferences, style: style.id as WritingPreference['style'] })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                preferences.style === style.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{style.icon}</div>
              <h3 className="font-semibold text-gray-900">{style.name}</h3>
              <p className="text-sm text-gray-600">{style.description}</p>
              {preferences.style === style.id && (
                <div className="mt-2 text-indigo-600 text-sm font-medium">✓ Selected</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Level Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Level of Detail</h2>
        <p className="text-gray-600 mb-6">How much detail should be included in your notes</p>

        <div className="space-y-3">
          {DETAIL_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setPreferences({ ...preferences, detail_level: level.id as WritingPreference['detail_level'] })}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                preferences.detail_level === level.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{level.name}</h3>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
                {preferences.detail_level === level.id && (
                  <div className="text-indigo-600 text-lg">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tone Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tone</h2>
        <p className="text-gray-600 mb-6">Set the overall tone for your notes</p>

        <div className="space-y-3">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setPreferences({ ...preferences, tone: tone.id as WritingPreference['tone'] })}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                preferences.tone === tone.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{tone.name}</h3>
                  <p className="text-sm text-gray-600">{tone.description}</p>
                </div>
                {preferences.tone === tone.id && (
                  <div className="text-indigo-600 text-lg">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Options Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Options</h2>

        <div className="space-y-4">
          <label className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={preferences.include_timestamps}
              onChange={(e) =>
                setPreferences({ ...preferences, include_timestamps: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
            />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">Include Timestamps</h3>
              <p className="text-sm text-gray-600">Add time references for important points</p>
            </div>
          </label>

          <label className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={preferences.include_speaker_labels}
              onChange={(e) =>
                setPreferences({ ...preferences, include_speaker_labels: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
            />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">Include Speaker Labels</h3>
              <p className="text-sm text-gray-600">Identify who said what in conversations</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* User Info */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium text-gray-900 capitalize">{profile?.subscription_tier || 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Management */}
      {(profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'pro_plus') && profile?.stripe_customer_id && (
        <div className="mt-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Subscription Management</h2>
            </div>
            <p className="text-gray-600 mb-4">Manage your subscription, payment method, and billing information.</p>
            <button
              onClick={handleBillingPortal}
              disabled={billingLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {billingLoading ? 'Opening...' : 'Manage Subscription'}
            </button>
            <p className="text-sm text-gray-500 mt-3">You can cancel your subscription, update your payment method, or view billing history in the Stripe portal.</p>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="mt-8">
        <div className="bg-white rounded-lg border-2 border-red-200 shadow-sm p-6 bg-red-50">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
          </div>
          <p className="text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Account?</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900 font-semibold mb-2">This action cannot be undone.</p>
                <p className="text-sm text-red-800">Deleting your account will permanently remove:</p>
                <ul className="text-sm text-red-800 mt-2 ml-4 space-y-1">
                  <li>• All recordings and audio files</li>
                  <li>• All notes and transcriptions</li>
                  <li>• All action items</li>
                  <li>• Account data and settings</li>
                  {(profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'pro_plus') && (
                    <li>• Active subscription</li>
                  )}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-semibold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
