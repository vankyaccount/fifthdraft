-- ============================================
-- FIX: Change recordings.user_id to reference auth.users instead of profiles
-- This fixes the foreign key constraint error when profile doesn't exist yet
-- ============================================

-- Drop the existing foreign key constraint
ALTER TABLE public.recordings
DROP CONSTRAINT IF EXISTS recordings_user_id_fkey;

-- Add new foreign key constraint referencing auth.users
ALTER TABLE public.recordings
ADD CONSTRAINT recordings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also fix other tables that have the same issue (referencing profiles instead of auth.users)
-- These can cause similar problems

-- organization_members
ALTER TABLE public.organization_members
DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey;

ALTER TABLE public.organization_members
ADD CONSTRAINT organization_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- transcripts (skip if table doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transcripts') THEN
    ALTER TABLE public.transcripts DROP CONSTRAINT IF EXISTS transcripts_user_id_fkey;
    ALTER TABLE public.transcripts ADD CONSTRAINT transcripts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- action_items
ALTER TABLE public.action_items
DROP CONSTRAINT IF EXISTS action_items_user_id_fkey;

ALTER TABLE public.action_items
ADD CONSTRAINT action_items_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.action_items
DROP CONSTRAINT IF EXISTS action_items_assignee_user_id_fkey;

ALTER TABLE public.action_items
ADD CONSTRAINT action_items_assignee_user_id_fkey
FOREIGN KEY (assignee_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- shared_transcripts (skip if table doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shared_transcripts') THEN
    ALTER TABLE public.shared_transcripts DROP CONSTRAINT IF EXISTS shared_transcripts_user_id_fkey;
    ALTER TABLE public.shared_transcripts ADD CONSTRAINT shared_transcripts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- usage_logs
ALTER TABLE public.usage_logs
DROP CONSTRAINT IF EXISTS usage_logs_user_id_fkey;

ALTER TABLE public.usage_logs
ADD CONSTRAINT usage_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- meeting_templates (skip if table doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meeting_templates') THEN
    ALTER TABLE public.meeting_templates DROP CONSTRAINT IF EXISTS meeting_templates_user_id_fkey;
    ALTER TABLE public.meeting_templates ADD CONSTRAINT meeting_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- admin_logs (skip if table doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_logs') THEN
    ALTER TABLE public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey;
    ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    ALTER TABLE public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_target_user_id_fkey;
    ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- app_settings (skip if table doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_settings') THEN
    ALTER TABLE public.app_settings DROP CONSTRAINT IF EXISTS app_settings_updated_by_fkey;
    ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);
  END IF;
END $$;

-- api_keys (skip if table doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
    ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
    ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
