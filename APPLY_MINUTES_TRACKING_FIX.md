# Minutes Tracking Fix

## Issue
The dashboard always shows "0 minutes used" because the transcribe API was logging usage to `usage_logs` table but not updating the `profiles.minutes_used` field.

## Fix Applied

### 1. Code Changes
**File**: `src/app/api/transcribe/route.ts`

Added code to increment user's minutes after successful transcription:

```typescript
// Update user's minutes_used
const minutesToAdd = Math.ceil((recording.duration || 0) / 60) // Convert seconds to minutes
await supabase.rpc('increment_minutes_used', {
  user_id: recording.user_id,
  minutes: minutesToAdd
})
```

### 2. Database Migration
**File**: `supabase/migrations/00005_increment_minutes_used_function.sql`

Created a PostgreSQL function for atomic updates (prevents race conditions).

## How to Apply

### Step 1: Run the Migration

Go to your Supabase Dashboard → SQL Editor → New query

Copy and paste the contents of `supabase/migrations/00005_increment_minutes_used_function.sql`:

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

Click **RUN**.

### Step 2: Verify the Fix

1. **Check existing data** (optional - backfill minutes from usage_logs):
   ```sql
   -- See total minutes per user from usage_logs
   SELECT
     user_id,
     SUM(units_consumed) / 60 AS total_minutes
   FROM usage_logs
   WHERE resource_type = 'transcription'
   GROUP BY user_id;

   -- Backfill minutes_used from usage_logs (run this ONCE)
   UPDATE profiles p
   SET minutes_used = (
     SELECT COALESCE(SUM(units_consumed) / 60, 0)
     FROM usage_logs
     WHERE user_id = p.id
     AND resource_type = 'transcription'
   );
   ```

2. **Test the fix**:
   - Record a new audio (e.g., 1 minute)
   - Wait for processing to complete
   - Refresh dashboard
   - Minutes should now show as used!

### Step 3: Monitor

Check the server logs when a recording completes. You should see:
```
Updated minutes_used for user [UUID]: +1 minutes
```

## What Changed

**Before:**
- ❌ Minutes logged to `usage_logs` only
- ❌ `profiles.minutes_used` never updated
- ❌ Dashboard always showed 0 minutes

**After:**
- ✅ Minutes logged to `usage_logs` (audit trail)
- ✅ `profiles.minutes_used` incremented atomically
- ✅ Dashboard shows accurate usage
- ✅ Quota enforcement works correctly

## Technical Details

**Duration Conversion:**
- Recordings store duration in **seconds**
- User quota is in **minutes**
- Conversion: `Math.ceil(seconds / 60)` rounds up to nearest minute

**Atomic Update:**
- Uses PostgreSQL function with `SECURITY DEFINER`
- Prevents race conditions if multiple recordings process simultaneously
- `COALESCE(minutes_used, 0)` handles NULL values safely
