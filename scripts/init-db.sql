-- FifthDraft Database Initialization Script
-- For self-hosted PostgreSQL deployment on OVHcloud
-- Run this script to initialize a fresh database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- AUTH SCHEMA (Simplified for self-hosted)
-- Note: For production with Supabase Auth, this schema is managed by Supabase
-- This is only for completely self-hosted deployments without Supabase
-- ============================================
CREATE SCHEMA IF NOT EXISTS auth;

-- Create a minimal users table for self-hosted auth
-- In production, you'll likely use Supabase Auth which manages this
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ,
  raw_user_meta_data JSONB DEFAULT '{}'::jsonb
);

-- Auth helper function (stub - real implementation depends on your auth solution)
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
BEGIN
  -- This should be replaced with your actual auth implementation
  -- For Supabase, this function is provided automatically
  RETURN current_setting('request.jwt.claim.sub', true)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'pro_plus', 'team', 'enterprise')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  subscription_current_period_end TIMESTAMPTZ,
  minutes_used INTEGER DEFAULT 0,
  minutes_quota INTEGER DEFAULT 30,
  settings JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('team', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  encryption_enabled BOOLEAN DEFAULT false,
  sso_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- FOLDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366F1',
  icon TEXT DEFAULT 'folder',
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_folder_id);

-- ============================================
-- RECORDINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  title TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('meeting', 'brainstorming')),
  recording_type TEXT DEFAULT 'browser' CHECK (recording_type IN ('browser', 'system', 'upload')),
  whisper_mode BOOLEAN DEFAULT false,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER,
  mime_type TEXT DEFAULT 'audio/webm;codecs=opus',
  audio_format TEXT DEFAULT 'opus',
  sample_rate INTEGER DEFAULT 16000,
  bitrate INTEGER DEFAULT 24000,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'uploading', 'processing', 'completed', 'failed')),
  processing_progress INTEGER DEFAULT 0,
  error_message TEXT,
  recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  audio_deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON public.recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON public.recordings(status);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON public.recordings(created_at DESC);

-- ============================================
-- TRANSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE,
  raw_text TEXT,
  raw_segments JSONB,
  cleaned_text TEXT,
  speakers JSONB,
  speaker_count INTEGER,
  language TEXT,
  confidence REAL,
  word_count INTEGER,
  processing_duration INTEGER,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  mode TEXT CHECK (mode IN ('meeting', 'brainstorming')),
  template_used TEXT,
  structure JSONB,
  mindmap_data JSONB,
  flowchart_data JSONB,
  user_feedback JSONB,
  research_data JSONB,
  project_brief JSONB,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_recording_id ON public.notes(recording_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS notes_embedding_idx ON notes USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- ACTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('task', 'decision', 'deadline')),
  assignee_name TEXT,
  assignee_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  external_id TEXT,
  external_system TEXT,
  synced_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON public.action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON public.action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON public.action_items(due_date);

-- ============================================
-- CHAT TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  context_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  is_proactive BOOLEAN DEFAULT false,
  prompt_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- ============================================
-- SYNC QUEUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  operation TEXT NOT NULL CHECK (operation IN ('create_recording', 'update_note', 'create_action_item', 'delete_item')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_user_status ON public.sync_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON public.sync_queue(created_at);

-- ============================================
-- USAGE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL,
  units_consumed INTEGER,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);

-- ============================================
-- ADMIN ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- ============================================
-- PLATFORM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTE FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.note_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  transcription_accuracy INTEGER CHECK (transcription_accuracy BETWEEN 1 AND 5),
  cleanup_quality INTEGER CHECK (cleanup_quality BETWEEN 1 AND 5),
  action_item_extraction INTEGER CHECK (action_item_extraction BETWEEN 1 AND 5),
  structure_organization INTEGER CHECK (structure_organization BETWEEN 1 AND 5),
  writing_style INTEGER CHECK (writing_style BETWEEN 1 AND 5),
  comments TEXT,
  suggestions TEXT[],
  would_recommend BOOLEAN,
  subscription_tier TEXT,
  note_mode TEXT,
  recording_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRO+ WAITLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pro_plus_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  priority_score INTEGER DEFAULT 0,
  feedback TEXT,
  use_case TEXT,
  company TEXT,
  position_in_queue INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pro_plus_waitlist_status ON public.pro_plus_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_pro_plus_waitlist_priority ON public.pro_plus_waitlist(priority_score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_pro_plus_waitlist_user_id ON public.pro_plus_waitlist(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recordings_updated_at ON public.recordings;
CREATE TRIGGER update_recordings_updated_at BEFORE UPDATE ON public.recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_action_items_updated_at ON public.action_items;
CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update subscription quota function
CREATE OR REPLACE FUNCTION update_subscription_quota()
RETURNS TRIGGER AS $$
BEGIN
  NEW.minutes_quota = CASE NEW.subscription_tier
    WHEN 'free' THEN 30
    WHEN 'pro' THEN 2000
    WHEN 'pro_plus' THEN 4000
    WHEN 'team' THEN 150
    WHEN 'enterprise' THEN 999999
    ELSE 30
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profile_quota ON public.profiles;
CREATE TRIGGER update_profile_quota BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
  EXECUTE FUNCTION update_subscription_quota();

-- Increment minutes used function
CREATE OR REPLACE FUNCTION increment_minutes_used(
  p_user_id UUID,
  p_minutes INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET minutes_used = COALESCE(minutes_used, 0) + p_minutes
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create default folders function
CREATE OR REPLACE FUNCTION create_default_folders()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.folders (user_id, name, description, color, icon, position)
  VALUES (NEW.id, 'Work', 'Work-related notes and meetings', '#3B82F6', 'briefcase', 1);

  INSERT INTO public.folders (user_id, name, description, color, icon, position)
  VALUES (NEW.id, 'Personal', 'Personal ideas and notes', '#10B981', 'home', 2);

  INSERT INTO public.folders (user_id, name, description, color, icon, position)
  VALUES (NEW.id, 'Ideas', 'Brainstorming and creative thinking', '#8B5CF6', 'lightbulb', 3);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created_folders ON public.profiles;
CREATE TRIGGER on_auth_user_created_folders
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_folders();

-- Waitlist position function
CREATE OR REPLACE FUNCTION get_waitlist_position(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  position INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO position
  FROM public.pro_plus_waitlist
  WHERE status = 'pending'
    AND (priority_score > (
      SELECT priority_score FROM public.pro_plus_waitlist WHERE user_id = p_user_id
    ) OR (
      priority_score = (
        SELECT priority_score FROM public.pro_plus_waitlist WHERE user_id = p_user_id
      ) AND created_at < (
        SELECT created_at FROM public.pro_plus_waitlist WHERE user_id = p_user_id
      )
    ));

  RETURN COALESCE(position, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKET (for self-hosted, use MinIO or S3-compatible storage)
-- This is handled by the storage service, not PostgreSQL
-- ============================================

COMMENT ON DATABASE fifthdraft IS 'FifthDraft - AI Meeting Notes & Voice Memo Transcription';
