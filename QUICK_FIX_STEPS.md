# Quick Fix Steps - Pro User Not Showing

## ✅ COMPLETED
1. ✅ SQL script created to update your profile
2. ✅ Fixed frontend data consistency issue
3. ✅ Cache cleared
4. ✅ Added Stripe environment variables to .env.local

## 🔄 DO THESE NOW

### Step 1: Update Database (If not done yet)
1. Go to **Supabase SQL Editor**: http://localhost:15421 (or your Supabase dashboard)
2. Run this SQL:
   ```sql
   UPDATE profiles
   SET
       full_name = 'Vaibhav Malhotra',
       subscription_tier = 'pro',
       minutes_quota = 2000,
       subscription_status = 'active',
       updated_at = NOW()
   WHERE email = 'Vaibhavmalhotra100@gmail.com';
   ```

### Step 2: Restart Dev Server
```bash
# Stop current dev server (Ctrl+C)
# Then run:
npm run dev
```

### Step 3: Clear Browser Cache & Sign In Again
1. Open browser to `localhost:3000`
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh
3. **Sign out** from your app
4. **Sign in** again with Vaibhavmalhotra100@gmail.com

**Expected Result:**
- Header shows: "Welcome back, Vaibhav Malhotra!"
- Subscription shows: "pro"
- Minutes quota: "3 / 2000 minutes used this month"
- No "Upgrade to Pro" button (or it's replaced with subscription management)

---

## 📋 GET STRIPE CREDENTIALS

### 1. Get Price IDs (2 minutes)

**Go to:** https://dashboard.stripe.com/products

**Create Monthly Price:**
1. Click "Add product"
2. Name: "FifthDraft Pro Monthly"
3. Price: $15.00 USD
4. Billing: Recurring → Monthly
5. Click "Add product"
6. **Copy the Price ID** (looks like: `price_1SnB3t...`)

**Create Yearly Price:**
1. Same steps but:
   - Name: "FifthDraft Pro Yearly"
   - Price: $149.00 USD
   - Billing: Recurring → Yearly
2. **Copy the Price ID**

### 2. Get Webhook Secret (1 minute)

**For Local Testing:**
```bash
# Install Stripe CLI (one-time)
# Download from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Start webhook forwarding (keep this running)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The output will show:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxx
```

**Copy that secret** (starts with `whsec_`)

### 3. Update .env.local

Replace these placeholders in `.env.local`:
```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx  # Your monthly price ID
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx   # Your yearly price ID
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx   # Your webhook secret
```

### 4. Restart Server Again
```bash
# Stop dev server (Ctrl+C)
npm run dev
```

---

## 🧪 TEST PAYMENT FLOW

1. Click "Upgrade to Pro" or go to `/pricing`
2. Click "Get Pro Yearly"
3. Use test card: **4242 4242 4242 4242**
   - Expiry: 12/34
   - CVC: 123
   - ZIP: 12345
4. Complete checkout
5. You should be redirected back to dashboard as Pro user

---

## 🐛 IF STILL NOT WORKING

### Check 1: Verify Database
```sql
SELECT email, full_name, subscription_tier, minutes_quota
FROM profiles
WHERE email = 'Vaibhavmalhotra100@gmail.com';
```

Should show:
- full_name: "Vaibhav Malhotra"
- subscription_tier: "pro"
- minutes_quota: 2000

### Check 2: Clear ALL Cache
```bash
# Stop server
# Delete cache
rm -rf .next
# Clear npm cache
npm cache clean --force
# Restart
npm run dev
```

### Check 3: Browser
- Clear all cookies for localhost:3000
- Use incognito/private window
- Try different browser

### Check 4: Restart Supabase (Local)
```bash
npx supabase stop
npx supabase start
```

---

## 📞 NEED HELP?

If it's still not working after all these steps, check:
1. Browser console for errors (F12 → Console tab)
2. Terminal/server logs for errors
3. Network tab (F12 → Network) - check API responses

The profile data should be visible in the network response when you load the dashboard.
