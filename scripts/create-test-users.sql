-- Test Users Creation Script
-- Run this in Supabase SQL Editor to create test users for each tier

-- This script creates test users for Free, Pro, Team, and Enterprise tiers
-- Each user has a simple password: "Test123!"

-- IMPORTANT: Run this ONLY in development/testing environment!
-- DO NOT run in production with these weak passwords!

-- =============================================================================
-- 1. FREE TIER USER
-- =============================================================================
-- Email: free@test.com
-- Password: Test123!
-- Tier: free
-- Quota: 30 minutes

-- First, we need to create the auth user
-- Note: You'll need to create these users via Supabase Auth UI or use the createUser API
-- This SQL creates the profile records assuming auth users exist

-- Check if profile exists, if not insert
INSERT INTO profiles (
  id,
  email,
  full_name,
  subscription_tier,
  minutes_used,
  minutes_quota,
  settings,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  'Free Tier Test User',
  'free',
  0,
  30,
  jsonb_build_object(
    'writing_style', jsonb_build_object(
      'tone', 'professional',
      'formality', 'balanced',
      'verbosity', 'concise',
      'person', 'first-person',
      'formatting', 'bullet-points'
    ),
    'note_structure', jsonb_build_object(
      'template', 'default',
      'sections', jsonb_build_object(
        'summary', true,
        'keyPoints', true,
        'fullTranscript', true,
        'actionItems', true,
        'decisions', true,
        'questions', false,
        'timestamps', false,
        'speakers', false,
        'tags', true,
        'relatedNotes', false
      ),
      'granularity', 'standard',
      'headingStyle', 'h1-h2-h3'
    ),
    'output_preferences', jsonb_build_object(
      'autoExport', false,
      'defaultExportFormat', 'markdown',
      'includeMetadata', true,
      'languagePreference', 'en',
      'feedbackFrequency', 'occasional'
    )
  ),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'free@test.com'
ON CONFLICT (id) DO UPDATE SET
  subscription_tier = 'free',
  minutes_quota = 30,
  minutes_used = 0;

-- =============================================================================
-- 2. PRO TIER USER
-- =============================================================================
-- Email: pro@test.com
-- Password: Test123!
-- Tier: pro
-- Quota: 100 minutes

INSERT INTO profiles (
  id,
  email,
  full_name,
  subscription_tier,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  minutes_used,
  minutes_quota,
  settings,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  'Pro Tier Test User',
  'pro',
  'cus_test_pro_' || id,
  'sub_test_pro_' || id,
  'active',
  0,
  100,
  jsonb_build_object(
    'writing_style', jsonb_build_object(
      'tone', 'professional',
      'formality', 'formal',
      'verbosity', 'detailed',
      'person', 'third-person',
      'formatting', 'paragraphs'
    ),
    'note_structure', jsonb_build_object(
      'template', 'executive',
      'sections', jsonb_build_object(
        'summary', true,
        'keyPoints', true,
        'fullTranscript', true,
        'actionItems', true,
        'decisions', true,
        'questions', true,
        'timestamps', true,
        'speakers', false,
        'tags', true,
        'relatedNotes', true
      ),
      'granularity', 'detailed',
      'headingStyle', 'numbered'
    ),
    'output_preferences', jsonb_build_object(
      'autoExport', true,
      'defaultExportFormat', 'pdf',
      'includeMetadata', true,
      'languagePreference', 'en',
      'feedbackFrequency', 'occasional'
    )
  ),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'pro@test.com'
ON CONFLICT (id) DO UPDATE SET
  subscription_tier = 'pro',
  minutes_quota = 100,
  minutes_used = 0,
  subscription_status = 'active';

-- =============================================================================
-- 3. TEAM TIER USER
-- =============================================================================
-- Email: team@test.com
-- Password: Test123!
-- Tier: team
-- Quota: 150 minutes

INSERT INTO profiles (
  id,
  email,
  full_name,
  subscription_tier,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  minutes_used,
  minutes_quota,
  settings,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  'Team Tier Test User',
  'team',
  'cus_test_team_' || id,
  'sub_test_team_' || id,
  'active',
  0,
  150,
  jsonb_build_object(
    'writing_style', jsonb_build_object(
      'tone', 'casual',
      'formality', 'balanced',
      'verbosity', 'balanced',
      'person', 'first-person',
      'formatting', 'mixed'
    ),
    'note_structure', jsonb_build_object(
      'template', 'technical',
      'sections', jsonb_build_object(
        'summary', true,
        'keyPoints', true,
        'fullTranscript', true,
        'actionItems', true,
        'decisions', true,
        'questions', true,
        'timestamps', true,
        'speakers', true,
        'tags', true,
        'relatedNotes', true
      ),
      'granularity', 'detailed',
      'headingStyle', 'emoji'
    ),
    'output_preferences', jsonb_build_object(
      'autoExport', true,
      'defaultExportFormat', 'docx',
      'includeMetadata', true,
      'languagePreference', 'en',
      'feedbackFrequency', 'always'
    )
  ),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'team@test.com'
ON CONFLICT (id) DO UPDATE SET
  subscription_tier = 'team',
  minutes_quota = 150,
  minutes_used = 0,
  subscription_status = 'active';

-- =============================================================================
-- 4. ENTERPRISE TIER USER
-- =============================================================================
-- Email: enterprise@test.com
-- Password: Test123!
-- Tier: enterprise
-- Quota: 999999 (unlimited)

INSERT INTO profiles (
  id,
  email,
  full_name,
  subscription_tier,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  minutes_used,
  minutes_quota,
  settings,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  'Enterprise Tier Test User',
  'enterprise',
  'cus_test_enterprise_' || id,
  'sub_test_enterprise_' || id,
  'active',
  0,
  999999,
  jsonb_build_object(
    'writing_style', jsonb_build_object(
      'tone', 'academic',
      'formality', 'formal',
      'verbosity', 'detailed',
      'person', 'passive',
      'formatting', 'paragraphs'
    ),
    'note_structure', jsonb_build_object(
      'template', 'custom',
      'sections', jsonb_build_object(
        'summary', true,
        'keyPoints', true,
        'fullTranscript', true,
        'actionItems', true,
        'decisions', true,
        'questions', true,
        'timestamps', true,
        'speakers', true,
        'tags', true,
        'relatedNotes', true
      ),
      'granularity', 'high-level',
      'headingStyle', 'minimal'
    ),
    'output_preferences', jsonb_build_object(
      'autoExport', true,
      'defaultExportFormat', 'docx',
      'includeMetadata', true,
      'languagePreference', 'en',
      'feedbackFrequency', 'never'
    )
  ),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'enterprise@test.com'
ON CONFLICT (id) DO UPDATE SET
  subscription_tier = 'enterprise',
  minutes_quota = 999999,
  minutes_used = 0,
  subscription_status = 'active';

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================
-- Run this to verify all test users were created successfully

SELECT
  p.email,
  p.full_name,
  p.subscription_tier,
  p.minutes_used || '/' || p.minutes_quota AS quota,
  p.subscription_status,
  CASE
    WHEN p.settings IS NOT NULL THEN 'Configured'
    ELSE 'Not Configured'
  END AS preferences_status,
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
