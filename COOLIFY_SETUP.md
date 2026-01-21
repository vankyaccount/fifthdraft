# Coolify Setup Checklist

## Step 1: Create PostgreSQL Database in Coolify

1. Go to Coolify dashboard
2. Click "Databases" → "New Database"
3. Select "PostgreSQL"
4. Configure:
   - Name: `fifthdraft-db`
   - Database: `fifthdraft`
   - Username: `fifthdraft`
   - Password: (generate strong password)
5. Deploy the database
6. **Note down the connection details** (you'll need these for environment variables)

## Step 2: Run Database Migration

### Option A: Using Coolify Console
1. Go to your PostgreSQL database in Coolify
2. Open the console/terminal
3. Copy contents of `migrations/001_complete_schema.sql`
4. Paste and execute in the console

### Option B: Using psql Locally
```bash
# Get the database host from Coolify (e.g., fifthdraft-db.coolify.internal)
psql -h <database-host> -U fifthdraft -d fifthdraft -f migrations/001_complete_schema.sql
```

### Verify Migration
```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see: auth_users, profiles, recordings, notes, action_items, folders, transcriptions, usage_logs, pro_plus_waitlist

## Step 3: Generate JWT Secrets

Run these commands to generate random secrets:

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save both values - you'll need them for environment variables.

## Step 4: Create Application in Coolify

1. Go to Coolify dashboard
2. Click "Applications" → "New Application"
3. Select "GitHub Repository"
4. Connect to repository: `vankyaccount/fifthdraft`
5. Configure:
   - Branch: `main`
   - Build Pack: Nixpacks (auto-detects Next.js)
   - Port: `3000`

## Step 5: Configure Environment Variables

Add these in Coolify application settings → Environment Variables:

### Required (Database):
```env
DATABASE_PROVIDER=postgres
POSTGRES_HOST=fifthdraft-db
POSTGRES_PORT=5432
POSTGRES_DATABASE=fifthdraft
POSTGRES_USER=fifthdraft
POSTGRES_PASSWORD=<your-database-password>
```

### Required (Auth):
```env
JWT_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
```

### Required (Storage):
```env
STORAGE_PATH=/app/data/recordings
```

### Required (App):
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Required (API Keys - from existing setup):
```env
OPENAI_API_KEY=<your-openai-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
STRIPE_SECRET_KEY=<your-stripe-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_PRO_MONTHLY_PRICE_ID=<price-id>
STRIPE_PRO_YEARLY_PRICE_ID=<price-id>
RESEND_API_KEY=<your-resend-key>
```

## Step 6: Configure Persistent Storage

1. In Coolify application settings → Storage
2. Add volume:
   - **Source:** `/app/data`
   - **Destination:** (Coolify will assign persistent volume)
   - This stores audio recordings persistently

## Step 7: Configure Domain (Optional)

1. In Coolify application settings → Domains
2. Add your domain: `fifthdraft.yourdomain.com`
3. Enable SSL/HTTPS (automatic with Let's Encrypt)
4. Update `NEXT_PUBLIC_APP_URL` to match

## Step 8: Deploy

1. Click "Deploy" in Coolify
2. Coolify will:
   - Pull from GitHub
   - Install dependencies
   - Build Next.js app
   - Start the application
3. Watch logs for any errors

## Step 9: Verify Deployment

### Check Health Endpoint:
```bash
curl https://your-domain.com/api/health
```

Should return: `{"status":"ok"}`

### Test Signup Flow:
1. Visit `https://your-domain.com/signup`
2. Create test account
3. Check if email verification is sent
4. Verify email

### Test Recording:
1. Login to dashboard
2. Create a recording
3. Check if file is saved to `/app/data/recordings/`

### Check Database:
```sql
-- Verify user was created
SELECT id, email, email_verified FROM auth_users;

-- Verify profile was created
SELECT id, email, subscription_tier FROM profiles;
```

## Troubleshooting

### Database Connection Failed
- Verify `POSTGRES_HOST` matches your database service name in Coolify
- Check database is running
- Verify credentials

### Storage Errors
- Ensure volume is mounted at `/app/data`
- Check application logs for permission errors

### Build Errors
- Check Node.js version (should be 18+)
- Verify all dependencies installed
- Check build logs in Coolify

### JWT Errors
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
- Secrets must be hex strings (64 characters)

## Auto-Deploy on Push

Coolify automatically deploys when you push to `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Coolify will detect the push and redeploy automatically.

## Monitoring

- **Logs:** Check in Coolify application → Logs
- **Database:** Monitor in Coolify database → Metrics
- **Storage:** Check volume usage in Coolify

## Next Steps

After successful deployment:

1. Update Stripe webhook URL to point to your domain:
   - `https://your-domain.com/api/webhooks/stripe`
2. Test Stripe checkout flow
3. Test password reset emails
4. Configure email templates (Resend)
5. Set up monitoring/alerts
