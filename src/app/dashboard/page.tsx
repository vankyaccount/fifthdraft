"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mic, Sparkles } from 'lucide-react'
import { useDashboard } from '@/components/dashboard/DashboardContext'

interface Recording {
  id: string;
  mode: string;
  status: string;
  created_at: string;
  processing_progress?: number;
  notes?: { id: string; title: string }[];
}

export default function DashboardPage() {
  const { user, profile } = useDashboard();
  const [supabase] = useState(() => createClient());
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecordings = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*, notes(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recordings:', error.message);
      } else {
        setRecordings(data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchRecordings(user.id).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, fetchRecordings]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Start Recording Section - Enhanced */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-8 border-2 border-indigo-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎙️ Start Recording
            </h2>
            <p className="text-gray-600">
              Choose your recording mode to get started
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link
              href="/dashboard/record?mode=meeting"
              className="group relative p-8 bg-white border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-xl transition-all text-center transform hover:-translate-y-1"
            >
              <div className="mb-4 flex justify-center">
                <div className="p-4 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                  <Mic className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="text-xl font-semibold text-indigo-700 mb-2">Meeting Notes</div>
              <div className="text-sm text-gray-600">
                Record meetings and get structured notes with action items
              </div>
            </Link>

            <Link
              href="/dashboard/record?mode=brainstorming"
              className="group relative p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl hover:border-purple-500 hover:shadow-2xl transition-all text-center overflow-hidden transform hover:-translate-y-1"
            >
              {/* Premium Badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                  ✨ Premium
                </span>
              </div>

              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative z-10">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full group-hover:from-purple-300 group-hover:to-pink-300 transition-all">
                    <Sparkles className="w-8 h-8 text-purple-700" />
                  </div>
                </div>
                <div className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">
                  Idea Studio
                </div>
                <div className="text-sm text-gray-700">
                  Transform thoughts into structured insights with AI research
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Recordings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Recordings</h2>
          {recordings && recordings.length > 0 ? (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {recording.notes?.[0]?.title || 'Processing...'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {recording.mode === 'brainstorming' ? 'Idea Studio' : 'Meeting Notes'} • {new Date(recording.created_at).toLocaleDateString()}
                      {recording.status === 'processing' && (
                        <span className="ml-2 text-indigo-600">
                          Processing... {recording.processing_progress}%
                        </span>
                      )}
                    </div>
                  </div>
                  {recording.status === 'completed' && recording.notes?.[0] && (
                    <Link
                      href={`/dashboard/notes/${recording.notes[0].id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Note →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No recordings yet. Start by recording your first note!
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Total Recordings</div>
              <div className="text-2xl font-bold text-gray-900">{recordings?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Minutes Remaining</div>
              <div className="text-2xl font-bold text-indigo-600">
                {(profile?.minutes_quota || 30) - (profile?.minutes_used || 0)}
              </div>
            </div>
          </div>

          {profile?.subscription_tier === 'free' && (
            <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="text-sm font-medium text-indigo-900 mb-2">
                ✨ Upgrade to Pro
              </div>
              <div className="text-xs text-indigo-700 mb-3">
                Get 2000 mins/year, Idea Studio, and lifetime transcripts for just $90/year!
              </div>
              <Link
                href="/pricing"
                className="block w-full text-center py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
