# 🚀 FifthDraft Launch Checklist

**Last Updated:** January 17, 2026

---

## ✅ Pre-Launch Setup (30 minutes total)

### 1. Database Migrations (10 minutes)
**Priority:** 🔴 **CRITICAL**

Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/sql)

Run these migrations in order:

```sql
-- 1. Check what's already applied
SELECT * FROM _migrations ORDER BY version;

-- 2. Run remaining migrations from supabase/migrations/ folder
-- Copy and paste each file's contents, starting with:
-- - 00001_initial_schema.sql (if not applied)
-- - 00002_rls_policies.sql (if not applied)
-- - 00003_data_retention.sql (if not applied)
-- ... and so on through:
-- - 20260111000000_idea_studio_features.sql
-- - 20260115000001_add_project_brief.sql
-- - 20260117000000_add_pro_plus_tier.sql
```

**Verify:** Run this to check new columns exist:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notes'
AND column_name IN ('research_data', 'embedding', 'project_brief', 'mindmap_data');
```

You should see all 4 columns listed.

---

### 2. Environment Variables (2 minutes)
**Priority:** 🔴 **CRITICAL for Idea Studio**

Add to your `.env.local` file:

```bash
# Get free API key from https://app.tavily.com/sign-up
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxx
```

**Verify:** Restart your dev server after adding the key.

---

### 3. Storage Bucket (5 minutes)
**Priority:** 🔴 **CRITICAL for recordings**

Go to [Supabase Storage](https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/storage)

Check if `recordings` bucket exists:
- ✅ If yes: Verify RLS policies are set (see STORAGE_BUCKET_SETUP.md)
- ❌ If no: Create it and apply RLS policies from `supabase/migrations/00006_storage_setup.sql`

**Verify:** Try uploading a test file to the bucket.

---

### 4. Stripe Products (Optional - 15 minutes)
**Priority:** 🟡 **For paid subscriptions**

Only needed if you want to test checkout:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create products:
   - **Pro Yearly:** $149/year
   - **Pro Monthly:** $15/month (or delete monthly option)
   - **Pro+ Yearly:** $299/year (waitlist only)

3. Update `src/app/api/checkout/route.ts` with price IDs

**Verify:** Test checkout flow with Stripe test cards.

---

## 🧪 Testing Checklist (1 hour)

### Basic Flow
- [ ] Create new account at `/signup`
- [ ] Complete onboarding (enter name, choose preferences)
- [ ] Land on dashboard
- [ ] See personalized name in sidebar
- [ ] See "0 / 30 minutes used"

### Meeting Notes
- [ ] Click "Meeting Notes" mode
- [ ] Record 30 seconds of audio (browser microphone)
- [ ] Stop recording
- [ ] See "Processing..." status
- [ ] Wait for completion (~1 minute)
- [ ] View note with:
  - [ ] Title (AI-generated)
  - [ ] Summary
  - [ ] Key Points
  - [ ] Action Items (if any mentioned)
  - [ ] Full Transcript

### Export Functions
- [ ] Click Export menu on note
- [ ] Download Markdown - verify file
- [ ] Download PDF - verify file
- [ ] Download DOCX - verify file
- [ ] All files should contain proper content

### Brainstorming / Idea Studio
- [ ] Click "Idea Studio" mode
- [ ] Record brainstorming session (e.g., "I'm thinking about building a mobile app for dog walkers...")
- [ ] Wait for processing
- [ ] View note with Idea Studio sections:
  - [ ] Core Ideas
  - [ ] Expansion Opportunities
  - [ ] Research Questions
  - [ ] Next Steps
  - [ ] Obstacles
  - [ ] Creative Prompts

### Pro Features (requires Pro tier)

**Manual Pro Upgrade:**
```sql
-- Run in Supabase SQL Editor to upgrade test user
UPDATE profiles
SET subscription_tier = 'pro',
    minutes_quota = 2000
WHERE id = 'your-user-id-here';
```

After upgrade:
- [ ] Idea Studio Actions section appears
- [ ] Click "AI Research" - verify web search results
- [ ] Click "Project Brief" - verify structured plan
- [ ] Click "Mind Map" - verify visual diagram
- [ ] Test file upload (MP3, WAV, etc.)
- [ ] Test system audio capture

### Usage Tracking
- [ ] Create multiple recordings
- [ ] Check dashboard minutes counter increments
- [ ] Verify minutes_used increases in database

---

## 🚨 Troubleshooting

### "Recording upload failed"
**Solution:** Create storage bucket (step 3 above)

### "Database error"
**Solution:** Run migrations (step 1 above)

### "AI Research failed"
**Solution:** Add TAVILY_API_KEY (step 2 above)

### "Cannot access microphone"
**Solution:**
- Use Chrome or Edge browser
- Click "Allow" when prompted for microphone access
- Check browser settings if blocked

### "Transcription failed"
**Solution:** Verify OPENAI_API_KEY in .env.local

### Minutes not incrementing
**Solution:** Run migration `00005_increment_minutes_used_function.sql`

---

## 📊 Quick Database Queries

### Check user tier
```sql
SELECT email, subscription_tier, minutes_used, minutes_quota
FROM auth.users
JOIN profiles ON auth.users.id = profiles.id;
```

### View recent recordings
```sql
SELECT id, user_id, mode, status, duration, created_at
FROM recordings
ORDER BY created_at DESC
LIMIT 10;
```

### Check note with Idea Studio data
```sql
SELECT
  id,
  title,
  mode,
  research_data IS NOT NULL as has_research,
  project_brief IS NOT NULL as has_brief,
  embedding IS NOT NULL as has_embedding
FROM notes
WHERE mode = 'brainstorming'
ORDER BY created_at DESC;
```

### Manually upgrade user to Pro
```sql
UPDATE profiles
SET subscription_tier = 'pro',
    minutes_quota = 2000
WHERE id = 'user-id-from-auth';
```

---

## 🎯 Success Criteria

Before launching to users, verify:

- ✅ **Onboarding** works smoothly
- ✅ **Recording** works (all 3 modes: browser, system audio, file upload)
- ✅ **AI Processing** completes without errors
- ✅ **Meeting Notes** has proper structure
- ✅ **Idea Studio** shows differentiated output
- ✅ **Export** works (MD, PDF, DOCX)
- ✅ **Pro Features** work (research, brief, mind map)
- ✅ **Usage Tracking** increments correctly
- ✅ **Tier Enforcement** blocks free users from Pro features
- ✅ **UI** looks professional on desktop and mobile

---

## 🚀 Launch Options

### Option 1: Soft Launch (Recommended)
- [ ] Invite 10-20 beta testers
- [ ] Collect feedback
- [ ] Fix any issues found
- [ ] Iterate for 1-2 weeks
- [ ] Public launch

### Option 2: Friends & Family
- [ ] Share with close network
- [ ] Get honest feedback
- [ ] Polish UX based on input
- [ ] Prepare marketing materials

### Option 3: Public Launch
- [ ] Deploy to production domain
- [ ] Set up monitoring
- [ ] Create marketing campaign
- [ ] Post on social media
- [ ] Submit to Product Hunt

---

## 📈 Post-Launch Monitoring

### Key Metrics to Track
- Daily active users (DAU)
- New signups per day
- Free → Pro conversion rate
- Average recording duration
- Most used features
- Error rates
- API costs (Whisper, Claude, Tavily)

### Cost Monitoring
- OpenAI (Whisper + Embeddings)
- Anthropic (Claude)
- Tavily (Web search)
- Supabase (Database + Storage)
- Stripe (Payment processing)

**Target:** Keep AI costs under $0.30 per note

---

## 🎉 You're Ready to Launch!

All Phase 1 features are complete and working:
- ✅ Onboarding flow
- ✅ Meeting Notes
- ✅ Idea Studio
- ✅ Export functions
- ✅ Pro tier features
- ✅ Beautiful UI

**Next Steps:**
1. Run the 30-minute setup
2. Test for 1 hour
3. Invite beta users
4. 🚀 **LAUNCH!**

---

**Questions?** Check these docs:
- [REMAINING_PHASES_COMPLETE.md](REMAINING_PHASES_COMPLETE.md) - Detailed completion summary
- [FEATURE_COMPLETENESS_REPORT.md](FEATURE_COMPLETENESS_REPORT.md) - All features breakdown
- [IDEA_STUDIO_FEATURES.md](IDEA_STUDIO_FEATURES.md) - Idea Studio guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project overview
