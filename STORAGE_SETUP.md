# Supabase Storage Setup

Before you can upload recordings, you need to create a storage bucket in Supabase.

## Steps to Create Storage Bucket

1. **Go to Supabase Storage**
   - Navigate to: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/storage/buckets

2. **Create New Bucket**
   - Click "New bucket"
   - Bucket name: `recordings`
   - Public bucket: ❌ **NO** (Keep private for user security)
   - Click "Create bucket"

3. **Set Up Storage Policies**
   Go to the SQL Editor and run these policies:

   ```sql
   -- Allow users to upload their own recordings
   CREATE POLICY "Users can upload own recordings"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'recordings' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Allow users to read their own recordings
   CREATE POLICY "Users can read own recordings"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'recordings' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Allow users to delete their own recordings
   CREATE POLICY "Users can delete own recordings"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'recordings' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Allow service role to access all recordings (for transcription processing)
   CREATE POLICY "Service role can access all recordings"
   ON storage.objects FOR ALL
   TO service_role
   USING (bucket_id = 'recordings');
   ```

4. **Verify Setup**
   - Go back to Storage > recordings bucket
   - You should see the bucket is created
   - Policies should be active

## Alternative: Run Setup Script

You can also run this all-in-one SQL script in the Supabase SQL Editor:

```sql
-- Create storage bucket (if doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Service role can access all recordings" ON storage.objects;

-- Create policies
CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Service role can access all recordings"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'recordings');
```

## Testing Storage

After setup, test the storage:

1. Go to your app: http://localhost:3000/dashboard
2. Click "Meeting Notes" or "Brainstorming"
3. Click "Start Recording"
4. Record for a few seconds
5. Click "Stop Recording"
6. Check Supabase Storage dashboard - you should see the uploaded file

## Storage Configuration

- **File Path Format:** `{user_id}/{timestamp}.webm`
- **Audio Format:** Opus codec in WebM container
- **Sample Rate:** 16kHz mono
- **Bitrate:** 24 kbps
- **Storage Size:** ~0.18 MB per minute
- **Retention:** Audio auto-deleted after 48 hours

## Troubleshooting

### "Failed to upload recording"
1. Check storage bucket exists and is named `recordings`
2. Verify storage policies are created
3. Check browser console for detailed error
4. Ensure user is authenticated

### "Permission denied"
- Verify RLS policies are correct
- Check user is authenticated
- Try recreating the policies with the script above

### "Bucket not found"
- Create the bucket manually in Supabase dashboard
- Or run the setup SQL script

---

**Next Steps:** Once storage is set up, test the full recording → transcription → notes flow.
