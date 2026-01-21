-- Run this in Supabase SQL Editor to verify everything

-- 1. Check if function exists
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'increment_minutes_used';

-- 2. Check your current minutes_used
SELECT
  email,
  minutes_used,
  minutes_quota,
  subscription_tier
FROM profiles
WHERE id = 'a9e239ea-9224-49c3-9083-8e23f20a6464';

-- 3. Manually test the function (this will add 1 minute)
SELECT increment_minutes_used('a9e239ea-9224-49c3-9083-8e23f20a6464'::uuid, 1);

-- 4. Check minutes_used again (should be +1)
SELECT
  email,
  minutes_used,
  minutes_quota
FROM profiles
WHERE id = 'a9e239ea-9224-49c3-9083-8e23f20a6464';
