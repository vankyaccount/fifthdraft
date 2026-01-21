# Test Users Setup Guide

This guide will help you create test users for each subscription tier to test FifthDraft features.

## 📋 Test User Credentials

| Tier | Email | Password | Quota | Features |
|------|-------|----------|-------|----------|
| **Free** | `free@test.com` | `Test123!` | 30 min/month | Recording only, 7-day retention |
| **Pro** | `pro@test.com` | `Test123!` | 100 min/month | File upload (120MB), lifetime retention, AI chat |
| **Team** | `team@test.com` | `Test123!` | 150 min/month | All Pro + diarization, team features |
| **Enterprise** | `enterprise@test.com` | `Test123!` | Unlimited | All features + E2EE, SSO |

---

## 🚀 Setup Steps

### Step 1: Create Auth Users in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. For each tier, create a user with:
   - **Email**: (see table above)
   - **Password**: `Test123!`
   - **Auto Confirm User**: ✅ **YES** (important!)
   - Click **"Create user"**

Repeat this 4 times for all test users.

### Step 2: Run SQL Script to Create Profiles

1. Go to **SQL Editor** in Supabase
2. Create a new query
3. Copy the contents of `scripts/create-test-users.sql`
4. Paste and click **"Run"**

This will:
- Create profile records for each user
- Set subscription tiers
- Configure quotas
- Add personalized settings for each tier

### Step 3: Verify Setup

Run this query in SQL Editor to verify:

```sql
SELECT
  p.email,
  p.full_name,
  p.subscription_tier,
  p.minutes_used || '/' || p.minutes_quota AS quota,
  p.subscription_status,
  CASE
    WHEN p.settings IS NOT NULL THEN 'Configured'
    ELSE 'Not Configured'
  END AS preferences_status
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
```

Expected output:
```
┌─────────────────────┬──────────────────────────┬──────────────┬──────────┬──────────────────┬───────────────────┐
│ email               │ full_name                │ tier         │ quota    │ status           │ preferences       │
├─────────────────────┼──────────────────────────┼──────────────┼──────────┼──────────────────┼───────────────────┤
│ free@test.com       │ Free Tier Test User      │ free         │ 0/30     │ NULL             │ Configured        │
│ pro@test.com        │ Pro Tier Test User       │ pro          │ 0/100    │ active           │ Configured        │
│ team@test.com       │ Team Tier Test User      │ team         │ 0/150    │ active           │ Configured        │
│ enterprise@test.com │ Enterprise Tier Test User│ enterprise   │ 0/999999 │ active           │ Configured        │
└─────────────────────┴──────────────────────────┴──────────────┴──────────┴──────────────────┴───────────────────┘
```

---

## 🧪 Testing Checklist

### Test Free Tier (`free@test.com`)

- [ ] Login successful
- [ ] Dashboard shows "Free - 0/30 minutes"
- [ ] Microphone recording works
- [ ] System audio capture works
- [ ] **File upload shows upgrade modal** (blocked)
- [ ] Recording processes with Claude Haiku (cheaper model)
- [ ] Note created successfully
- [ ] Export to Markdown works
- [ ] Export to PDF/DOCX shows upgrade prompt
- [ ] Writing style: professional, concise, bullet-points

### Test Pro Tier (`pro@test.com`)

- [ ] Login successful
- [ ] Dashboard shows "Pro - 0/100 minutes"
- [ ] Microphone recording works
- [ ] System audio capture works
- [ ] **File upload works** (up to 120MB)
- [ ] Recording processes with Claude Sonnet (better model)
- [ ] Note created with all sections
- [ ] Chat sidebar works
- [ ] Export to all formats works (MD, PDF, DOCX, TXT, JSON)
- [ ] Writing style: professional, formal, detailed, paragraphs

### Test Team Tier (`team@test.com`)

- [ ] Login successful
- [ ] Dashboard shows "Team - 0/150 minutes"
- [ ] All Pro features work
- [ ] File upload works (up to 240MB)
- [ ] Speaker diarization available (if implemented)
- [ ] Team collaboration features
- [ ] Writing style: casual, balanced, mixed formatting

### Test Enterprise Tier (`enterprise@test.com`)

- [ ] Login successful
- [ ] Dashboard shows "Enterprise - 0/999999 minutes"
- [ ] All Team features work
- [ ] File upload works (up to 480MB)
- [ ] Unlimited quota enforced
- [ ] Writing style: academic, formal, detailed, minimal headings

---

## 🔒 Server-Side Validation Tests

### File Upload Blocking (Free Tier)

1. Login as `free@test.com`
2. Go to `/dashboard/record?mode=meeting`
3. Click "Upload File" tab
4. Try to upload an MP3 file
5. **Expected**: Upgrade modal appears (client-side block)
6. If you bypass client validation and force upload:
   - **Expected**: 403 Forbidden error from `/api/transcribe`
   - **Expected**: Recording marked as 'failed' in database
   - **Expected**: Error: "File uploads require Pro tier or higher"

### File Size Limit Enforcement

1. Login as `pro@test.com` (120MB limit)
2. Try to upload a 150MB file
3. **Expected**: 413 Payload Too Large error
4. **Expected**: Error: "File size (150MB) exceeds pro tier limit of 120MB"

### Quota Enforcement

1. Login as `free@test.com`
2. Manually set `minutes_used = 30` in database:
   ```sql
   UPDATE profiles SET minutes_used = 30 WHERE email = 'free@test.com';
   ```
3. Try to record or upload
4. **Expected**: 429 Too Many Requests error
5. **Expected**: Error: "Monthly quota exceeded. Please upgrade your plan"

---

## 🎨 Feature Differences by Tier

### Free Tier Features
- ✅ 30 minutes/month quota
- ✅ Browser microphone recording
- ✅ System audio capture
- ✅ Basic transcription (Claude Haiku)
- ✅ 7-day transcript retention
- ✅ Basic export (Markdown, TXT)
- ✅ Offline sync
- ❌ File upload (paywall)
- ❌ Interactive chat (locked)
- ❌ Templates (locked)
- ❌ Advanced export (PDF, DOCX)

### Pro Tier Features
- ✅ 100 minutes/month quota
- ✅ All Free features
- ✅ File upload (up to 120MB)
- ✅ Advanced AI (Claude Sonnet)
- ✅ Interactive chat
- ✅ Templates
- ✅ Export to all formats
- ✅ Lifetime transcript retention
- ❌ Speaker diarization
- ❌ Team collaboration

### Team Tier Features
- ✅ 150 minutes/month quota
- ✅ All Pro features
- ✅ File upload (up to 240MB)
- ✅ Speaker diarization
- ✅ Team workspaces
- ✅ Integrations (Jira, Linear, Trello)
- ❌ E2EE
- ❌ SSO

### Enterprise Tier Features
- ✅ Unlimited minutes
- ✅ All Team features
- ✅ File upload (up to 480MB+)
- ✅ End-to-end encryption (E2EE)
- ✅ SSO (SAML, OAuth)
- ✅ Dedicated support
- ✅ Custom AI model training
- ✅ On-premise deployment option

---

## 🐛 Troubleshooting

### Issue: "User not found" error after login

**Solution**: Run the SQL script again to ensure profile records exist.

### Issue: "Email not confirmed" error

**Solution**: When creating users in Supabase Auth, make sure to check **"Auto Confirm User"**.

### Issue: Features not matching tier

**Solution**: Verify subscription tier in database:
```sql
SELECT email, subscription_tier FROM profiles WHERE email = 'free@test.com';
```

### Issue: Can't login to test users

**Solution**:
1. Check password is exactly `Test123!` (case-sensitive)
2. Verify user exists in Authentication → Users
3. Ensure email is confirmed

---

## 📝 Notes

- **Security Warning**: These are test credentials with weak passwords. DO NOT use in production!
- **Database Cleanup**: To remove test users, run:
  ```sql
  DELETE FROM profiles WHERE email IN (
    'free@test.com', 'pro@test.com', 'team@test.com', 'enterprise@test.com'
  );
  -- Then delete from Authentication → Users in Supabase UI
  ```
- **Quota Reset**: Test users start with 0 minutes used. To test quota limits, manually update `minutes_used`.
- **Preferences**: Each test user has different writing style preferences configured to test personalization.

---

## 🎯 Quick Login URLs

After setup, use these URLs to quickly switch between test users:

- **Free Tier**: http://localhost:3000/login → `free@test.com` / `Test123!`
- **Pro Tier**: http://localhost:3000/login → `pro@test.com` / `Test123!`
- **Team Tier**: http://localhost:3000/login → `team@test.com` / `Test123!`
- **Enterprise**: http://localhost:3000/login → `enterprise@test.com` / `Test123!`

---

## ✅ Setup Complete!

You now have 4 test users representing each subscription tier. Use them to test:
- Feature access control
- Server-side validation
- Quota enforcement
- File upload restrictions
- AI model selection (Haiku vs Sonnet)
- Export capabilities
- Personalization settings
