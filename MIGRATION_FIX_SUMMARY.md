# Migration Fix Summary

## ✅ Issues Fixed

### Issue 1: "relation 'profiles' already exists"
**Problem:** Supabase auto-creates a `profiles` table when you enable auth.

**Solution:** Modified migration to use `ALTER TABLE` instead of `CREATE TABLE` for profiles. The fixed migration adds columns to the existing table.

### Issue 2: "column 'organization_id' does not exist"
**Problem:** Original RLS policies checked organization membership in policies, but organizations are optional (MVP doesn't require them).

**Solution:** Simplified RLS policies to only check `user_id` ownership. Organization features work but aren't enforced in policies yet.

### Issue 3: Missing tables "subscriptions" and "usage_tracking"
**Problem:** These table names were mentioned but never actually part of the design.

**Solution:** Clarified that:
- Subscription data lives in `profiles` table (columns: `subscription_tier`, `stripe_customer_id`, etc.)
- Usage tracking lives in `usage_logs` table

---

## 🚀 Quick Fix Steps

### Step 1: Run 3 Fixed SQL Scripts

Run these in Supabase SQL Editor in order:

1. **[FIXED_MIGRATION.sql](FIXED_MIGRATION.sql)**
   - Creates/updates all tables
   - Sets up indexes and constraints
   - Creates triggers

2. **[FIXED_RLS_POLICIES.sql](FIXED_RLS_POLICIES.sql)**
   - Enables Row Level Security
   - Creates security policies

3. **[FIXED_DATA_RETENTION.sql](FIXED_DATA_RETENTION.sql)**
   - Creates helper functions
   - Sets up auto-profile creation trigger

### Step 2: Create Storage Bucket

Run this in SQL Editor:

```sql
-- Quick storage setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own recordings"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Service role can access all recordings"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'recordings');
```

### Step 3: Test!

1. Go to http://localhost:3000/signup
2. Create account: test@example.com / Test123!@#
3. Click "Meeting Notes"
4. Record for 10 seconds
5. Wait for processing
6. View your note!

---

## 📋 Files Created for You

| File | Purpose |
|------|---------|
| [FIXED_MIGRATION.sql](FIXED_MIGRATION.sql) | ✅ Fixed schema migration |
| [FIXED_RLS_POLICIES.sql](FIXED_RLS_POLICIES.sql) | ✅ Fixed security policies |
| [FIXED_DATA_RETENTION.sql](FIXED_DATA_RETENTION.sql) | ✅ Helper functions |
| [POST_MIGRATION_STEPS.md](POST_MIGRATION_STEPS.md) | 📖 Detailed post-migration guide |
| [MIGRATION_FIX_SUMMARY.md](MIGRATION_FIX_SUMMARY.md) | 📖 This file (quick reference) |

---

## 🎯 Expected Tables After Migration

You should have these 14 tables:

| Table | Purpose | Rows Expected |
|-------|---------|---------------|
| profiles | User accounts | 1 (after signup) |
| organizations | Team accounts | 0 (optional) |
| organization_members | Team membership | 0 (optional) |
| recordings | Audio metadata | 1 (after recording) |
| transcriptions | Raw transcripts | 1 (after processing) |
| notes | Cleaned notes | 1 (after processing) |
| action_items | Extracted tasks | 0-5 (depends on content) |
| chat_conversations | AI chats | 0 (future feature) |
| chat_messages | Chat messages | 0 (future feature) |
| sync_queue | Offline sync | 0 (background) |
| usage_logs | Usage tracking | 1 (after processing) |
| admin_activity_logs | Admin actions | 0 (admin only) |
| platform_settings | Global settings | 0 (admin only) |
| note_feedback | User feedback | 0 (optional) |

**❌ NOT EXPECTED:** `subscriptions`, `usage_tracking` (data is in other tables)

---

## 🔍 How to Verify Success

### Check Tables
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check Profiles Table Columns
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### Check Storage Bucket
```sql
SELECT * FROM storage.buckets WHERE name = 'recordings';
```

### Test Profile Auto-Creation
```sql
-- After signup, check:
SELECT id, email, subscription_tier, minutes_used, minutes_quota
FROM profiles
WHERE email = 'test@example.com';
```

---

## ⚡ Common Post-Migration Issues

### 1. Upload fails with "Permission denied"
**Fix:** Re-run storage policies (Step 2)

### 2. Profile not created on signup
**Fix:** Run FIXED_DATA_RETENTION.sql to create trigger

### 3. Can't view own recordings
**Fix:** Run FIXED_RLS_POLICIES.sql

### 4. Transcription stuck in "processing"
**Check:** OpenAI API key in `.env.local`
**Check:** Server logs for errors

---

## 📊 Understanding the Schema

### Where is subscription data?
**In `profiles` table:**
```sql
SELECT
  subscription_tier,        -- 'free', 'pro', 'team', 'enterprise'
  subscription_status,      -- 'active', 'canceled', etc.
  stripe_customer_id,       -- Stripe customer ID
  stripe_subscription_id,   -- Stripe subscription ID
  minutes_used,             -- Minutes used this month
  minutes_quota             -- Monthly quota (30, 100, 150, unlimited)
FROM profiles;
```

### Where is usage tracking?
**In `usage_logs` table:**
```sql
SELECT
  resource_type,            -- 'transcription', 'chat', etc.
  units_consumed,           -- Minutes or tokens used
  recording_id,             -- Link to recording
  created_at                -- When it was used
FROM usage_logs;
```

Get monthly usage:
```sql
SELECT get_monthly_minutes_used('your-user-id');
```

---

## ✅ Success Criteria

Migration is successful when:
- [ ] All 3 SQL scripts run without errors
- [ ] 14 tables exist in Table Editor
- [ ] Storage bucket "recordings" exists with policies
- [ ] Test signup creates profile automatically
- [ ] Can upload recording to storage
- [ ] Processing completes and creates note
- [ ] Can view note in dashboard
- [ ] No RLS errors when accessing own data

---

## 🎉 You're Done!

Once all steps complete successfully, your FifthDraft app is fully functional!

**Next:** Start using it for real! Record meetings, brainstorm ideas, and enjoy AI-powered notes.

---

**Quick Links:**
- Supabase SQL: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/sql
- Supabase Storage: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/storage
- App: http://localhost:3000
- Detailed Guide: [POST_MIGRATION_STEPS.md](POST_MIGRATION_STEPS.md)
