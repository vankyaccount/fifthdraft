-- ============================================
-- CLEAN RLS POLICIES (Drops existing first)
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recordings
DROP POLICY IF EXISTS "Users can view own recordings" ON public.recordings;
DROP POLICY IF EXISTS "Users can view own recordings or org recordings" ON public.recordings;
DROP POLICY IF EXISTS "Users can insert own recordings" ON public.recordings;
DROP POLICY IF EXISTS "Users can update own recordings" ON public.recordings;
DROP POLICY IF EXISTS "Users can delete own recordings" ON public.recordings;

-- Transcriptions
DROP POLICY IF EXISTS "Users can view own transcriptions" ON public.transcriptions;
DROP POLICY IF EXISTS "Users can insert transcriptions" ON public.transcriptions;

-- Notes
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view own notes or org notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;

-- Action Items
DROP POLICY IF EXISTS "Users can view own action items" ON public.action_items;
DROP POLICY IF EXISTS "Users can view own action items or org action items" ON public.action_items;
DROP POLICY IF EXISTS "Users can insert own action items" ON public.action_items;
DROP POLICY IF EXISTS "Users can update own action items or assigned items" ON public.action_items;
DROP POLICY IF EXISTS "Users can delete own action items" ON public.action_items;

-- Chat
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON public.chat_messages;

-- Sync Queue
DROP POLICY IF EXISTS "Users can view own sync queue" ON public.sync_queue;
DROP POLICY IF EXISTS "Users can insert own sync items" ON public.sync_queue;
DROP POLICY IF EXISTS "Users can update own sync items" ON public.sync_queue;

-- Usage Logs
DROP POLICY IF EXISTS "Users can view own usage logs" ON public.usage_logs;

-- Admin Logs
DROP POLICY IF EXISTS "Admins can view own logs or super admins can view all" ON public.admin_activity_logs;

-- Platform Settings
DROP POLICY IF EXISTS "Super admins can view platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Super admins can manage platform settings" ON public.platform_settings;

-- Note Feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON public.note_feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.note_feedback;

-- ============================================
-- CREATE NEW POLICIES
-- ============================================

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RECORDINGS POLICIES
CREATE POLICY "Users can view own recordings"
  ON public.recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings"
  ON public.recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON public.recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON public.recordings FOR DELETE
  USING (auth.uid() = user_id);

-- TRANSCRIPTIONS POLICIES
CREATE POLICY "Users can view own transcriptions"
  ON public.transcriptions FOR SELECT
  USING (
    recording_id IN (
      SELECT id FROM public.recordings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transcriptions"
  ON public.transcriptions FOR INSERT
  WITH CHECK (
    recording_id IN (
      SELECT id FROM public.recordings WHERE user_id = auth.uid()
    )
  );

-- NOTES POLICIES
CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- ACTION ITEMS POLICIES
CREATE POLICY "Users can view own action items"
  ON public.action_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action items"
  ON public.action_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action items or assigned items"
  ON public.action_items FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = assignee_user_id);

CREATE POLICY "Users can delete own action items"
  ON public.action_items FOR DELETE
  USING (auth.uid() = user_id);

-- CHAT POLICIES
CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own conversations"
  ON public.chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

-- SYNC QUEUE POLICIES
CREATE POLICY "Users can view own sync queue"
  ON public.sync_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync items"
  ON public.sync_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync items"
  ON public.sync_queue FOR UPDATE
  USING (auth.uid() = user_id);

-- USAGE LOGS POLICIES
CREATE POLICY "Users can view own usage logs"
  ON public.usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ADMIN ACTIVITY LOGS POLICIES
CREATE POLICY "Admins can view own logs or super admins can view all"
  ON public.admin_activity_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')
    )
    AND (
      admin_id = auth.uid()
      OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'super_admin')
    )
  );

-- PLATFORM SETTINGS POLICIES
CREATE POLICY "Super admins can view platform settings"
  ON public.platform_settings FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'super_admin')
  );

CREATE POLICY "Super admins can manage platform settings"
  ON public.platform_settings FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'super_admin')
  );

-- NOTE FEEDBACK POLICIES
CREATE POLICY "Users can view own feedback"
  ON public.note_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.note_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
