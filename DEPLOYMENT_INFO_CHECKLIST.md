# Deployment Information Checklist

## What You Need to Provide to Deploy

Please provide the following information in order:

---

## 1. VPS & Domain Information

**What to provide:**
```
VPS IP Address: _________________________ (e.g., 123.45.67.89)
Domain Name: _________________________ (e.g., fifthdraft.com)
Domain Registrar: _________________________ (e.g., GoDaddy, Namecheap, etc.)
```

**Questions:**
- [ ] Have you added DNS A records pointing to your VPS IP in your domain registrar?
  - A record for `@` (root) → VPS IP
  - A record for `www` → VPS IP

---

## 2. Stripe Information (You Already Have This)

**What you already have in `.env.local`:**
```
STRIPE_SECRET_KEY=sk_live_[YOUR_STRIPE_SECRET_KEY]

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_STRIPE_PUBLISHABLE_KEY]

STRIPE_PRO_MONTHLY_PRICE_ID=price_[YOUR_MONTHLY_PRICE_ID]

STRIPE_PRO_YEARLY_PRICE_ID=price_[YOUR_YEARLY_PRICE_ID]

STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
```

✅ **You already have these - no action needed**

---

## 3. GitHub Information

**What to provide:**
```
GitHub Repository URL: _________________________ (e.g., https://github.com/yourname/fifthdraft)
GitHub Branch to Deploy: _________________________ (main or master)
```

**Questions:**
- [ ] Is your code pushed to GitHub?
- [ ] Which branch contains the production code? (usually `main` or `master`)

---

## 4. API Keys (Already in .env.local)

**You already have in `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:15421
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-[YOUR_ANTHROPIC_KEY]
OPENAI_API_KEY=sk-proj-[YOUR_OPENAI_KEY]
TAVILY_API_KEY=tvly-[YOUR_TAVILY_KEY]
```

✅ **You already have these - no action needed**

---

## 5. New Information Needed for Production

**What to provide:**

### A. Email Configuration
```
Email Service: Resend? (Yes/No) ___________
RESEND_API_KEY: _________________________ (if using Resend)
EMAIL_FROM: _________________________ (e.g., noreply@fifthdraft.com)
```

**Questions:**
- [ ] Do you want to enable email for password resets and confirmations?
- [ ] Have you set up Resend account and have an API key?

### B. Production App URL
```
NEXT_PUBLIC_APP_URL: _________________________ (e.g., https://fifthdraft.com)
```

---

## 6. Rate Limiting (Optional but Recommended)

**What to provide:**
```
Do you want Rate Limiting? (Yes/No) ___________

If YES, provide:
UPSTASH_REDIS_REST_URL: _________________________ (https://...upstash.io)
UPSTASH_REDIS_REST_TOKEN: _________________________
```

**Questions:**
- [ ] Do you want to set up rate limiting to protect your API?
- [ ] Have you created Upstash Redis database?

---

## 7. Coolify Access

**After deployment starts:**
```
Coolify Admin Username: _________________________ (your email or username)
Coolify Admin Password: _________________________ (strong password you'll create)
```

---

## Quick Summary - Provide These 3 Things:

1. **VPS IP Address** (format: XXX.XXX.XXX.XXX)
2. **Domain Name** (e.g., fifthdraft.com)
3. **GitHub URL** and **Branch Name**

---

## Verification Checklist

Before we proceed, confirm:

- [ ] VPS is running with Ubuntu 22.04
- [ ] Domain is purchased and DNS A records point to VPS IP
- [ ] Code is pushed to GitHub
- [ ] You have GitHub account access
- [ ] All API keys are valid (Stripe, OpenAI, Anthropic, Tavily, Supabase)

---

## Next Steps

1. **Provide the information above** (VPS IP, Domain, GitHub URL)
2. **I'll set up Coolify** on your VPS
3. **You'll connect GitHub** to Coolify
4. **I'll configure environment variables** in Coolify
5. **Deploy the application** to production

---

**Ready? Please provide:**
1. Your VPS IP address
2. Your domain name
3. Your GitHub repository URL
4. Which branch to deploy (main/master)
