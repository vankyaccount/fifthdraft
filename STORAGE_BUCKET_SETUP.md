# Storage Bucket Setup - CRITICAL FIX

## Issue
Upload fails with "Failed to upload recording. Please try again." because the storage bucket is not properly configured.

## Root Cause
The `recordings` storage bucket either:
1. Doesn't exist
2. Exists but has no RLS policies allowing authenticated users to upload

## Quick Fix (Supabase Dashboard)

### Step 1: Create the Recordings Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name**: `recordings`
   - **Public bucket**: ❌ **OFF** (keep it private)
   - **File size limit**: `500 MB` (or 524288000 bytes)
   - **Allowed MIME types**:
     - `audio/webm`
     - `audio/mpeg`
     - `audio/mp3`
     - `audio/wav`
     - `audio/m4a`
     - `audio/ogg`
     - `audio/flac`
     - `audio/aac`
4. Click **"Create bucket"**

### Step 2: Set Up RLS Policies

Go to Supabase Dashboard → **Storage** → **Policies** → Select `recordings` bucket

Click **"New policy"** and create these 3 policies:

#### Policy 1: Allow Uploads
```
Policy name: Users can upload to own folder
Allowed operation: INSERT
Target roles: authenticated
WITH CHECK expression:
(bucket_id = 'recordings'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

#### Policy 2: Allow Downloads
```
Policy name: Users can view own files
Allowed operation: SELECT
Target roles: authenticated
USING expression:
(bucket_id = 'recordings'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

#### Policy 3: Allow Deletions
```
Policy name: Users can delete own files
Allowed operation: DELETE
Target roles: authenticated
USING expression:
(bucket_id = 'recordings'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

#### Policy 4: Service Role Cleanup (for cron job)
```
Policy name: Service role can delete any recording
Allowed operation: DELETE
Target roles: service_role
USING expression:
bucket_id = 'recordings'::text
```

### Alternative: Quick SQL Setup (If Supported)

If your Supabase version supports it, you can run this SQL instead:

Go to **SQL Editor** → **New query** → Paste and run:

```sql
-- Create bucket (may require manual creation via UI)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  false,
  524288000,
  ARRAY['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/flac', 'audio/aac']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/flac', 'audio/aac']::text[];

-- RLS Policies
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Service role can delete any recording"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'recordings');
```

## Verify Setup

After setting up the bucket and policies:

1. **Check bucket exists**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'recordings';
   ```
   Should return 1 row.

2. **Check policies exist**:
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'recordings';
   ```
   Should return at least 3 rows (upload, select, delete).

3. **Test upload**:
   - Go to dashboard and try recording a short audio
   - Check browser console for errors
   - If successful, you should see the file in Storage → recordings → [your-user-id]

## Common Errors

### Error: "Failed to upload recording"
**Cause**: Bucket doesn't exist or RLS policies missing
**Fix**: Follow Step 1 and Step 2 above

### Error: "new row violates row-level security policy"
**Cause**: RLS policies are too restrictive or incorrectly configured
**Fix**: Check that your policies use `auth.uid()::text` and match the folder structure `user_id/filename.webm`

### Error: "bucket does not exist"
**Cause**: Bucket not created
**Fix**: Create bucket via Supabase Dashboard → Storage → New bucket

## File Storage Structure

Files are organized by user ID:
```
recordings/
  ├── [user-uuid-1]/
  │   ├── 1704678123456.webm
  │   ├── 1704678234567-system.webm
  │   └── 1704678345678.mp3
  ├── [user-uuid-2]/
  │   ├── 1704678456789.webm
  │   └── ...
  └── ...
```

This structure allows:
- Easy per-user isolation (RLS policies)
- Efficient cleanup (delete entire user folder)
- Clear ownership (folder name = user ID)

## Security Notes

- ✅ Bucket is **private** (public: false)
- ✅ Only authenticated users can upload
- ✅ Users can only access their own folder
- ✅ Service role can delete old files for cleanup
- ✅ 48-hour retention enforced by cron job

## Next Steps

After fixing storage:
1. Test microphone recording
2. Test system audio recording
3. Test file upload
4. Verify files appear in Storage dashboard
5. Check that processing completes successfully
