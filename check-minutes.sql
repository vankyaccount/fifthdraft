-- Run this in Supabase SQL Editor to check if minutes tracking is working

-- 1. Check if the function exists
SELECT EXISTS (
  SELECT 1
  FROM pg_proc
  WHERE proname = 'increment_minutes_used'
) AS function_exists;

-- 2. Check recent recordings and their durations
SELECT
  id,
  user_id,
  duration,
  CEIL(duration::numeric / 60) as calculated_minutes,
  status,
  created_at
FROM recordings
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check user's current minutes_used
SELECT
  id,
  email,
  subscription_tier,
  minutes_used,
  minutes_quota,
  (minutes_quota - minutes_used) as remaining_minutes
FROM profiles
WHERE id = 'a9e239ea-9224-49c3-9083-8e23f20a6464';

-- 4. Check usage logs
SELECT
  resource_type,
  units_consumed,
  created_at
FROM usage_logs
WHERE user_id = 'a9e239ea-9224-49c3-9083-8e23f20a6464'
ORDER BY created_at DESC
LIMIT 5;
