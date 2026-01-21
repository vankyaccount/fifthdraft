# Stripe Setup Guide

## Issue 1: Frontend Not Showing Pro Status

Even though you updated the database, the frontend shows old data due to caching. Here's how to fix it:

### Step 1: Verify Database Update

Run this SQL in your Supabase SQL Editor to confirm the update:

```sql
SELECT id, email, full_name, subscription_tier, subscription_status, minutes_quota, minutes_used
FROM profiles
WHERE email = 'Vaibhavmalhotra100@gmail.com';
```

**Expected result:**
- `full_name`: "Vaibhav Malhotra"
- `subscription_tier`: "pro"
- `minutes_quota`: 2000

### Step 2: Clear Cache and Restart

1. **Stop your dev server** (Ctrl+C in terminal)
2. **Clear Next.js cache:**
   ```bash
   rmdir /s /q .next
   npm run dev
   ```
3. **Hard refresh browser:**
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`
4. **Clear browser cookies** for localhost:3000 if needed
5. **Sign out and sign back in**

### Step 3: If Still Not Working

The issue might be that your Supabase local instance hasn't picked up the changes. Try:

```bash
# Restart Supabase
npx supabase stop
npx supabase start
```

---

## Issue 2: Missing Stripe Environment Variables

You need 3 more Stripe environment variables:

### 1. STRIPE_PRO_MONTHLY_PRICE_ID

**How to get it:**

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com/
2. Click **Products** in the left sidebar
3. **Create a new Product** (or edit existing):
   - **Name**: "FifthDraft Pro - Monthly"
   - **Pricing**:
     - Type: **Recurring**
     - Price: **$15.00 USD**
     - Billing period: **Monthly**
4. After creating, you'll see a **Price ID** like: `price_1SnB3tKtGQ7rITBi...`
5. Copy this ID

### 2. STRIPE_PRO_YEARLY_PRICE_ID

**How to get it:**

1. Go to **Stripe Dashboard** > **Products**
2. **Create another product** (or add another price to the same product):
   - **Name**: "FifthDraft Pro - Yearly"
   - **Pricing**:
     - Type: **Recurring**
     - Price: **$149.00 USD**
     - Billing period: **Yearly**
3. Copy the **Price ID** (like: `price_1SnB3tKtGQ7rITBi...`)

### 3. STRIPE_WEBHOOK_SECRET

**How to get it:**

#### Option A: For Local Development (Testing)

1. **Install Stripe CLI** (if not already):
   ```bash
   # Download from: https://stripe.com/docs/stripe-cli
   # Or use Scoop (Windows):
   scoop install stripe
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. The CLI will output a **webhook signing secret** like:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxx
   ```

5. Copy this secret (starts with `whsec_`)

#### Option B: For Production (Live)

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com/
2. Click **Developers** > **Webhooks**
3. Click **Add endpoint**
4. Configure:
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
5. Click **Add endpoint**
6. Click on the webhook you just created
7. Click **Reveal** under "Signing secret"
8. Copy the secret (starts with `whsec_`)

---

## Update .env.local

Add these three variables to your `.env.local` file:

```env
# Add these lines at the end:
STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID_HERE
STRIPE_PRO_YEARLY_PRICE_ID=price_YOUR_YEARLY_PRICE_ID_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing the Payment Flow

### 1. Test in Development Mode

Use Stripe test mode with test cards:

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

**Details for any test card:**
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### 2. Test Checkout Flow

1. Click **"Upgrade to Pro"** button on dashboard
2. Or go to `/pricing` page
3. Click **"Get Pro Yearly"** or **"Get Pro Monthly"**
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete payment
7. You'll be redirected back to dashboard
8. Your subscription should now show as "Pro"

### 3. Verify Webhook Events

When using `stripe listen`, you'll see webhook events in the terminal:

```
✔ Received event: checkout.session.completed
✔ Received event: customer.subscription.created
✔ Received event: invoice.payment_succeeded
```

Check your app logs to confirm the webhook handler updated the database.

---

## Troubleshooting

### Problem: "No such price" error

**Solution:** Make sure the Price IDs in `.env.local` match exactly with your Stripe dashboard.

### Problem: Webhooks not working locally

**Solution:**
1. Make sure `stripe listen` is running
2. Use the webhook secret from the CLI output
3. Check the terminal running `stripe listen` for errors

### Problem: Payment succeeds but user still shows as "free"

**Solution:**
1. Check webhook logs in Stripe dashboard
2. Verify webhook secret is correct
3. Check your app logs for errors in `/api/webhooks/stripe`
4. Manually verify database was updated with the SQL query above

### Problem: "Webhook signature verification failed"

**Solution:**
- For local: Use the secret from `stripe listen` output
- For production: Use the secret from Stripe dashboard webhook settings
- Make sure you're not mixing test/live mode secrets

---

## Quick Start Commands

```bash
# 1. Clear cache and restart
rmdir /s /q .next
npm run dev

# 2. In another terminal, start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 3. Test with Stripe CLI
stripe trigger checkout.session.completed
```

---

## Next Steps

1. ✅ Get the 3 Price IDs and Webhook Secret from Stripe
2. ✅ Add them to `.env.local`
3. ✅ Restart your dev server
4. ✅ Run `stripe listen` in a separate terminal
5. ✅ Test the checkout flow
6. ✅ Verify your profile updates to Pro tier

## Production Deployment

When deploying to production:

1. Switch Stripe keys to **Live mode** (not test mode)
2. Create webhook endpoint in Stripe dashboard (not CLI)
3. Update all environment variables in your hosting platform
4. Test thoroughly with real payment methods (then refund yourself)
