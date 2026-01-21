# 🚀 Complete Launch Guide - FifthDraft to Vercel

**Total Time: ~60 minutes**

---

## 📋 Pre-Launch Checklist

### Phase 1: Database & Infrastructure Setup (10 minutes)

#### 1.1 Apply All Database Migrations
Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/sql)

Run in order:
```sql
-- Check what's already applied
SELECT * FROM _migrations ORDER BY version;
```

Then copy & paste each file from `supabase/migrations/` in this order:
1. `00001_initial_schema.sql`
2. `00002_rls_policies.sql`
3. `00003_data_retention.sql`
4. `00004_add_recording_type.sql`
5. `00005_increment_minutes_used_function.sql`
6. `00005_folders_and_categories.sql`
7. `00006_storage_setup.sql`
8. `00007_fix_profiles_insert.sql`
9. `00008_fix_recordings_fkey.sql`
10. `00009_fix_all_issues.sql`
11. `20260111000000_idea_studio_features.sql`
12. `20260115000000_fix_pro_quota.sql`
13. `20260115000001_add_project_brief.sql`
14. `20260117000000_add_pro_plus_tier.sql`

Verify:
```sql
-- Check critical tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

#### 1.2 Create Storage Bucket
Go to [Supabase Storage](https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/storage)

- [ ] Check if `recordings` bucket exists
- [ ] If missing: Click **New Bucket**, name it `recordings`, set to **Private**
- [ ] Run RLS policies from `00006_storage_setup.sql`

#### 1.3 Verify Database Schema
```sql
-- Check profiles table has these columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY column_name;
```

Should include: `stripe_customer_id`, `stripe_subscription_id`, `subscription_tier`, `subscription_status`, `minutes_quota`, `minutes_used`

---

### Phase 2: Stripe Payment Setup (20 minutes)

#### 2.1 Create Stripe Products & Prices

Go to [Stripe Dashboard](https://dashboard.stripe.com)

**Create Product 1: Pro Monthly**
1. Products → Add Product
2. Name: `Pro Monthly`
3. Price: $15/month
4. Billing Period: Monthly
5. Copy the **Price ID** (starts with `price_`)
6. Save

**Create Product 2: Pro Yearly**
1. Products → Add Product
2. Name: `Pro Yearly`
3. Price: $149/year
4. Billing Period: Yearly
5. Copy the **Price ID** (starts with `price_`)
6. Save

**Create Product 3: Pro+ (Optional)**
1. Products → Add Product
2. Name: `Pro+ Yearly`
3. Price: $299/year
4. Billing Period: Yearly
5. Copy the **Price ID** (starts with `price_`)
6. Save

#### 2.2 Get Stripe API Keys

Go to [Stripe API Keys](https://dashboard.stripe.com/apikeys)

Copy:
- [ ] **Publishable key** (starts with `pk_live_`)
- [ ] **Secret key** (starts with `sk_live_`)

⚠️ **KEEP THESE SECRET - Never commit to GitHub**

#### 2.3 Create Stripe Webhook

Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)

1. Click **Add endpoint**
2. URL: `https://yourdomain.com/api/webhooks/stripe`
   (Use Vercel deployment URL after deploy)
3. Events to send:
   - [ ] `checkout.session.completed`
   - [ ] `customer.subscription.created`
   - [ ] `customer.subscription.updated`
   - [ ] `customer.subscription.deleted`
   - [ ] `invoice.payment_succeeded`
   - [ ] `invoice.payment_failed`
4. Copy **Signing secret** (starts with `whsec_`)

---

### Phase 3: API Keys Collection (5 minutes)

Gather these from your providers:

**Supabase** (from [Settings → API](https://app.supabase.com/projects))
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (https://xxxxx.supabase.co)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**OpenAI** (from [API Keys](https://platform.openai.com/api-keys))
- [ ] `OPENAI_API_KEY` (sk_...)

**Tavily AI** (from [Dashboard](https://app.tavily.com))
- [ ] `TAVILY_API_KEY` (tvly_...)

**Stripe** (collected above)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRO_MONTHLY_PRICE_ID`
- [ ] `STRIPE_PRO_YEARLY_PRICE_ID`

**Optional: Anthropic**
- [ ] `ANTHROPIC_API_KEY` (sk-...)

---

## 🚀 Vercel Deployment (20 minutes)

### Step 1: Push to GitHub

```bash
cd "d:\Project\Fifth Draft"

# Verify git is initialized
git status

# Add all files
git add .

# Commit
git commit -m "Ready for launch on Vercel"

# Create GitHub repo
# Go to https://github.com/new
# Name: fifth-draft
# Then:

git remote add origin https://github.com/YOUR_USERNAME/fifth-draft.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Click **Import Git Repository**
4. Find `fifth-draft` repo and click **Import**
5. Click **Deploy** (without changing settings yet)

*Wait for initial build to complete*

### Step 3: Configure Environment Variables

In Vercel dashboard → **Settings → Environment Variables**

Add all variables from Phase 3:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
ANTHROPIC_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

### Step 4: Redeploy with Environment Variables

1. In Vercel: **Deployments → Latest**
2. Click **Redeploy**
3. Wait for build to complete (~3-5 minutes)
4. Click the URL when ready

### Step 5: Update Stripe Webhook URL

Go back to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)

1. Find your endpoint (or create new if not done)
2. Update URL to: `https://YOUR_VERCEL_DOMAIN/api/webhooks/stripe`
3. Save

---

## ✅ Post-Deployment Verification (15 minutes)

### 5.1 Basic Functionality Test

Visit your deployed URL:

- [ ] Page loads without errors
- [ ] Can see **Sign Up** page
- [ ] **Sign Up** works (create test account)
- [ ] **Onboarding** completes (name, preferences)
- [ ] **Dashboard** loads with personalized greeting
- [ ] See **"0 / 30 minutes used"** counter

### 5.2 Recording Test

- [ ] Click **Meeting Notes**
- [ ] Record 30 seconds of audio
- [ ] Stop recording
- [ ] See **"Processing..."** status
- [ ] Wait 1-2 minutes for completion
- [ ] Verify output has:
  - Title (AI-generated)
  - Summary
  - Key Points
  - Action Items
  - Full Transcript

### 5.3 Pro Features Test

Manually upgrade test user in Supabase:

```sql
UPDATE profiles
SET subscription_tier = 'pro',
    minutes_quota = 2000
WHERE id = 'your-test-user-id';
```

Then:
- [ ] See Pro features unlocked
- [ ] Click **Idea Studio** mode
- [ ] Record brainstorming session
- [ ] See:
  - Core Ideas
  - Expansion Opportunities
  - Research Questions
  - Next Steps
  - Obstacles
  - Creative Prompts
- [ ] Click **AI Research** - verify web search results
- [ ] Click **Project Brief** - verify structured plan
- [ ] Click **Mind Map** - verify visual diagram

### 5.4 Stripe Payment Test

- [ ] Click **Pricing** page
- [ ] Click **Upgrade to Pro**
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/25)
- [ ] CVC: Any 3 digits (e.g., 123)
- [ ] Click **Pay**
- [ ] Should redirect to dashboard with **"Checkout successful"** message
- [ ] Check Supabase: Profile should show `subscription_tier = 'pro'`

### 5.5 Export Test

- [ ] Create a note
- [ ] Click **Export** menu
- [ ] Download as **Markdown** - verify file
- [ ] Download as **PDF** - verify file
- [ ] Download as **DOCX** - verify file

### 5.6 Error Monitoring

In Vercel dashboard:
- [ ] Check **Deployments** for any build errors
- [ ] Check **Functions** for any API errors
- [ ] Check **Analytics** for traffic patterns

---

## 🎯 Pre-Launch Configuration

### Domain Setup (Optional but Recommended)

1. Vercel Dashboard → **Settings → Domains**
2. Add your custom domain (e.g., `fifthd raft.com`)
3. Follow DNS setup instructions
4. Update:
   - Stripe webhook URL to use new domain
   - Environment variable `NEXT_PUBLIC_APP_URL`
5. Wait 24-48 hours for DNS propagation

### Email Configuration (Optional)

For sending password reset emails:
- Set up [Supabase Email](https://supabase.com/docs/guides/auth/sms-otp#sms-authentication-with-twilio)
- Or use [Resend](https://resend.com) for transactional emails

---

## 🐛 Troubleshooting

### "Build failed on Vercel"
- Check build logs in Vercel dashboard
- Fix TypeScript errors locally
- Push to GitHub (auto-redeploy)

### "Database connection error"
- Verify `NEXT_PUBLIC_SUPABASE_URL` matches exactly
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify all migrations are applied

### "Stripe webhook not working"
- Check webhook URL is correct (with full domain)
- Verify `STRIPE_WEBHOOK_SECRET` in Vercel env vars
- Check Stripe dashboard for webhook delivery logs

### "Recording upload fails"
- Verify `recordings` bucket exists in Supabase Storage
- Check Storage RLS policies are applied
- Verify bucket is set to **Private**

### "AI features not working"
- Verify all API keys are in Vercel env vars
- Check OpenAI & Tavily accounts are active
- Check API quotas haven't been exceeded

### "Payment page stuck or white screen"
- Check browser console for errors (F12)
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Try clearing browser cache

---

## 📊 Launch Monitoring Checklist

After going live:

### Daily Checks
- [ ] No critical errors in Vercel logs
- [ ] Stripe webhooks processing successfully
- [ ] New users can sign up
- [ ] Recordings process without errors

### Weekly Checks
- [ ] Review usage patterns
- [ ] Check conversion rate (free → Pro)
- [ ] Monitor API costs
- [ ] Check for any user-reported bugs

### Metrics to Track
- Daily active users (DAU)
- New signups
- Free → Pro conversion rate
- Average recording duration
- Error rates
- API costs per user

---

## 🎉 Launch Complete!

Your app is live and ready for users.

### Next Steps:
1. ✅ Share with beta testers (10-20 people)
2. ✅ Collect feedback for 1-2 weeks
3. ✅ Fix critical issues
4. ✅ Public launch / marketing push
5. ✅ Monitor metrics and scale

### Important Links:
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Console](https://app.supabase.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Your App](https://your-domain.vercel.app)

---

## Quick Reference

| Component | Status | Config |
|-----------|--------|--------|
| Database | ✅ | Migrations applied |
| Storage | ✅ | recordings bucket |
| Stripe Products | ✅ | Pro Monthly, Pro Yearly |
| API Keys | ✅ | In Vercel env vars |
| Webhooks | ✅ | Stripe endpoint |
| Domain | ⏳ | Optional |
| Email | ⏳ | Optional |

---

**Questions?** Check docs in project or contact support.
