# Fix System Audio Recording Error

**Date**: January 10, 2026
**Issue**: System Audio Capture fails to save with error: "Failed to upload recording"
**Status**: ⏳ Requires Database Migration

---

## Root Cause

The system audio capture feature **is fully implemented** in the code, but the database is missing the `recording_type` column that the code tries to insert.

**What's happening:**
1. User selects "System Audio Capture" tab
2. Records system audio + microphone successfully
3. Code tries to insert recording with `recording_type: 'system_audio'` (line 233 in SystemAudioRecorder.tsx)
4. ❌ **Database error**: Column `recording_type` doesn't exist
5. User sees: "Failed to upload recording. Please try again."

**The migration file exists** (`00004_add_recording_type.sql`) but **hasn't been run** in your Supabase database.

---

## Solution

Run the missing migration in Supabase SQL Editor.

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration

Copy and paste this SQL:

```sql
-- Add recording_type column to recordings table
-- This tracks the source of the recording for analytics and features

ALTER TABLE recordings
ADD COLUMN recording_type TEXT DEFAULT 'microphone'
CHECK (recording_type IN ('microphone', 'file_upload', 'system_audio'));

-- Add index for filtering by recording type
CREATE INDEX idx_recordings_type ON recordings(recording_type);

-- Add index for combined queries (user + type)
CREATE INDEX idx_recordings_user_type ON recordings(user_id, recording_type);

-- Update existing recordings to have explicit type
UPDATE recordings
SET recording_type = CASE
  WHEN storage_path LIKE '%.webm' THEN 'microphone'
  WHEN storage_path LIKE '%system%' THEN 'system_audio'
  ELSE 'file_upload'
END
WHERE recording_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN recordings.recording_type IS 'Source of the recording: microphone (browser recording), file_upload (uploaded audio file), system_audio (system + mic capture)';
```

### Step 3: Execute

1. Click **RUN** (or press Ctrl+Enter / Cmd+Enter)
2. Wait for "Success" message
3. Verify output shows: `ALTER TABLE`, `CREATE INDEX` (x2), `UPDATE` statements succeeded

---

## What This Migration Does

### 1. Adds `recording_type` Column
- Type: TEXT
- Default: 'microphone'
- Allowed values: 'microphone', 'file_upload', 'system_audio'

### 2. Creates Indexes
- Fast filtering by recording type
- Combined user + type queries

### 3. Backfills Existing Data
- Existing `.webm` recordings → 'microphone'
- Recordings with 'system' in path → 'system_audio'
- Everything else → 'file_upload'

---

## After Running Migration

### Test System Audio Recording:

1. Go to http://localhost:3000/dashboard/record?mode=meeting
2. Click **"System Audio Capture"** tab (toggle at the top)
3. Click **"Start System + Mic Recording"**
4. Browser shows permission dialog:
   - Select tab/window to share
   - **✅ CHECK "Share tab audio" or "Share system audio"**
   - Allow microphone access
5. Click "Share"
6. Play audio (YouTube, Zoom call, etc.)
7. Click **"Stop Recording"**
8. ✅ Should now upload successfully!

---

## Common Issues After Fix

### Issue 1: "Failed to upload" still appears
**Cause**: Didn't check "Share audio" in browser dialog
**Fix**: When prompted, make sure to CHECK the audio sharing checkbox

### Issue 2: No audio captured
**Cause**: Selected wrong tab or didn't enable audio
**Fix**: Select the tab with audio playing AND check audio sharing

### Issue 3: "Browser Not Supported"
**Cause**: Using Safari or Firefox
**Fix**: Use Chrome or Edge (only browsers that support system audio)

---

## How System Audio Works

**Technical Implementation:**

1. **Requests System Audio** via `getDisplayMedia`:
   ```typescript
   const systemStream = await navigator.mediaDevices.getDisplayMedia({
     video: true,  // Required by Chrome/Edge
     audio: { ... }
   })
   ```
   - Video track is immediately stopped and discarded
   - Only audio is kept

2. **Requests Microphone**:
   ```typescript
   const micStream = await navigator.mediaDevices.getUserMedia({
     audio: { ... }
   })
   ```

3. **Mixes Both Streams** using Web Audio API:
   ```typescript
   const audioContext = new AudioContext()
   const systemSource = audioContext.createMediaStreamSource(systemStream)
   const micSource = audioContext.createMediaStreamSource(micStream)
   const destination = audioContext.createMediaStreamDestination()

   systemSource.connect(destination)
   micSource.connect(destination)
   ```

4. **Records Mixed Audio**:
   - Opus codec at 128kbps (higher than microphone-only 24kbps)
   - 48kHz sample rate (higher quality for dual source)
   - ~0.96 MB per minute (vs 0.18 MB for microphone only)

5. **Uploads with `recording_type`**:
   ```typescript
   await supabase.from('recordings').insert({
     // ... other fields
     recording_type: 'system_audio'  // ← This requires the migration!
   })
   ```

---

## File Reference

**Migration File**: `supabase/migrations/00004_add_recording_type.sql`

**Code Files**:
- `src/components/audio/SystemAudioRecorder.tsx` - System audio implementation
- `src/components/audio/AudioRecorder.tsx` - Microphone-only implementation
- `src/app/dashboard/record/page.tsx` - Page with recording mode selector

**Database Table**: `public.recordings`
**New Column**: `recording_type TEXT`

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| System audio fails to save | Missing `recording_type` column in database | Run migration `00004_add_recording_type.sql` |
| Error: "Failed to upload recording" | Database INSERT fails due to missing column | Execute SQL in Supabase Dashboard |
| Status | ⏳ **Migration not run** | ✅ **Run the migration now** |

---

## Next Steps

1. ✅ **Run the migration** (see Step 1-3 above)
2. ✅ **Test system audio recording**
3. ✅ **Verify upload succeeds**
4. Optional: Also run `00005_increment_minutes_used_function.sql` to fix minutes tracking
5. Optional: Run `00006_storage_setup.sql` to configure storage bucket RLS policies

---

## Important Notes

- **System Audio Capture** is a PREMIUM feature - works in Chrome/Edge only
- **Browser will show video preview** but only audio is captured
- **User MUST check audio sharing** in the permission dialog
- **48-hour retention** applies to all recordings (including system audio)
- **Higher quality** (128kbps vs 24kbps) due to dual audio sources

---

## Success Criteria

After running the migration, you should see:
- ✅ System audio recording completes without errors
- ✅ Recording appears in dashboard with "system_audio" type
- ✅ Transcription processes normally
- ✅ Note is created with both system and microphone audio content
