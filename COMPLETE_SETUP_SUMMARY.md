# Complete Setup Summary

## ✅ What I've Done

### 1. Fixed Code Issues
- Created [DashboardContext.tsx](src/components/dashboard/DashboardContext.tsx) to share profile data consistently
- Updated [layout.tsx](src/app/dashboard/layout.tsx) to wrap with DashboardProvider
- Updated [page.tsx](src/app/dashboard/page.tsx) to use shared context instead of duplicate fetches
- Cleared Next.js cache (.next folder)

### 2. Created Helper Files
- **[scripts/update-user-profile.sql](scripts/update-user-profile.sql)** - SQL to update your profile
- **[scripts/verify-user-profile.sql](scripts/verify-user-profile.sql)** - SQL to verify the update
- **[scripts/update-to-pro.js](scripts/update-to-pro.js)** - Node script to update via code
- **[STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md)** - Complete Stripe setup instructions
- **[QUICK_FIX_STEPS.md](QUICK_FIX_STEPS.md)** - Quick reference for fixing the Pro status

### 3. Updated Environment
- Added placeholder variables to [.env.local](.env.local):
  - `STRIPE_PRO_MONTHLY_PRICE_ID`
  - `STRIPE_PRO_YEARLY_PRICE_ID`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_APP_URL`

---

## 🔄 What You Need to Do Now

### STEP 1: Update Database to Pro (Choose ONE method)

#### Method A: Using Node Script (Easiest)
```bash
node scripts/update-to-pro.js
```

This will:
- Connect to your Supabase
- Show current profile
- Update to Pro tier
- Show new profile

#### Method B: Using SQL
1. Go to Supabase SQL Editor: http://localhost:15421
2. Run the SQL from `scripts/update-user-profile.sql`

### STEP 2: Restart Your Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### STEP 3: Clear Browser & Sign In Again
1. Open `localhost:3000`
2. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. **Sign out**
4. **Sign in** again

**✅ Expected Result:**
- "Welcome back, Vaibhav Malhotra!" (not vaibhavmalhotra100)
- "3 / 2000 minutes used this month"
- Pro badge visible
- Idea Studio accessible (no Premium lock)

---

## 🎫 STEP 4: Get Stripe Credentials

### 4A. Get Price IDs

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/products
2. **Create Monthly Product**:
   - Click "Add product"
   - Name: "FifthDraft Pro Monthly"
   - Price: $15.00 USD, Recurring Monthly
   - Save and **copy the Price ID** (starts with `price_`)

3. **Create Yearly Product**:
   - Same process
   - Name: "FifthDraft Pro Yearly"
   - Price: $149.00 USD, Recurring Yearly
   - Save and **copy the Price ID**

### 4B. Get Webhook Secret

**For Local Development:**

```bash
# Install Stripe CLI (one-time setup)
# Download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Start webhook forwarding (keep this running in a separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The output will show:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy that secret!**

### 4C. Update .env.local

Replace the placeholders in `.env.local`:

```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_1SnB3t...  # Your actual monthly price ID
STRIPE_PRO_YEARLY_PRICE_ID=price_1SnB3t...   # Your actual yearly price ID
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx...      # Your actual webhook secret
```

### 4D. Restart Server One More Time

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🧪 STEP 5: Test Payment Flow

1. **Navigate to**: http://localhost:3000/pricing
2. Click **"Get Pro Yearly"**
3. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
4. Complete checkout
5. You should be redirected to dashboard with Pro status

**Important**: Make sure `stripe listen` is running in a separate terminal during testing!

---

## 📋 Quick Checklist

- [ ] Run `node scripts/update-to-pro.js` OR run SQL to update profile
- [ ] Restart dev server (`npm run dev`)
- [ ] Hard refresh browser and sign in again
- [ ] Verify "Vaibhav Malhotra" and Pro status shows
- [ ] Get Stripe Monthly Price ID from dashboard
- [ ] Get Stripe Yearly Price ID from dashboard
- [ ] Install Stripe CLI and run `stripe login`
- [ ] Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Copy webhook secret from CLI output
- [ ] Update all 3 variables in `.env.local`
- [ ] Restart dev server again
- [ ] Test payment flow at `/pricing`

---

## 🐛 Troubleshooting

### Problem: Still shows "vaibhavmalhotra100" instead of "Vaibhav Malhotra"

**Solution:**
1. Verify database was updated: `node scripts/update-to-pro.js`
2. Clear all browser data for localhost:3000
3. Try incognito/private window
4. Check browser console (F12) for errors

### Problem: Payment succeeds but still shows as Free

**Checklist:**
- [ ] Is `stripe listen` running?
- [ ] Is webhook secret in `.env.local` correct?
- [ ] Check Stripe dashboard > Developers > Webhooks for events
- [ ] Check terminal running `stripe listen` for webhook events
- [ ] Check your app server logs for webhook handler errors

### Problem: "No such price" error during checkout

**Solution:**
- Verify Price IDs in `.env.local` match Stripe dashboard exactly
- Make sure you're in the same mode (test vs live) in both places

---

## 🎉 Success Criteria

When everything is working, you should see:

1. **Dashboard Header**: "Welcome back, Vaibhav Malhotra!"
2. **Minute Usage**: "3 / 2000 minutes used this month"
3. **Sidebar Stats**: "Minutes Remaining: 1997"
4. **No "Upgrade to Pro" button** (or it says "Manage Subscription")
5. **Idea Studio is accessible** (no Premium badge blocking it)
6. **Payment flow works**: Can test checkout and see webhook events in `stripe listen` terminal

---

## 📞 Need More Help?

If you're still stuck after following all steps:

1. Check browser console (F12) for errors
2. Check terminal/server logs for errors
3. Run verification: `node scripts/update-to-pro.js` to see current status
4. Try the SQL verification: Use `scripts/verify-user-profile.sql`

The payment gateway is **fully implemented** - you just need to configure the Stripe credentials and test it!
