# FifthDraft Launch Implementation Guide

**Status:** Ready to Execute
**Date:** January 20, 2026
**Total Steps:** 30 Action Items across 6 Phases

---

## PHASE 1: ✅ COMPLETE - Critical Security Fixes

**Status:** DONE
- ✅ Deleted insecure admin endpoint
- ✅ Installed Resend package

**What was done:**
```bash
rm -rf src/app/api/admin                    # Removed password reset endpoint with no auth
npm install resend                          # Added email service
```

---

## PHASE 2: External Service Setup (You Must Complete These)

### STEP 1: Create Stripe Live Mode Products

**Time Required:** 15 minutes

**What to do:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click **"Add Product"**
3. **Create Product 1: Pro Monthly**
   - Name: `FifthDraft Pro - Monthly`
   - Description: `2000 minutes/month, Idea Studio, lifetime retention`
   - Type: `Recurring`
   - Price: `$15.00 USD`
   - Billing period: `Monthly`
   - Click **"Save product"**
   - **Copy the Price ID** (starts with `price_`) - you'll need this

4. **Create Product 2: Pro Yearly**
   - Name: `FifthDraft Pro - Yearly`
   - Description: `2000 minutes/month, Idea Studio, lifetime retention (save $31/year)`
   - Type: `Recurring`
   - Price: `$149.00 USD`
   - Billing period: `Yearly`
   - Click **"Save product"**
   - **Copy the Price ID** - you'll need this

**Result:**
You should have two Price IDs:
- Monthly: `price_xxxxx...`
- Yearly: `price_xxxxx...`

---

### STEP 2: Configure Stripe Environment Variables

**Time Required:** 5 minutes

**What to do:**

1. Open `d:\Project\Fifth Draft\.env.local`
2. Find these lines:
   ```env
   STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID_HERE
   STRIPE_PRO_YEARLY_PRICE_ID=price_YOUR_YEARLY_PRICE_ID_HERE
   ```
3. Replace with your actual Price IDs from Step 1:
   ```env
   STRIPE_PRO_MONTHLY_PRICE_ID=price_1NsXmzK8IxYZqE...
   STRIPE_PRO_YEARLY_PRICE_ID=price_1NsXmzK8IxYZqF...
   ```
4. Save the file
5. Restart dev server (if running)

**Verification:**
```bash
# In terminal, check the values were set
grep STRIPE_PRO .env.local
```

---

### STEP 3: Set Up Stripe Webhook (Local Testing)

**Time Required:** 10 minutes

**What to do:**

1. **Install Stripe CLI** (if not already installed)
   - Windows: `scoop install stripe` OR download from https://github.com/stripe/stripe-cli/releases
   - Mac: `brew install stripe/stripe-cli/stripe`

2. **Login to Stripe**
   ```bash
   stripe login
   ```
   - A browser will open, click **"Allow"** to authorize
   - Return to terminal

3. **Start webhook listener**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   - You'll see output like:
   ```
   > Ready! Your webhook signing secret is: whsec_test_xxxxxxxxxxxxx
   ```

4. **Copy the signing secret** - you need this next

5. **Update .env.local:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
   ```

6. **Keep this terminal window open** - the webhook listener must stay running during testing

**Note:** For production (after OVHcloud deployment), you'll get a different webhook secret from Stripe Dashboard.

---

### STEP 4: Create Upstash Account & Redis Database

**Time Required:** 10 minutes

**What to do:**

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Click **"Sign Up"** (use GitHub or email)
3. Complete signup and verify email
4. Click **"Create Database"** (Redis)
5. Configure:
   - **Name:** `fifthdraft-ratelimit`
   - **Type:** `Regional` (or Global if you prefer lower latency)
   - **Region:** Choose closest to your users (e.g., us-east-1, eu-west-1)
   - Click **"Create"**
6. Wait for database to be created (1-2 minutes)
7. Click on the database name to open it
8. Copy these values:
   - **UPSTASH_REDIS_REST_URL** (starts with `https://...upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long token)

**Verification:**
Test the connection:
```bash
curl -X GET \
  "https://[YOUR_URL]/get/test" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```

---

### STEP 5: Install Rate Limiting Packages

**Time Required:** 5 minutes

**What to do:**

```bash
cd "d:\Project\Fifth Draft"
npm install @upstash/ratelimit @upstash/redis
```

**Verify installation:**
```bash
npm list @upstash/ratelimit @upstash/redis
```

---

### STEP 6: Configure Upstash Environment Variables

**Time Required:** 5 minutes

**What to do:**

1. Open `.env.local`
2. Add these lines (using values from Step 4):
   ```env
   UPSTASH_REDIS_REST_URL=https://[your-database-id].upstash.io
   UPSTASH_REDIS_REST_TOKEN=[your-token-here]
   ```

3. Save the file

---

### STEP 7: Create Resend Account

**Time Required:** 5 minutes

**What to do:**

1. Go to [resend.com/signup](https://resend.com/signup)
2. Enter your email
3. Check email for verification link
4. Click verification link
5. You're now registered with Resend

---

### STEP 8: Get Resend API Key

**Time Required:** 2 minutes

**What to do:**

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click **"Create API Key"**
3. Name: `FifthDraft Production`
4. Permissions: `Sending access`
5. Click **"Add"**
6. Copy the API key (starts with `re_`)

---

### STEP 9: Add Resend API Key to Environment

**Time Required:** 2 minutes

**What to do:**

1. Open `.env.local`
2. Find or add:
   ```env
   RESEND_API_KEY=re_[paste_your_key_here]
   EMAIL_FROM=FifthDraft <onboarding@resend.dev>
   ```
3. Save file

**Note:** For production, you'll change `EMAIL_FROM` to use your custom domain after verification.

---

### STEP 10: Verify Domain in Resend (Optional for testing, Required for Production)

**Time Required:** 30 minutes

**For Local Testing (Skip This):**
You can use the test domain `onboarding@resend.dev` without verification.

**For Production:**
1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain: `your-domain.com`
4. Follow instructions to add DNS records (SPF, DKIM) to your domain registrar
5. Wait for verification (usually 10-30 minutes)
6. Once verified, update `.env.local`:
   ```env
   EMAIL_FROM=FifthDraft <noreply@your-domain.com>
   ```

---

## PHASE 3: Code Implementation (I Will Do This)

### Implementation Tasks (Automated)

**What I'll do for you:**

1. ✅ Create rate limit utility (`src/lib/rate-limit.ts`)
2. ✅ Apply rate limiting to 6 critical endpoints:
   - `/api/transcribe` - transcription endpoint
   - `/api/notes/[id]/research` - AI research
   - `/api/notes/[id]/project-brief` - project brief generation
   - `/api/notes/[id]/mindmap` - mind map generation
   - `/api/checkout` - payment processing
   - `/api/webhooks/stripe` - webhook handler

3. ✅ Add welcome email trigger to signup flow
4. ✅ Add subscription confirmation email to Stripe webhook
5. ✅ Enable email verification in Supabase

**Time:** ~2 hours (I'll complete this)

---

## PHASE 4: Local Testing

### STEP 11: Restart Dev Server

**Time Required:** 2 minutes

**What to do:**

1. Check if dev server is still running: `npm run dev`
2. If not, start it:
   ```bash
   cd "d:\Project\Fifth Draft"
   npm run dev
   ```
3. Open browser: `http://localhost:3000`
4. Verify it loads (you should see the landing page)

---

### STEP 12: Test Complete Signup Flow

**Time Required:** 10 minutes

**What to do:**

1. Open `http://localhost:3000`
2. Click **"Get Started"** or go to `/signup`
3. Sign up with a test email:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. Complete the signup
5. Check if you can:
   - Complete onboarding
   - Access dashboard
   - See free tier features available

**Expected Result:**
- Welcome email logged to console (dev mode)
- User profile created in Supabase
- Redirected to onboarding

---

### STEP 13: Test Stripe Checkout

**Time Required:** 15 minutes

**What to do:**

1. In dashboard, go to **Pricing** page
2. Click **"Upgrade to Pro"** (monthly)
3. Stripe Checkout should load
4. Use test card: `4242 4242 4242 4242`
5. Expiry: Any future date (e.g., 12/25)
6. CVC: Any 3 digits (e.g., 123)
7. Name: Any name
8. Click **"Pay"**
9. Wait for redirect (should go to `/dashboard?checkout=success`)

**Expected Result:**
- Payment completes without error
- Stripe webhook receives `checkout.session.completed` event
- User profile updated to `subscription_tier: 'pro'`
- Minutes quota increased to 2000

---

### STEP 14: Test Rate Limiting

**Time Required:** 10 minutes

**What to do:**

1. Get a valid auth token:
   ```bash
   # In console on authenticated page, run:
   const token = localStorage.getItem('sb-auth-token')
   console.log(JSON.parse(token)?.session?.access_token)
   ```

2. Test rate limit (make 15 requests quickly):
   ```bash
   for i in {1..15}; do
     curl -X POST http://localhost:3000/api/transcribe \
       -H "Authorization: Bearer [YOUR_TOKEN]" \
       -H "Content-Type: application/json" \
       -d '{"recording_id": "test"}'
     echo "Request $i"
     sleep 0.1
   done
   ```

3. After request 10, you should see:
   ```json
   {
     "error": "Too many requests. Please try again later.",
     "remaining": 0,
     "reset": "2026-01-20T..."
   }
   ```

**Expected Result:**
Rate limiting working - requests blocked after limit exceeded.

---

### STEP 15: Verify Email Templates Work

**Time Required:** 10 minutes

**What to do:**

1. In dashboard dev console, check for email logs:
   ```bash
   # Should see in console:
   # === EMAIL (Dev Mode - No Resend configured) ===
   # To: test@example.com
   # Subject: Welcome to FifthDraft!
   ```

2. Check webhook logs for subscription email:
   ```bash
   # After completing Stripe payment, check console for:
   # === EMAIL (Dev Mode - No Resend configured) ===
   # To: [user-email]
   # Subject: Welcome to FifthDraft Pro!
   ```

**Expected Result:**
Email templates being triggered correctly (logged to console in dev mode).

---

## PHASE 5: Deployment Preparation

### STEP 16: Document Your Configuration

**Time Required:** 5 minutes

**What to do:**

Create a file `LAUNCH_CONFIG.txt` with all your keys:

```
STRIPE CONFIGURATION
====================
Monthly Price ID: price_xxx...
Yearly Price ID: price_xxx...
Webhook Secret: whsec_xxx...

RESEND CONFIGURATION
====================
API Key: re_xxx...
Email From: your-email@domain.com

UPSTASH CONFIGURATION
====================
Redis URL: https://xxx.upstash.io
Redis Token: xxx...

SUPABASE CONFIGURATION
====================
Project URL: https://xxx.supabase.co
Anon Key: eyJ...
Service Role Key: eyJ...

OPENAI CONFIGURATION
====================
API Key: sk-...

ANTHROPIC CONFIGURATION
====================
API Key: sk-ant-...

TAVILY CONFIGURATION
====================
API Key: tvly-...
```

**Keep this file secure** - you'll need these values for OVHcloud deployment.

---

### STEP 17: Prepare OVHcloud VPS

**Time Required:** 30 minutes

**What to do:**

1. Go to [OVHcloud VPS](https://www.ovhcloud.com/en/vps/)
2. Select **Essential VPS** (recommended)
3. Choose:
   - **OS:** Ubuntu 22.04 LTS
   - **vCPU:** 2 cores
   - **RAM:** 4GB
   - **Storage:** 80GB SSD
   - **Region:** Choose closest to your users
4. Complete checkout and payment
5. Wait for provisioning email (usually 10-30 minutes)
6. Note down your **VPS IP address** from the email

---

### STEP 18: Set Up VPS - SSH & Docker

**Time Required:** 20 minutes

**What to do:**

Open a terminal and run:

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# You'll be asked for password (from OVHcloud email)
# Then set a new root password

# Update system packages
apt update && apt upgrade -y

# Reboot if kernel was updated
reboot

# Reconnect after reboot
ssh root@YOUR_VPS_IP

# Install Docker
curl -fsSL https://get.docker.com | sh

# Verify Docker is working
docker --version
```

**Result:**
Docker installed and running on your VPS.

---

### STEP 19: Install Coolify on VPS

**Time Required:** 10 minutes

**What to do:**

```bash
# Still SSH'd into your VPS, run:
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Wait for installation to complete (5-10 minutes)
# You'll see a success message when done
```

**After installation:**

1. Open browser: `http://YOUR_VPS_IP:8000`
2. Create admin account with strong password
3. Save this password somewhere secure

---

### STEP 20: Configure Domain DNS

**Time Required:** 10 minutes (+ DNS propagation time)

**What to do:**

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS management section
3. Add these A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_VPS_IP | 300 |
| A | www | YOUR_VPS_IP | 300 |

4. Save changes
5. Wait 5-15 minutes for DNS to propagate
6. Verify with:
   ```bash
   nslookup your-domain.com
   # Should return your VPS IP
   ```

---

### STEP 21: Deploy Application in Coolify

**Time Required:** 20 minutes

**What to do:**

1. Open Coolify: `http://YOUR_VPS_IP:8000`
2. Log in with your admin account
3. Click **"Resources"** → **"Applications"** → **"New Application"**
4. Select **"Docker"**
5. Click **"Connect GitHub Account"** and authorize Coolify
6. Select your FifthDraft repository
7. Choose branch: `main` or `master`
8. Build Configuration:
   - Dockerfile Location: `./Dockerfile`
   - Build Context: `.`
   - Port: `3000`

9. Click **"Create Application"**

---

### STEP 22: Add Domain in Coolify

**Time Required:** 5 minutes

**What to do:**

1. In Coolify, go to your application
2. Click **"Domains"**
3. Add domain: `your-domain.com`
4. Add domain: `www.your-domain.com` (optional)
5. Enable: **"Generate Let's Encrypt SSL Certificate"**
6. Enable: **"Force HTTPS Redirect"**
7. Save changes

---

### STEP 23: Add Environment Variables in Coolify

**Time Required:** 15 minutes

**What to do:**

1. In Coolify, go to your application
2. Click **"Environment Variables"**
3. Add all these variables (using values from your configuration):

```
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...

# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx...
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=FifthDraft <noreply@your-domain.com>

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx...
```

4. Click **"Save"**

---

### STEP 24: Deploy Application

**Time Required:** 10 minutes

**What to do:**

1. Click **"Deploy"** button
2. Monitor the build logs
3. Build should complete in 5-10 minutes
4. Status should change to **"Running"**

**If build fails:**
- Check build logs for errors
- Common issues:
  - Node version mismatch
  - Missing dependencies
  - Environment variable issues

---

### STEP 25: Create Production Stripe Webhook

**Time Required:** 10 minutes

**What to do:**

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Make sure you're in **Live Mode** (toggle in top-right)
3. Click **"Add Endpoint"**
4. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
5. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add Endpoint"**
7. Copy the **Signing Secret** (starts with `whsec_`)
8. Go back to Coolify
9. Update `STRIPE_WEBHOOK_SECRET` with this new live secret
10. Click **"Redeploy"**

---

## PHASE 6: Testing & Launch

### STEP 26: Verify Application is Running

**Time Required:** 5 minutes

**What to do:**

```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Should return:
# {"status":"healthy","timestamp":"...","services":{...}}
```

---

### STEP 27: Test Complete Signup Flow

**Time Required:** 15 minutes

**What to do:**

1. Open `https://your-domain.com` in browser
2. Click **"Get Started"**
3. Sign up with new email:
   - Email: `test-prod@example.com`
   - Password: `TestPassword123!`
4. Check email for verification link
5. Click the link in email
6. Complete onboarding
7. Access dashboard

**Expected Results:**
- Verification email received ✅
- Email verification works ✅
- Onboarding completes ✅
- Dashboard loads ✅

---

### STEP 28: Test Payment Flow

**Time Required:** 20 minutes

**What to do:**

1. Log in to your test account
2. Go to **Pricing** page
3. Click **"Upgrade to Pro"**
4. Complete Stripe payment with:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
5. Wait for redirect
6. Verify:
   - You're now Pro tier
   - Minutes quota is 2000
   - Pro features are enabled
   - Subscription confirmation email received

**Expected Results:**
- Payment succeeds ✅
- Profile updated to Pro ✅
- Webhook delivered successfully ✅
- Confirmation email sent ✅

---

### STEP 29: Test Core Features

**Time Required:** 20 minutes

**What to do:**

1. **Test Recording:**
   - Click "Record Meeting Note"
   - Record 30 seconds of audio
   - Wait for transcription
   - Verify note appears in dashboard

2. **Test Pro Features:**
   - Go to Idea Studio
   - Record brainstorming audio
   - Verify "AI Research" button appears
   - Click to generate research
   - Verify Project Brief works

3. **Test Export:**
   - Open a note
   - Export as Markdown
   - Export as PDF
   - Verify exports work

---

### STEP 30: Final Launch Checklist

**Time Required:** 10 minutes

**What to do:**

Verify all of these:

- [ ] Domain resolves to your VPS: `nslookup your-domain.com`
- [ ] SSL certificate valid: `curl -I https://your-domain.com` (check for 200 OK)
- [ ] Health endpoint healthy: `curl https://your-domain.com/api/health`
- [ ] Homepage loads: Open `https://your-domain.com` in browser
- [ ] Signup works: Create test account
- [ ] Email verification works: Check email for verification link
- [ ] Stripe payment works: Complete test purchase
- [ ] Pro features enabled: Check dashboard after payment
- [ ] Webhook delivered: Check Stripe dashboard for successful deliveries
- [ ] Logs show no errors: Check Coolify logs for any errors

**If everything is green:**
✅ **YOUR APP IS LIVE** ✅

---

## TROUBLESHOOTING

### Common Issues & Solutions

**1. Stripe Checkout Shows "No Such Price" Error**
- Problem: Price IDs not configured correctly
- Solution: Double-check `STRIPE_PRO_MONTHLY_PRICE_ID` and `STRIPE_PRO_YEARLY_PRICE_ID` in environment variables

**2. Email Not Sending**
- Problem: Resend API key not valid
- Solution: Verify `RESEND_API_KEY` is correct in environment variables

**3. Rate Limiting Not Working**
- Problem: Upstash Redis not configured
- Solution: Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct

**4. DNS Not Propagating**
- Problem: Changed DNS but site still doesn't resolve
- Solution: Wait 5-30 minutes, clear browser cache, try `nslookup` from command line

**5. SSL Certificate Not Generating**
- Problem: Let's Encrypt unable to validate domain
- Solution: Ensure DNS is propagated and ports 80/443 are open on firewall

**6. Build Fails in Coolify**
- Problem: Docker build error
- Solution: Check build logs, ensure all dependencies in `package.json`, verify Node version

---

## SUMMARY

### What You Need to Do (Actions Required)

**IMMEDIATE (Do These First):**
1. ✅ Create Stripe products (2 price IDs needed)
2. ✅ Set up Upstash Redis database
3. ✅ Create Resend account and get API key
4. ✅ Configure all environment variables
5. ✅ Test locally with dev server

**THEN (Infrastructure Setup):**
6. ✅ Provision OVHcloud VPS
7. ✅ Install Docker on VPS
8. ✅ Install Coolify on VPS
9. ✅ Configure domain DNS
10. ✅ Deploy app in Coolify
11. ✅ Set up Stripe production webhook

**FINALLY (Testing & Verification):**
12. ✅ Test signup flow
13. ✅ Test payment flow
14. ✅ Test all features
15. ✅ Go live!

### Timeline
- External Services Setup: **1-2 hours**
- Code Implementation: **2 hours** (I handle this)
- Local Testing: **1 hour**
- VPS & Coolify Setup: **1.5 hours**
- Production Testing & Launch: **1 hour**

**Total: 6-7 hours from start to launch**

---

## Next Steps

1. **Start with Phase 2 Steps 1-10** - Create external service accounts
2. **I'll implement Phase 3** - Code changes and integrations
3. **You do Phase 4** - Local testing
4. **You do Phase 5** - VPS setup and deployment
5. **You do Phase 6** - Final testing and launch

Ready to proceed? Let me know when you've completed each step group!
