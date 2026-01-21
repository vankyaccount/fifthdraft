-- Quick verification script
-- Run this in Supabase SQL Editor to check the user profile

SELECT
    id,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    minutes_quota,
    minutes_used,
    stripe_customer_id,
    stripe_subscription_id,
    created_at,
    updated_at
FROM profiles
WHERE email = 'Vaibhavmalhotra100@gmail.com';

-- Expected results for Pro user:
-- full_name: 'Vaibhav Malhotra'
-- subscription_tier: 'pro'
-- subscription_status: 'active'
-- minutes_quota: 2000
-- minutes_used: 3 (or whatever current usage is)
