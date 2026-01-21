# FifthDraft - Step 3 & 4 Execution Guide

## ✅ Completed Steps
- ✅ Step 1: Database schema created (`supabase/migrations/`)
- ✅ Step 2: Supabase client configuration (`src/lib/supabase/`)

---

## 🚀 Step 3: Initialize Supabase Locally

### Prerequisites Check
Before starting, verify:
1. **Docker Desktop is installed and running**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Ensure it's running (Docker icon in system tray)

2. **Supabase CLI is installed**
   ```bash
   # Check if installed
   npx supabase --version

   # If not installed, it will auto-install on first use
   ```

### Execution Steps

#### 3.1 Start Supabase Local Environment
```bash
# Navigate to your project directory
cd "d:\Project\Fifth Draft"

# Start Supabase (this takes 2-3 minutes first time)
npx supabase start
```

**What happens:**
- Downloads Docker images for PostgreSQL, Auth, Storage
- Starts local Supabase services
- Outputs connection credentials

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:** Copy the `anon key` and `service_role key` - you'll need them next!

#### 3.2 Apply Database Migrations
```bash
# Reset database and apply all migrations
npx supabase db reset
```

**What happens:**
- Drops existing database (if any)
- Runs all migrations in order:
  - `00001_initial_schema.sql` - Creates all tables
  - `00002_rls_policies.sql` - Sets up security policies
  - `00003_data_retention.sql` - Creates cleanup functions

**Expected Output:**
```
Applying migration 00001_initial_schema.sql...
Applying migration 00002_rls_policies.sql...
Applying migration 00003_data_retention.sql...
Finished supabase db reset.
```

#### 3.3 Verify Database Setup
```bash
# Check migration status
npx supabase migration list
```

**Expected Output:**
```
    LOCAL      REMOTE    TIME (UTC)
 0  00001_initial_schema        2026-01-08 12:00:00
 1  00002_rls_policies          2026-01-08 12:00:01
 2  00003_data_retention        2026-01-08 12:00:02
```

#### 3.4 Explore Your Database (Optional but Recommended)
```bash
# Open Supabase Studio in browser
start http://localhost:54323
```

**In Studio, verify:**
- ✅ Table Editor shows: profiles, recordings, transcriptions, notes, action_items, etc.
- ✅ Authentication > Policies shows RLS policies enabled
- ✅ Database > Functions shows cleanup functions

---

## 🔐 Step 4: Set Up Environment Variables

### 4.1 Create Local Environment File
```bash
# Copy example file
copy .env.example .env.local
```

### 4.2 Update .env.local
Open `.env.local` in your editor and replace with values from Step 3.1:

```env
# Replace these with actual values from 'npx supabase start' output
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Leave these blank for now (will add later)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 4.3 Verify Environment Setup
```bash
# Restart Next.js dev server to load new env vars
npm run dev
```

Open browser to: http://localhost:3000

---

## 🧪 Test Your Setup

### Test 1: Database Connection
```bash
# Open Node REPL
node

# Paste this test code:
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

supabase.from('profiles').select('*').then(console.log)
# Expected: { data: [], error: null, count: null, status: 200, statusText: 'OK' }
```

### Test 2: Authentication
1. Open http://localhost:3000/signup
2. Create test account: test@example.com / Test123!
3. Should redirect to `/dashboard` after signup
4. Check Supabase Studio > Authentication > Users to see new user

### Test 3: Middleware Protection
1. Logout (if logged in)
2. Try accessing http://localhost:3000/dashboard
3. Should redirect to `/login` ✅
4. Login and retry - should show dashboard ✅

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to Docker"
**Solution:**
```bash
# 1. Start Docker Desktop manually
# 2. Wait for Docker to fully start (whale icon stops animating)
# 3. Retry: npx supabase start
```

### Issue: "Port 54321 already in use"
**Solution:**
```bash
# Stop existing Supabase instance
npx supabase stop

# Restart
npx supabase start
```

### Issue: Migration fails with SQL error
**Solution:**
```bash
# View detailed error logs
npx supabase db logs

# Check migration file syntax
# Fix errors in supabase/migrations/*.sql files

# Retry
npx supabase db reset
```

### Issue: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solution:**
```bash
# 1. Ensure .env.local exists and has values
# 2. Restart dev server (Ctrl+C, then npm run dev)
# 3. Verify env vars loaded: console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Issue: RLS Policy blocks queries
**Solution:**
```bash
# Temporarily disable RLS for testing (in Supabase Studio SQL editor)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

# Or use service role key for admin queries
```

---

## ✅ Success Checklist

Before proceeding to next steps, verify:

- [ ] Docker Desktop is running
- [ ] `npx supabase status` shows all services running
- [ ] Supabase Studio (http://localhost:54323) opens
- [ ] All 3 migrations applied (`npx supabase migration list`)
- [ ] All tables visible in Studio > Table Editor
- [ ] `.env.local` file exists with correct keys
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] Signup page works (http://localhost:3000/signup)
- [ ] Login page works (http://localhost:3000/login)
- [ ] Dashboard route protected (redirects to login when not authenticated)

---

## 📋 Quick Reference Commands

```bash
# Start Supabase
npx supabase start

# Stop Supabase
npx supabase stop

# Reset database (reapply migrations)
npx supabase db reset

# Check status
npx supabase status

# View logs
npx supabase db logs

# Open Studio
start http://localhost:54323

# Start Next.js dev server
npm run dev
```

---

## 🎯 Next Steps (After Step 4 Complete)

Once Steps 3 & 4 are verified working:

1. **Create first user profile** (test registration flow)
2. **Build audio recorder component** (Phase 1 MVP)
3. **Set up Whisper API integration** (transcription)
4. **Implement "FifthDraft Pass"** (Claude cleanup)
5. **Add Stripe subscription system** (Phase 2)

---

## 📞 Need Help?

If you encounter issues not covered here:
1. Check full logs: `npx supabase db logs`
2. Review migration files for syntax errors
3. Verify Docker Desktop is running properly
4. Check Supabase CLI version: `npx supabase --version`
5. Restart everything: `npx supabase stop && npx supabase start`

---

**Last Updated:** 2026-01-08
**Version:** 1.0
