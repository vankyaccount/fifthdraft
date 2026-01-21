# Test Users Scripts

This directory contains SQL scripts for creating and managing test users across all subscription tiers.

## 📁 Files

| File | Purpose |
|------|---------|
| `create-test-users.sql` | Creates 4 test users (Free, Pro, Team, Enterprise) with configured profiles |
| `verify-test-users.sql` | Comprehensive verification checks to ensure setup is correct |

## 🚀 Quick Start

### 1. Create Auth Users (Supabase UI)

Navigate to your Supabase Dashboard:

**Authentication** → **Users** → **"Add user"** → **"Create new user"**

Create these 4 users:

```
Email: free@test.com        Password: Test123!   ✅ Auto Confirm User
Email: pro@test.com         Password: Test123!   ✅ Auto Confirm User
Email: team@test.com        Password: Test123!   ✅ Auto Confirm User
Email: enterprise@test.com  Password: Test123!   ✅ Auto Confirm User
```

### 2. Run Creation Script

**SQL Editor** → New query → Paste contents of `create-test-users.sql` → **Run**

### 3. Verify Setup

**SQL Editor** → New query → Paste contents of `verify-test-users.sql` → **Run**

Expected result:
```
✅ ALL TESTS PASSED - Ready to use!
```

## 📋 Test Credentials

| Tier | Email | Password | Quota | Key Features |
|------|-------|----------|-------|--------------|
| Free | free@test.com | Test123! | 30 min | Recording only, Haiku AI |
| Pro | pro@test.com | Test123! | 100 min | Upload 120MB, Sonnet AI, Chat |
| Team | team@test.com | Test123! | 150 min | Upload 240MB, Diarization |
| Enterprise | enterprise@test.com | Test123! | Unlimited | Upload 480MB+, All features |

## 🧪 What Gets Created

For each test user:

✅ **Auth User** (via Supabase UI)
- Email confirmed
- Password set to `Test123!`
- Ready to login

✅ **Profile Record** (via SQL script)
- Subscription tier assigned
- Minutes quota configured
- Stripe IDs (fake for testing)
- Subscription status set to 'active'

✅ **Personalized Settings** (via SQL script)
- Writing style preferences (different per tier)
- Note structure configuration
- Output preferences
- All ready for testing personalization

## 🎯 Testing Scenarios

### Free Tier Tests

```
✓ Login: free@test.com / Test123!
✓ Quota: 0/30 minutes
✓ Microphone recording works
✓ System audio capture works
✗ File upload blocked (paywall)
✓ AI model: Claude Haiku (cheaper)
✗ Chat locked (upgrade prompt)
✗ Templates locked
✓ Export: Markdown, TXT only
```

### Pro Tier Tests

```
✓ Login: pro@test.com / Test123!
✓ Quota: 0/100 minutes
✓ All Free features unlocked
✓ File upload enabled (120MB limit)
✓ AI model: Claude Sonnet (smarter)
✓ Chat enabled
✓ Templates enabled
✓ Export: All formats (MD, PDF, DOCX, TXT, JSON)
```

### Team Tier Tests

```
✓ Login: team@test.com / Test123!
✓ Quota: 0/150 minutes
✓ All Pro features
✓ File upload enabled (240MB limit)
✓ Speaker diarization
✓ Team workspaces
✓ Integrations (Jira, Linear, Trello)
```

### Enterprise Tier Tests

```
✓ Login: enterprise@test.com / Test123!
✓ Quota: 0/999999 minutes (unlimited)
✓ All Team features
✓ File upload enabled (480MB+ limit)
✓ E2EE (if implemented)
✓ SSO (if implemented)
✓ Custom AI training (if implemented)
```

## 🔒 Server-Side Validation Tests

### Test 1: Free Tier Upload Block

```sql
-- Attempt file upload as free tier user
-- Expected: 403 Forbidden from /api/transcribe
-- Error: "File uploads require Pro tier or higher"
```

### Test 2: File Size Limit

```sql
-- Upload 150MB file as Pro tier (120MB limit)
-- Expected: 413 Payload Too Large
-- Error: "File size (150MB) exceeds pro tier limit of 120MB"
```

### Test 3: Quota Enforcement

```sql
-- Set quota to exceeded:
UPDATE profiles SET minutes_used = 30 WHERE email = 'free@test.com';

-- Attempt recording
-- Expected: 429 Too Many Requests
-- Error: "Monthly quota exceeded"
```

## 📊 Verification Queries

### Quick Status Check

```sql
SELECT
  email,
  subscription_tier,
  minutes_used || '/' || minutes_quota AS quota,
  subscription_status
FROM profiles
WHERE email LIKE '%@test.com'
ORDER BY subscription_tier;
```

### Feature Access Check

```sql
SELECT
  email,
  subscription_tier,
  CASE WHEN subscription_tier = 'free' THEN 'Blocked' ELSE 'Allowed' END AS file_upload,
  CASE WHEN subscription_tier IN ('pro','team','enterprise') THEN 'Enabled' ELSE 'Locked' END AS chat,
  CASE WHEN subscription_tier = 'free' THEN 'Haiku' ELSE 'Sonnet' END AS ai_model
FROM profiles
WHERE email LIKE '%@test.com';
```

### Settings Verification

```sql
SELECT
  email,
  settings->'writing_style'->>'tone' AS tone,
  settings->'writing_style'->>'verbosity' AS verbosity,
  settings->'note_structure'->>'template' AS template
FROM profiles
WHERE email LIKE '%@test.com';
```

## 🗑️ Cleanup

To remove all test users:

```sql
-- Delete profiles
DELETE FROM profiles WHERE email IN (
  'free@test.com',
  'pro@test.com',
  'team@test.com',
  'enterprise@test.com'
);

-- Then delete auth users via Supabase UI:
-- Authentication → Users → Delete each test user
```

## ⚠️ Important Notes

1. **Development Only**: These are test credentials with weak passwords. DO NOT use in production!

2. **Auto Confirm**: Make sure to check "Auto Confirm User" when creating auth users, otherwise they can't login.

3. **Quota Reset**: Test users start with 0 minutes used. Manually update `minutes_used` to test quota limits.

4. **Stripe IDs**: Test users have fake Stripe IDs (`cus_test_*`, `sub_test_*`). For real Stripe testing, you'll need to create actual Stripe customers.

5. **Settings**: Each tier has different writing style preferences to test personalization:
   - Free: Professional, concise, bullet-points
   - Pro: Professional, formal, detailed, paragraphs
   - Team: Casual, balanced, mixed formatting
   - Enterprise: Academic, formal, detailed, minimal headings

## 📖 See Also

- [TEST_USERS_SETUP.md](../TEST_USERS_SETUP.md) - Full setup guide with troubleshooting
- [TEST_CREDENTIALS.txt](../TEST_CREDENTIALS.txt) - Quick reference card with credentials

## 🐛 Troubleshooting

**Problem**: "User not found" after login
**Solution**: Run `create-test-users.sql` to create profile records

**Problem**: "Email not confirmed"
**Solution**: Check "Auto Confirm User" when creating auth users

**Problem**: Settings not applied
**Solution**: Verify with `SELECT settings FROM profiles WHERE email = 'free@test.com'`

**Problem**: Wrong features available
**Solution**: Check tier: `SELECT subscription_tier FROM profiles WHERE email = 'free@test.com'`

---

✅ **Ready to test!** Follow the Quick Start steps above to get started.
