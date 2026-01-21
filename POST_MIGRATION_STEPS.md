# Post-Migration Steps

## ✅ Step 1: Run Fixed Migrations

Run these SQL scripts in order in Supabase SQL Editor:

### 1.1 Schema Migration
Copy and paste [FIXED_MIGRATION.sql](FIXED_MIGRATION.sql) into SQL Editor and run it.

This will:
- Add columns to existing `profiles` table
- Create all other tables (recordings, notes, action_items, etc.)
- Set up indexes and constraints
- Create triggers for auto-updates

### 1.2 Security Policies
Copy and paste [FIXED_RLS_POLICIES.sql](FIXED_RLS_POLICIES.sql) into SQL Editor and run it.

This will:
- Enable Row Level Security on all tables
- Create policies so users can only access their own data

### 1.3 Helper Functions
Copy and paste [FIXED_DATA_RETENTION.sql](FIXED_DATA_RETENTION.sql) into SQL Editor and run it.

This will:
- Create cleanup functions
- Create usage tracking functions
- Set up auto-profile creation trigger

---

## ✅ Step 2: Create Storage Bucket

Run this SQL in Supabase SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Service role can access all recordings" ON storage.objects;

-- Create upload policy
CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create read policy
CREATE POLICY "Users can read own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create delete policy
CREATE POLICY "Users can delete own recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role access (for API processing)
CREATE POLICY "Service role can access all recordings"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'recordings');
```

---

## ✅ Step 3: Verify Setup

### 3.1 Check Tables Exist
Go to Supabase Table Editor: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/editor

You should see these tables:
- ✅ profiles
- ✅ organizations
- ✅ organization_members
- ✅ recordings
- ✅ transcriptions
- ✅ notes
- ✅ action_items
- ✅ chat_conversations
- ✅ chat_messages
- ✅ sync_queue
- ✅ usage_logs
- ✅ admin_activity_logs
- ✅ platform_settings
- ✅ note_feedback

**Note:** The tables `subscriptions` and `usage_tracking` don't exist because:
- `usage_logs` handles usage tracking
- Subscription data is in `profiles` table (columns: `subscription_tier`, `stripe_subscription_id`, etc.)

### 3.2 Check Storage Bucket
Go to Supabase Storage: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/storage/buckets

You should see:
- ✅ `recordings` bucket (private)

### 3.3 Check RLS Policies
Go to Authentication > Policies: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/auth/policies

Verify policies are enabled for all tables.

---

## ✅ Step 4: Test Profile Auto-Creation

1. Go to: http://localhost:3000/signup
2. Create a test account:
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. After signup, check Supabase:
   - Go to Table Editor > profiles
   - You should see your new profile automatically created!

---

## ✅ Step 5: Test Recording Flow

### 5.1 Access Recording Page
1. Login with your test account
2. Click "Meeting Notes" or "Brainstorming"
3. You should see the recording interface

### 5.2 Test Recording
1. Click "Allow" when browser asks for microphone permission
2. Click "Start Recording"
3. Speak for 10-30 seconds
4. Click "Stop Recording"
5. Wait for "Uploading recording..." message

### 5.3 Check Upload Success
Go to Supabase Storage > recordings bucket
- You should see a folder with your user ID
- Inside, you should see a `.webm` file

### 5.4 Check Database Records
Go to Table Editor:
- **recordings** table should have 1 row (status: 'processing' or 'completed')
- Wait 30-60 seconds for processing to complete
- **transcriptions** table should have 1 row (the raw transcript)
- **notes** table should have 1 row (the cleaned note)
- **action_items** table may have rows (if any were extracted)
- **usage_logs** table should have 1 row

### 5.5 View Your Note
1. Go back to dashboard: http://localhost:3000/dashboard
2. You should see your recording in "Recent Recordings"
3. Click "View Note →"
4. You should see your AI-generated note!

---

## 🐛 Troubleshooting

### "Failed to upload recording"
**Check:**
1. Storage bucket exists (Step 2)
2. Storage policies are created (Step 2)
3. User is authenticated
4. Browser has microphone permission

**Fix:** Re-run Step 2 SQL script

### "Profile not found" after signup
**Check:**
1. Trigger `on_auth_user_created` exists
2. Run: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`

**Fix:** Re-run Step 1.3 (FIXED_DATA_RETENTION.sql)

### "Transcription failed" or stuck in 'processing'
**Check:**
1. OpenAI API key is valid in `.env.local`
2. Check server logs: Read the file `C:\Users\VAIBHA~1.MAL\AppData\Local\Temp\claude\d--Project-Fifth-Draft\tasks\bc2d13e.output`
3. Check API route works: Open http://localhost:3000/api/transcribe in browser (should show Method Not Allowed, meaning route exists)

**Common errors:**
- "Insufficient quota" → Add credits to OpenAI account
- "Invalid API key" → Check `.env.local` has correct key
- "Audio download failed" → Check storage policies

### Tables missing: subscriptions, usage_tracking
**These don't exist! Here's why:**
- **Subscription data** is in the `profiles` table:
  - `subscription_tier` (free, pro, team, enterprise)
  - `stripe_customer_id`
  - `stripe_subscription_id`
  - `subscription_status`
  - `subscription_current_period_end`
- **Usage tracking** is in the `usage_logs` table:
  - `resource_type` (transcription, chat, etc.)
  - `units_consumed` (minutes used)
  - `user_id`
  - `created_at`

### "organization_id" column error
**Fixed!** The error occurred because the original RLS policies checked organization membership, but for MVP we simplified to only check `user_id`. The fixed policies (FIXED_RLS_POLICIES.sql) don't reference `organization_id` in policies.

---

## 📊 Database Schema Clarification

### Subscription Management
**Location:** `profiles` table

```sql
SELECT
  email,
  subscription_tier,
  subscription_status,
  minutes_used,
  minutes_quota,
  stripe_customer_id,
  subscription_current_period_end
FROM profiles
WHERE id = 'your-user-id';
```

### Usage Tracking
**Location:** `usage_logs` table

```sql
SELECT
  resource_type,
  units_consumed,
  recording_id,
  created_at
FROM usage_logs
WHERE user_id = 'your-user-id'
AND created_at >= DATE_TRUNC('month', NOW());
```

Get monthly usage:
```sql
SELECT get_monthly_minutes_used('your-user-id');
```

---

## ✅ Success Checklist

Before proceeding, verify:

- [ ] All 3 SQL scripts run successfully (no errors)
- [ ] All 14 tables visible in Table Editor
- [ ] Storage bucket `recordings` exists
- [ ] Storage policies created
- [ ] Test account created successfully
- [ ] Profile auto-created for test account
- [ ] Can access dashboard
- [ ] Can access recording page
- [ ] Microphone permission granted
- [ ] Can record audio
- [ ] Upload successful (file in storage)
- [ ] Processing completes (status: completed)
- [ ] Note appears in dashboard
- [ ] Can view note detail page

---

## 🎉 Next Steps After Testing

Once everything works:

1. **Create your real account** (not test account)
2. **Record your first real note**
3. **Explore features:**
   - Try both Meeting and Brainstorming modes
   - Check action items extraction
   - Test note viewing and navigation
4. **Optional enhancements:**
   - Add export to PDF
   - Customize templates
   - Add integrations

---

## 📞 Still Having Issues?

1. Check server logs: `C:\Users\VAIBHA~1.MAL\AppData\Local\Temp\claude\d--Project-Fifth-Draft\tasks\bc2d13e.output`
2. Check browser console (F12 > Console tab)
3. Verify all environment variables in `.env.local`
4. Check Supabase project is not paused
5. Restart dev server: `Ctrl+C` then `npm run dev`

---

**Last Updated:** 2026-01-08
