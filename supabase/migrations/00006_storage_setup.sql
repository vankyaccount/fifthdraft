-- Storage bucket setup for audio recordings
-- This MUST be run in Supabase Dashboard (SQL Editor won't create buckets via migration)

-- Create the recordings bucket (if it doesn't exist)
-- Run this in Supabase Dashboard → Storage → Create new bucket
-- Name: recordings
-- Public: false (private bucket)
-- File size limit: 500 MB
-- Allowed MIME types: audio/*

-- Storage policies for the recordings bucket
-- These policies allow authenticated users to upload/view their own recordings

-- Policy: Users can upload their own recordings
-- Commented out for local development - run in Supabase Dashboard instead
-- INSERT INTO storage.policies (name, bucket_id, definition)
-- VALUES (
--   'Users can upload their own recordings',
--   'recordings',
--   'bucket_id = ''recordings'' AND auth.uid()::text = (storage.foldername(name))[1]'
-- )
-- ON CONFLICT DO NOTHING;

-- Policy: Users can view/download their own recordings
-- Commented out for local development - run in Supabase Dashboard instead
-- INSERT INTO storage.policies (name, bucket_id, definition)
-- VALUES (
--   'Users can view their own recordings',
--   'recordings',
--   'bucket_id = ''recordings'' AND auth.uid()::text = (storage.foldername(name))[1]'
-- )
-- ON CONFLICT DO NOTHING;

-- Policy: Allow service role to delete old recordings (for cleanup job)
-- Commented out for local development - run in Supabase Dashboard instead
-- INSERT INTO storage.policies (name, bucket_id, definition)
-- VALUES (
--   'Service role can delete old recordings',
--   'recordings',
--   'bucket_id = ''recordings'''
-- )
-- ON CONFLICT DO NOTHING;

-- Alternative: Using the new Supabase storage.buckets table (if available)
-- This should work in newer Supabase versions

-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  false,
  524288000, -- 500 MB in bytes
  ARRAY['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/flac', 'audio/aac']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/flac', 'audio/aac']::text[];

-- RLS Policies for storage.objects
-- Allow authenticated users to insert objects in their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to select their own objects
CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own objects
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow service role to delete any object (for cleanup cron)
CREATE POLICY "Service role can delete any recording"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'recordings');
