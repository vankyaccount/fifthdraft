export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'pro_plus' | 'team' | 'enterprise'
          role: 'user' | 'admin' | 'super_admin'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          subscription_current_period_end: string | null
          minutes_used: number
          minutes_quota: number
          settings: Json
          onboarding_completed: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'pro_plus' | 'team' | 'enterprise'
          role?: 'user' | 'admin' | 'super_admin'
          settings?: Json
          onboarding_completed?: boolean
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'pro_plus' | 'team' | 'enterprise'
          settings?: Json
          onboarding_completed?: boolean
        }
      }
      recordings: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          title: string | null
          mode: 'meeting' | 'brainstorming'
          whisper_mode: boolean
          storage_path: string
          file_size: number | null
          duration: number | null
          mime_type: string
          audio_format: string
          sample_rate: number
          bitrate: number
          status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed'
          processing_progress: number
          error_message: string | null
          recorded_at: string | null
          created_at: string
          updated_at: string
          audio_deleted_at: string | null
        }
        Insert: {
          user_id: string
          title?: string | null
          mode: 'meeting' | 'brainstorming'
          whisper_mode?: boolean
          storage_path: string
          duration?: number | null
          status?: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed'
        }
      }
      notes: {
        Row: {
          id: string
          recording_id: string
          user_id: string
          organization_id: string | null
          title: string
          content: string
          summary: string | null
          tags: string[]
          mode: 'meeting' | 'brainstorming' | null
          template_used: string | null
          structure: Json | null
          mindmap_data: Json | null
          flowchart_data: Json | null
          user_feedback: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          recording_id: string
          user_id: string
          title: string
          content: string
          summary?: string | null
          mode?: 'meeting' | 'brainstorming' | null
        }
      }
      action_items: {
        Row: {
          id: string
          note_id: string
          recording_id: string
          user_id: string
          title: string
          description: string | null
          type: 'task' | 'decision' | 'deadline' | null
          assignee_name: string | null
          assignee_user_id: string | null
          due_date: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'canceled'
          priority: 'low' | 'medium' | 'high' | 'urgent' | null
          external_id: string | null
          external_system: string | null
          synced_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
      }
      pro_plus_waitlist: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          status: 'pending' | 'approved' | 'rejected' | 'converted'
          priority_score: number
          feedback: string | null
          use_case: string | null
          company: string | null
          position_in_queue: number | null
          created_at: string
          updated_at: string
          approved_at: string | null
          invited_at: string | null
        }
        Insert: {
          user_id: string
          email: string
          full_name?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'converted'
          priority_score?: number
          feedback?: string | null
          use_case?: string | null
          company?: string | null
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected' | 'converted'
          priority_score?: number
          feedback?: string | null
          use_case?: string | null
          company?: string | null
          approved_at?: string | null
          invited_at?: string | null
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Recording = Database['public']['Tables']['recordings']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type ActionItem = Database['public']['Tables']['action_items']['Row']
export type ProPlusWaitlist = Database['public']['Tables']['pro_plus_waitlist']['Row']

// Subscription tier type
export type SubscriptionTier = 'free' | 'pro' | 'pro_plus' | 'team' | 'enterprise'

export interface UserPreferences {
  writing_style?: {
    tone: 'professional' | 'casual' | 'academic' | 'creative'
    formality: 'formal' | 'balanced' | 'informal'
    verbosity: 'concise' | 'balanced' | 'detailed'
    person: 'first-person' | 'third-person' | 'passive'
    formatting: 'paragraphs' | 'bullet-points' | 'mixed'
  }
  note_structure?: {
    template: 'default' | 'executive' | 'technical' | 'creative' | 'custom'
    sections: {
      summary: boolean
      keyPoints: boolean
      fullTranscript: boolean
      actionItems: boolean
      decisions: boolean
      questions: boolean
      timestamps: boolean
      speakers: boolean
      tags: boolean
      relatedNotes: boolean
    }
    granularity: 'high-level' | 'standard' | 'detailed'
    headingStyle: 'h1-h2-h3' | 'numbered' | 'emoji' | 'minimal'
  }
  output?: {
    autoExport: boolean
    defaultExportFormat: 'markdown' | 'pdf' | 'docx' | 'txt' | 'notion'
    includeMetadata: boolean
    languagePreference: string
    feedbackFrequency: 'always' | 'occasional' | 'never'
  }
}
