# 🚀 Vercel Deployment Guide - FifthDraft

**Estimated time: 15 minutes**

---

## Step 1: Prepare Your GitHub Repo (2 minutes)

```bash
# Initialize git (if not already done)
cd "d:\Project\Fifth Draft"
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - FifthDraft app"

# Create GitHub repo and push
# Go to https://github.com/new
# Create repo named "fifth-draft"
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/fifth-draft.git
git branch -M main
git push -u origin main
```

---

## Step 2: Connect to Vercel (3 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Select **"Import Git Repository"**
4. Find and select your `fifth-draft` repo
5. Click **Import**

---

## Step 3: Configure Environment Variables (5 minutes)

In Vercel dashboard, go to **Settings → Environment Variables** and add:

### Required (Critical)
```
NEXT_PUBLIC_SUPABASE_URL=https://wxcnnysvzfsrljyehygp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
OPENAI_API_KEY=sk-...
```

### Optional (For Pro Features)
```
TAVILY_API_KEY=tvly-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Get these from:**
- Supabase: Settings → API → Keys & Configuration
- OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Tavily: [app.tavily.com](https://app.tavily.com)
- Stripe: [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

---

## Step 4: Deploy (3 minutes)

1. Back in Vercel dashboard
2. Click **"Deploy"**
3. Wait for build to complete (~2-3 minutes)
4. Click the deployed URL when ready

---

## Step 5: Run Post-Deployment Setup (2 minutes)

### In Supabase SQL Editor:

```sql
-- 1. Check migrations are applied
SELECT * FROM _migrations ORDER BY version;

-- 2. If not all applied, run remaining migrations from supabase/migrations/

-- 3. Verify storage bucket exists
-- Go to Supabase → Storage → Check "recordings" bucket
-- If missing, create it and apply RLS policies from 00006_storage_setup.sql
```

---

## Quick Test Checklist

- [ ] Visit deployed URL (no errors)
- [ ] Sign up with test email
- [ ] Complete onboarding
- [ ] Record 30-second audio in Meeting Notes mode
- [ ] See "Processing..."
- [ ] View completed note with title, summary, key points
- [ ] Export as PDF
- [ ] Check Pro feature access (shows appropriate tier)

---

## 🚨 If Build Fails

### Common Issues:

**"Cannot find module"**
```bash
npm install
```

**"Type errors in TypeScript"**
- Fix in your local code, commit, and push
- Vercel redeploys automatically

**"Supabase connection error"**
- Verify env vars match exactly
- Check Supabase project is active

**"Build timeout"**
- Try deploying from Vercel dashboard again
- Check your build script in `package.json`

---

## Domain Setup (Optional)

1. In Vercel dashboard: **Settings → Domains**
2. Add your custom domain
3. Point DNS to Vercel (instructions in dashboard)
4. Wait 24-48 hours for DNS propagation

---

## ✅ You're Live!

Your app is now deployed and accessible to the world.

**Next steps:**
1. Test thoroughly with real users
2. Monitor for errors in Vercel dashboard
3. Scale up features based on feedback

---

## Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Console](https://app.supabase.com)
- [Your Vercel Deployments](https://vercel.com/deployments)
