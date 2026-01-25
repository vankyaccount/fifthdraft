"use client";

import { useEffect, useState, useCallback } from 'react';
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
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecordings = useCallback(async (userId: string) => {
    try {
      // For now, just use empty data since we removed Supabase
      // TODO: Implement API endpoint to fetch recordings
      setRecordings([]);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Recordings</h2>
            <Link
              href="/record"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Mic className="w-4 h-4 mr-2" />
              New Recording
            </Link>
          </div>

          {recordings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No recordings yet. Start by creating your first recording!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div key={recording.id} className="p-4 border rounded-lg hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{recording.mode === 'brainstorming' ? 'Idea Studio' : 'Meeting'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(recording.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {recording.status === 'completed' && recording.notes && recording.notes.length > 0 ? (
                        <Link
                          href={`/dashboard/notes/${recording.notes[0].id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          View Note →
                        </Link>
                      ) : (
                        <span className="text-gray-400">{recording.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow p-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-purple-900">Idea Studio</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Transform brainstorming sessions into structured ideas with AI-powered insights.
          </p>
          <Link
            href="/record?mode=brainstorming"
            className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Brainstorming
          </Link>
        </div>

        {profile && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className="ml-2 font-medium capitalize">{profile.subscription_tier || 'free'}</span>
              </div>
              {profile.subscription_tier === 'free' && (
                <Link href="/pricing" className="block mt-4 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Upgrade to Pro
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
