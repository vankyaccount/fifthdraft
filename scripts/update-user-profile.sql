-- SQL Script to update user profile for vaibhavmalhotra100
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

-- First, find the user by email to get their ID
-- SELECT id, email, full_name, subscription_tier, minutes_quota, minutes_used
-- FROM profiles
-- WHERE email LIKE '%vaibhavmalhotra100%';

-- Update the user profile:
-- 1. Set full_name to "Vaibhav Malhotra"
-- 2. Set subscription_tier to "pro"
-- 3. Set minutes_quota to 2000 (Pro tier quota)
-- 4. Optionally reset minutes_used to match actual usage

UPDATE profiles
SET
    full_name = 'Vaibhav Malhotra',
    subscription_tier = 'pro',
    minutes_quota = 2000,
    subscription_status = 'active',
    updated_at = NOW()
WHERE email LIKE '%vaibhavmalhotra100%';

-- Verify the update
SELECT id, email, full_name, subscription_tier, subscription_status, minutes_quota, minutes_used
FROM profiles
WHERE email LIKE '%vaibhavmalhotra100%';
