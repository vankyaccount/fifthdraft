# Fix Minutes Tracking Issue

**Date**: January 10, 2026
**Issue**: Dashboard shows "0 / 30 minutes used" even after recordings
**Status**: ⏳ Requires Database Migration

---

## Root Cause

The minutes tracking code **is fully implemented** in the application, but the database is missing the `increment_minutes_used` PostgreSQL function that the code tries to call.

**What's happening:**
1. User records audio successfully (duration tracked correctly in seconds)
2. Recording completes and processes successfully
3. Code tries to call `increment_minutes_used` database function (line 479 in `/api/transcribe/route.ts`)
4. ❌ **Database error**: Function `increment_minutes_used` doesn't exist
5. Minutes remain at 0, quota not updated

**The migration file exists** (`00005_increment_minutes_used_function.sql`) but **hasn't been run** in your Supabase database.

---

## Evidence from Code

### File: `src/app/api/transcribe/route.ts` (Lines 477-484)

```typescript
// Update user's minutes_used
const minutesToAdd = Math.ceil((recording.duration || 0) / 60) // Convert seconds to minutes
await supabase.rpc('increment_minutes_used', {
  user_id: recording.user_id,
  minutes: minutesToAdd
})

console.log(`Updated minutes_used for user ${recording.user_id}: +${minutesToAdd} minutes`)
```

**This code:**
- Calculates minutes from recording duration (stored in seconds)
- Calls `increment_minutes_used` PostgreSQL function
- Should update `profiles.minutes_used` column

### Server Logs Show:
```
Updated minutes_used for user a9e239ea-9224-49c3-9083-8e23f20a6464: +0 minutes
```

**Why +0 minutes?**
The function call likely **fails silently** because the function doesn't exist, so the update doesn't happen and logs show 0.

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
-- Function to safely increment user's minutes_used
-- This uses atomic increment to avoid race conditions

CREATE OR REPLACE FUNCTION increment_minutes_used(
  user_id UUID,
  minutes INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET minutes_used = COALESCE(minutes_used, 0) + minutes
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_minutes_used(UUID, INTEGER) TO authenticated;
```

### Step 3: Execute

1. Click **RUN** (or press Ctrl+Enter / Cmd+Enter)
2. Wait for "Success" message
3. Verify output shows: `CREATE FUNCTION`, `GRANT` statements succeeded

---

## What This Migration Does

### 1. Creates `increment_minutes_used` Function

**Purpose**: Safely update user's minutes quota using atomic increment (prevents race conditions)

**Parameters:**
- `user_id` (UUID) - The user whose minutes to update
- `minutes` (INTEGER) - Number of minutes to add

**How it works:**
```sql
UPDATE profiles
SET minutes_used = COALESCE(minutes_used, 0) + minutes
WHERE id = user_id;
```

- Uses `COALESCE` to handle NULL values (treats NULL as 0)
- Atomically increments the minutes (safe for concurrent updates)
- `SECURITY DEFINER` allows function to run with elevated privileges

### 2. Grants Execute Permission

```sql
GRANT EXECUTE ON FUNCTION increment_minutes_used(UUID, INTEGER) TO authenticated;
```

- Allows authenticated users to call this function
- Required for the API route to work

---

## How Minutes Tracking Works (Technical Details)

### Recording Process:

1. **User starts recording** (AudioRecorder or SystemAudioRecorder component)
   - Timer starts: `setDuration(0)`
   - Every second: `setDuration(prev => prev + 1)`

2. **User stops recording**
   - Duration captured in seconds (e.g., 125 seconds = 2 minutes 5 seconds)

3. **Recording uploaded to Supabase Storage**
   ```typescript
   await supabase.from('recordings').insert([{
     user_id: user.id,
     mode,
     storage_path: fileName,
     file_size: audioBlob.size,
     duration: duration,  // ← Stored in SECONDS (e.g., 125)
     status: 'queued',
   }])
   ```

4. **Transcription API processes the recording**
   - `/api/transcribe` endpoint receives `recordingId`
   - Fetches recording from database
   - Converts seconds to minutes:
     ```typescript
     const minutesToAdd = Math.ceil((recording.duration || 0) / 60)
     // 125 seconds → Math.ceil(125/60) → Math.ceil(2.08) → 3 minutes
     ```

5. **Updates user quota**
   ```typescript
   await supabase.rpc('increment_minutes_used', {
     user_id: recording.user_id,
     minutes: minutesToAdd  // e.g., 3 minutes
   })
   ```

6. **Function updates database** (after migration is run)
   ```sql
   UPDATE profiles
   SET minutes_used = minutes_used + 3  -- Old value + new minutes
   WHERE id = user_id;
   ```

### Example Calculation:

| Recording Duration | Seconds | Minutes Calculated | Minutes Added |
|-------------------|---------|-------------------|---------------|
| 30 seconds | 30 | `Math.ceil(30/60) = 1` | 1 minute |
| 1 minute 15 sec | 75 | `Math.ceil(75/60) = 2` | 2 minutes |
| 2 minutes 5 sec | 125 | `Math.ceil(125/60) = 3` | 3 minutes |
| 5 minutes exact | 300 | `Math.ceil(300/60) = 5` | 5 minutes |

**Note**: Uses `Math.ceil` to always round UP, so any partial minute counts as a full minute.

---

## After Running Migration

### Test Minutes Tracking:

1. Go to http://localhost:3000/dashboard/record
2. Record a short audio (30 seconds)
3. Stop recording and wait for processing to complete
4. Go to http://localhost:3000/dashboard
5. ✅ Should now show: "1 / 30 minutes used this month"

### Verify in Database:

1. Open Supabase Dashboard → Table Editor
2. Select `profiles` table
3. Find your user row
4. Check `minutes_used` column
5. Should be > 0 after recordings

### Check Server Logs:

Look for:
```
Updated minutes_used for user <uuid>: +3 minutes
```

Should show actual minutes (not +0).

---

## Common Issues After Fix

### Issue 1: Still showing 0 minutes
**Cause**: Old recordings processed before migration was run
**Fix**: Create a new recording to test

### Issue 2: Minutes not appearing on dashboard
**Cause**: Dashboard not refreshing
**Fix**: Hard refresh (Ctrl+Shift+R) or restart dev server

### Issue 3: "Function does not exist" error in logs
**Cause**: Migration didn't run successfully
**Fix**: Re-run the migration SQL, check for syntax errors

---

## Related Migrations

You should also run these migrations if you haven't already:

1. **`00004_add_recording_type.sql`** - Adds `recording_type` column (fixes system audio upload)
2. **`00005_increment_minutes_used_function.sql`** - Adds minutes tracking function (this migration)
3. **`00006_storage_setup.sql`** - Configures storage bucket RLS policies (optional)

---

## File Reference

**Migration File**: `supabase/migrations/00005_increment_minutes_used_function.sql`

**Code Files:**
- `src/app/api/transcribe/route.ts` (lines 477-484) - Calls the function
- `src/components/audio/AudioRecorder.tsx` (line 160) - Stores duration in seconds
- `src/components/audio/SystemAudioRecorder.tsx` (line 231) - Stores duration in seconds
- `src/app/dashboard/page.tsx` - Displays minutes used/quota

**Database:**
- **Function**: `public.increment_minutes_used(user_id UUID, minutes INTEGER)`
- **Table**: `public.profiles`
- **Column**: `minutes_used INTEGER`

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Minutes tracking shows 0 | Missing `increment_minutes_used` database function | Run migration `00005_increment_minutes_used_function.sql` |
| Logs show "+0 minutes" | Function doesn't exist, call fails silently | Execute SQL in Supabase Dashboard |
| Status | ⏳ **Migration not run** | ✅ **Run the migration now** |

---

## Next Steps

1. ✅ **Run the migration** (see Step 1-3 above)
2. ✅ **Test with new recording**
3. ✅ **Verify minutes increment correctly**
4. ✅ **Verify quota enforcement works** (try exceeding 30 minutes on free tier)

---

## Important Notes

- **Duration is stored in SECONDS** in the database (not minutes)
- **Quota is enforced in MINUTES** (uses `Math.ceil` to round up)
- **Recording of 1 second = 1 minute** towards quota (always rounds up)
- **Function is atomic** - safe for concurrent recordings
- **Free tier: 30 minutes/month**, Pro: 100 minutes, Team: 150 minutes

---

## Success Criteria

After running the migration, you should see:
- ✅ Minutes increment after each recording
- ✅ Dashboard shows correct "X / 30 minutes used this month"
- ✅ Quota enforcement works (blocks recordings when limit reached)
- ✅ Server logs show actual minutes: "Updated minutes_used: +3 minutes"
