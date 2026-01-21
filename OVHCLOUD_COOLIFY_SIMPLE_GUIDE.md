# OVHcloud + Coolify Deployment Guide - Simplified

**Goal:** Deploy FifthDraft to production on OVHcloud VPS using Coolify
**Platform:** OVHcloud VPS + Coolify (Docker-based)
**Duration:** Follow one action at a time

---

## ⚠️ IMPORTANT: Before You Start

**You need these 5 things ready:**

1. ✅ Stripe Price IDs (you have these)
2. ⏳ OVHcloud VPS IP address (from email)
3. ⏳ Your domain name pointing to VPS
4. ⏳ Stripe webhook secret (we'll get this)
5. ⏳ All API keys in `.env.local` (OpenAI, Anthropic, etc.)

---

## STEP 1: Get Your OVHcloud VPS IP Address

**What to do:**
1. Check your email from OVHcloud (should have come when you ordered the VPS)
2. Find the line: **"Your VPS IP: XXX.XXX.XXX.XXX"**
3. Write it down: **My VPS IP: _________________**

**⏭️ Once you have the IP, tell me and we'll do STEP 2**

---

## STEP 2: Access Coolify (First Time Setup)

**Prerequisites:**
- You have your VPS IP from STEP 1

**What to do:**

1. Open your browser
2. Go to: `http://YOUR_VPS_IP:8000`
   - Replace `YOUR_VPS_IP` with actual IP (e.g., `http://123.45.67.89:8000`)
3. You should see a Coolify login page
4. Create admin account:
   - Email: Your email
   - Password: Create strong password
   - Save this password somewhere safe

**⏭️ Once Coolify dashboard loads, tell me and we'll do STEP 3**

---

## STEP 3: Connect GitHub to Coolify

**What to do:**

1. In Coolify dashboard, go to: **Settings** → **Repositories**
2. Click **"Connect GitHub"**
3. You'll be taken to GitHub
4. Authorize Coolify to access your repositories
5. Return to Coolify
6. You should see your `FifthDraft` repository in the list

**⏭️ Once GitHub is connected, tell me and we'll do STEP 4**

---

## STEP 4: Create New Application in Coolify

**What to do:**

1. In Coolify, click **"Resources"** (top menu)
2. Click **"New"** or **"Add New Application"**
3. Select **"Docker"** as the source
4. Choose your `FifthDraft` repository
5. Select branch: `main` or `master` (whichever you use)
6. Click **"Create"**

**⏭️ Once application is created, tell me and we'll configure it**

---

## STEP 5: Configure Application Settings

**What to do:**

1. Click on your FifthDraft application
2. Go to **"General"** tab
3. Set these values:
   - **Dockerfile**: `Dockerfile` (should auto-fill)
   - **Docker Compose File**: Leave empty
   - **Build Context**: `.` (dot)
   - **Port**: `3000`
4. Click **"Save"**

**⏭️ Tell me when done**

---

## STEP 6: Add Your Domain

**Prerequisites:**
- Your domain name (e.g., `fifthdraft.com`)
- Domain DNS already points to your VPS IP

**What to do:**

1. In your app, go to **"Domains"** tab
2. Click **"Add Domain"**
3. Type: `your-domain.com` (your actual domain)
4. Enable: **"Generate Let's Encrypt SSL"** (checkbox)
5. Enable: **"Force HTTPS Redirect"** (checkbox)
6. Click **"Save"**

**Wait 2-3 minutes for SSL certificate to generate**

**⏭️ Tell me when domain shows "Active"**

---

## STEP 7: Add Environment Variables

**What to do:**

1. In your app, go to **"Environment Variables"** tab
2. For each variable below, click **"Add Variable"** and enter:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_KEY]
STRIPE_SECRET_KEY=sk_live_[YOUR_KEY]
STRIPE_PRO_MONTHLY_PRICE_ID=price_[YOUR_MONTHLY_PRICE_ID]
STRIPE_PRO_YEARLY_PRICE_ID=price_[YOUR_YEARLY_PRICE_ID]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
ANTHROPIC_API_KEY=sk-ant-[YOUR_KEY]
OPENAI_API_KEY=sk-proj-[YOUR_KEY]
TAVILY_API_KEY=tvly-[YOUR_KEY]
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**⚠️ IMPORTANT:** Replace `https://your-domain.com` with your actual domain

**⏭️ Tell me when all variables are added**

---

## STEP 8: Deploy the Application

**What to do:**

1. Click **"Deploy"** button (large green button)
2. Watch the build logs (they will scroll automatically)
3. Build usually takes 5-10 minutes
4. Look for message: **"Deployment successful"** or **"Running"**
5. Status should change to: 🟢 **Running**

**If build fails:**
- Screenshot the error
- Tell me what it says
- We'll fix it

**⏭️ Tell me when deployment shows "Running"**

---

## STEP 9: Verify Application is Live

**What to do:**

1. Open browser: `https://your-domain.com`
2. You should see FifthDraft homepage
3. Try to sign up with test account
4. If it works, application is deployed! ✅

**⏭️ Tell me if homepage loads**

---

## STEP 10: Configure Stripe Webhook (Final Step)

**What to do:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Make sure you're in **LIVE MODE** (toggle top-right)
3. Click **"Add Endpoint"**
4. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
5. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add Endpoint"**
7. Copy the **Signing Secret** (starts with `whsec_`)
8. Go back to Coolify
9. Update environment variable: `STRIPE_WEBHOOK_SECRET` with the new secret
10. Click **"Redeploy"** (required for env changes)

**⏭️ Tell me when webhook is configured**

---

## STEP 11: Test Payment Flow

**What to do:**

1. Go to: `https://your-domain.com`
2. Sign up with test email
3. Complete onboarding
4. Go to **Pricing** page
5. Click **"Upgrade to Pro"**
6. Use Stripe test card: `4242 4242 4242 4242`
7. Expiry: Any future date (e.g., 12/25)
8. CVC: Any 3 digits (e.g., 123)
9. Complete payment
10. Check if profile updated to Pro

**⏭️ Tell me if payment succeeds**

---

## 🎉 YOU'RE LIVE!

If all steps completed successfully:
- ✅ Application deployed to OVHcloud
- ✅ Domain points to app
- ✅ SSL certificate active
- ✅ Stripe payments working
- ✅ Production ready!

---

## Quick Troubleshooting

**"Cannot access VPS at IP:8000"**
- Check IP is correct
- Wait 5 minutes for Coolify to fully start
- Check firewall allows port 8000

**"Build fails with error"**
- Check Node.js version (should be 18+)
- Check all environment variables are set
- Check GitHub repo has Dockerfile

**"Domain doesn't load"**
- Wait for DNS to propagate (up to 30 mins)
- Check domain DNS points to correct VPS IP
- Verify SSL is active (padlock icon)

**"Payment doesn't work"**
- Check STRIPE_WEBHOOK_SECRET matches Stripe dashboard
- Verify webhook endpoint in Stripe is active
- Check Coolify logs for errors

---

## 📋 Summary of Actions

| Step | Action | Status |
|------|--------|--------|
| 1 | Get VPS IP | ⏳ |
| 2 | Access Coolify | ⏳ |
| 3 | Connect GitHub | ⏳ |
| 4 | Create App | ⏳ |
| 5 | Configure Settings | ⏳ |
| 6 | Add Domain | ⏳ |
| 7 | Add Environment Vars | ⏳ |
| 8 | Deploy | ⏳ |
| 9 | Verify Live | ⏳ |
| 10 | Setup Webhook | ⏳ |
| 11 | Test Payment | ⏳ |

---

**Let's start with STEP 1: Do you have your OVHcloud VPS IP address?**
