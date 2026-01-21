# Deployment Guide - VPS with Coolify

## Prerequisites
- Coolify instance running on VPS
- PostgreSQL database created in Coolify
- Domain configured (optional)

## Environment Variables

### Remove these (Supabase-related):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Add these (PostgreSQL + Auth):
```
# Database
DATABASE_PROVIDER=postgres
POSTGRES_HOST=<coolify-postgres-host>
POSTGRES_PORT=5432
POSTGRES_DATABASE=fifthdraft
POSTGRES_USER=fifthdraft
POSTGRES_PASSWORD=<secure-password>

# JWT Authentication
JWT_SECRET=<256-bit-secret>
JWT_REFRESH_SECRET=<256-bit-secret>

# Storage
STORAGE_PATH=/app/data/recordings

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Existing variables (keep these):
OPENAI_API_KEY=<your-openai-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
STRIPE_SECRET_KEY=<your-stripe-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_PRO_MONTHLY_PRICE_ID=<price-id>
STRIPE_PRO_YEARLY_PRICE_ID=<price-id>
RESEND_API_KEY=<your-resend-key>
```

## Coolify Setup Steps

### 1. Create PostgreSQL Database
1. In Coolify, create a new PostgreSQL database
2. Note the connection details (host, port, database, user, password)

### 2. Run Database Migration
Connect to your PostgreSQL database and run:
```bash
psql -h <host> -U <user> -d <database> -f migrations/001_complete_schema.sql
```

Or upload the SQL file through Coolify's database console.

### 3. Configure Application
1. Create new application in Coolify
2. Connect to GitHub repository: `<your-github-repo>`
3. Set build pack: Next.js
4. Add all environment variables listed above

### 4. Configure Volume for Storage
In Coolify application settings:
- Add volume mount: `/app/data` → persistent storage
- This stores user audio recordings

### 5. Deploy
1. Push code to GitHub (if not already)
2. Coolify will auto-deploy on push
3. Or manually trigger deployment

### 6. Verify Deployment
1. Check health endpoint: `https://your-domain.com/api/health`
2. Test signup flow
3. Test audio recording and transcription
4. Verify file storage in `/app/data/recordings`

## Database Connection Test
After deployment, verify database connection by checking application logs in Coolify.

## Troubleshooting

### Database Connection Issues
- Verify POSTGRES_HOST is the internal Coolify service name
- Check PostgreSQL is running
- Verify credentials match

### Storage Issues
- Ensure volume is mounted at `/app/data`
- Check directory permissions (should be writable by app)

### JWT Issues
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
- Secrets should be 256-bit random strings

## Generate Secrets
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for JWT_SECRET and JWT_REFRESH_SECRET.
