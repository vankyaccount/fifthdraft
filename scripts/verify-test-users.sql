-- Quick verification script for test users
-- Run this after creating test users to ensure everything is set up correctly

-- =============================================================================
-- CHECK 1: Verify Auth Users Exist
-- =============================================================================
SELECT
  'AUTH USERS' AS check_type,
  email,
  email_confirmed_at IS NOT NULL AS is_confirmed,
  created_at
FROM auth.users
WHERE email IN (
  'free@test.com',
  'pro@test.com',
  'team@test.com',
  'enterprise@test.com'
)
ORDER BY email;

-- =============================================================================
-- CHECK 2: Verify Profile Records with Full Details
-- =============================================================================
SELECT
  'PROFILES' AS check_type,
  p.email,
  p.full_name,
  p.subscription_tier,
  p.minutes_used,
  p.minutes_quota,
  p.subscription_status,
  p.stripe_customer_id IS NOT NULL AS has_stripe,
  p.settings IS NOT NULL AS has_settings,
  p.settings->>'writing_style' IS NOT NULL AS has_writing_style,
  p.settings->>'note_structure' IS NOT NULL AS has_note_structure,
  p.created_at
FROM profiles p
WHERE p.email IN (
  'free@test.com',
  'pro@test.com',
  'team@test.com',
  'enterprise@test.com'
)
ORDER BY
  CASE p.subscription_tier
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'team' THEN 3
    WHEN 'enterprise' THEN 4
  END;

-- =============================================================================
-- CHECK 3: Verify Settings Configuration
-- =============================================================================
SELECT
  'SETTINGS DETAIL' AS check_type,
  email,
  subscription_tier,
  settings->'writing_style'->>'tone' AS writing_tone,
  settings->'writing_style'->>'formality' AS formality,
  settings->'writing_style'->>'verbosity' AS verbosity,
  settings->'note_structure'->>'template' AS template,
  settings->'note_structure'->>'granularity' AS granularity,
  settings->'output_preferences'->>'defaultExportFormat' AS export_format
FROM profiles
WHERE email IN (
  'free@test.com',
  'pro@test.com',
  'team@test.com',
  'enterprise@test.com'
)
ORDER BY email;

-- =============================================================================
-- CHECK 4: Summary Report
-- =============================================================================
SELECT
  '=== SETUP SUMMARY ===' AS report,
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@test.com') AS auth_users_created,
  (SELECT COUNT(*) FROM profiles WHERE email LIKE '%@test.com') AS profiles_created,
  (SELECT COUNT(*) FROM profiles WHERE email LIKE '%@test.com' AND settings IS NOT NULL) AS profiles_configured,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@test.com') = 4
     AND (SELECT COUNT(*) FROM profiles WHERE email LIKE '%@test.com') = 4
     AND (SELECT COUNT(*) FROM profiles WHERE email LIKE '%@test.com' AND settings IS NOT NULL) = 4
    THEN '✅ ALL TESTS PASSED - Ready to use!'
    ELSE '❌ SETUP INCOMPLETE - Check errors above'
  END AS status;

-- =============================================================================
-- CHECK 5: Feature Matrix
-- =============================================================================
SELECT
  email,
  subscription_tier AS tier,
  CASE
    WHEN minutes_quota <= 30 THEN 'Recording Only'
    WHEN minutes_quota <= 100 THEN 'File Upload (120MB)'
    WHEN minutes_quota <= 150 THEN 'File Upload (240MB)'
    ELSE 'File Upload (480MB+)'
  END AS upload_capability,
  CASE
    WHEN subscription_tier = 'free' THEN 'Haiku (cheap)'
    ELSE 'Sonnet (smart)'
  END AS ai_model,
  CASE
    WHEN subscription_tier IN ('pro', 'team', 'enterprise') THEN 'Lifetime'
    ELSE '7 days'
  END AS retention,
  CASE
    WHEN subscription_tier IN ('pro', 'team', 'enterprise') THEN 'Yes'
    ELSE 'No (locked)'
  END AS chat_enabled,
  CASE
    WHEN subscription_tier IN ('team', 'enterprise') THEN 'Yes'
    ELSE 'No'
  END AS diarization
FROM profiles
WHERE email IN (
  'free@test.com',
  'pro@test.com',
  'team@test.com',
  'enterprise@test.com'
)
ORDER BY
  CASE subscription_tier
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'team' THEN 3
    WHEN 'enterprise' THEN 4
  END;

-- =============================================================================
-- CHECK 6: Quota Status
-- =============================================================================
SELECT
  email,
  subscription_tier,
  minutes_used || ' / ' || minutes_quota AS quota_status,
  ROUND((minutes_used::NUMERIC / NULLIF(minutes_quota, 0)::NUMERIC) * 100, 1) || '%' AS usage_percent,
  minutes_quota - minutes_used AS remaining_minutes,
  CASE
    WHEN minutes_used >= minutes_quota THEN '⚠️ QUOTA EXCEEDED'
    WHEN minutes_used >= minutes_quota * 0.8 THEN '⚡ 80% USED'
    ELSE '✅ AVAILABLE'
  END AS status
FROM profiles
WHERE email IN (
  'free@test.com',
  'pro@test.com',
  'team@test.com',
  'enterprise@test.com'
)
ORDER BY email;

-- =============================================================================
-- EXPECTED OUTPUT
-- =============================================================================
/*
If everything is set up correctly, you should see:

CHECK 1 (AUTH USERS):
  4 rows, all with is_confirmed = true

CHECK 2 (PROFILES):
  4 rows, all with has_settings = true

CHECK 3 (SETTINGS DETAIL):
  4 rows with different preferences per tier

CHECK 4 (SUMMARY):
  status = '✅ ALL TESTS PASSED - Ready to use!'

CHECK 5 (FEATURE MATRIX):
  Free: Recording Only, Haiku, 7 days, No chat
  Pro: File Upload 120MB, Sonnet, Lifetime, Chat
  Team: File Upload 240MB, Sonnet, Lifetime, Chat, Diarization
  Enterprise: File Upload 480MB+, Sonnet, Lifetime, All features

CHECK 6 (QUOTA STATUS):
  All showing 0 / quota with status = '✅ AVAILABLE'
*/
