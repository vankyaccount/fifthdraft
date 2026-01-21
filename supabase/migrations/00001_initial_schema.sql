-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team', 'enterprise')),
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
CREATE TABLE public.organizations (
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

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- RECORDINGS TABLE
-- ============================================
CREATE TABLE public.recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,

  title TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('meeting', 'brainstorming')),
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

CREATE INDEX idx_recordings_user_id ON public.recordings(user_id);
CREATE INDEX idx_recordings_status ON public.recordings(status);
CREATE INDEX idx_recordings_created_at ON public.recordings(created_at DESC);

-- ============================================
-- TRANSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.transcriptions (
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
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,

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

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_recording_id ON public.notes(recording_id);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);

-- ============================================
-- ACTION ITEMS TABLE
-- ============================================
CREATE TABLE public.action_items (
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

CREATE INDEX idx_action_items_user_id ON public.action_items(user_id);
CREATE INDEX idx_action_items_status ON public.action_items(status);
CREATE INDEX idx_action_items_due_date ON public.action_items(due_date);

-- ============================================
-- CHAT TABLES
-- ============================================
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  title TEXT,
  context_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
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

CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- ============================================
-- SYNC QUEUE TABLE
-- ============================================
CREATE TABLE public.sync_queue (
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

CREATE INDEX idx_sync_queue_user_status ON public.sync_queue(user_id, status);
CREATE INDEX idx_sync_queue_created_at ON public.sync_queue(created_at);

-- ============================================
-- USAGE LOGS TABLE
-- ============================================
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,

  resource_type TEXT NOT NULL,
  units_consumed INTEGER,

  recording_id UUID REFERENCES public.recordings(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at);

-- ============================================
-- ADMIN ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB,
  ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- ============================================
-- PLATFORM SETTINGS TABLE
-- ============================================
CREATE TABLE public.platform_settings (
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
CREATE TABLE public.note_feedback (
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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recordings_updated_at BEFORE UPDATE ON public.recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update subscription quota function
CREATE OR REPLACE FUNCTION update_subscription_quota()
RETURNS TRIGGER AS $$
BEGIN
  NEW.minutes_quota = CASE NEW.subscription_tier
    WHEN 'free' THEN 30
    WHEN 'pro' THEN 100
    WHEN 'team' THEN 150
    WHEN 'enterprise' THEN 999999
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_quota BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
  EXECUTE FUNCTION update_subscription_quota();
