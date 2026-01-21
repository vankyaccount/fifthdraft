# FifthDraft Setup Guide

## Step 3: Initialize Supabase Locally and Run Migrations

### Prerequisites
1. Docker Desktop must be running (Supabase uses Docker containers)
2. Supabase CLI must be installed

### Commands to Execute

#### 1. Start Supabase Local Development
```bash
npx supabase start
```

This will:
- Start local PostgreSQL, Auth, Storage, and Realtime services
- Create a local Supabase instance at http://localhost:54321
- Output connection details (save these!)

Expected output:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbG...
service_role key: eyJhbG...
```

#### 2. Run Database Migrations
```bash
npx supabase db reset
```

This will:
- Apply all migrations in `supabase/migrations/` folder
- Create all tables (profiles, recordings, transcriptions, notes, etc.)
- Set up RLS policies
- Create data retention functions

#### 3. Verify Setup
```bash
# Check migration status
npx supabase migration list

# Open Supabase Studio (visual database editor)
# Navigate to: http://localhost:54323
```

### Troubleshooting

**Error: "Cannot connect to Docker"**
- Solution: Make sure Docker Desktop is running

**Error: "Port already in use"**
- Solution: Stop existing Supabase instance: `npx supabase stop`

**Error: "Migration failed"**
- Solution: Check migration SQL files for syntax errors
- View logs: `npx supabase db logs`

---

## Step 4: Set Up Environment Variables

After starting Supabase, copy the connection details to your `.env.local` file:

```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

Then edit `.env.local` with the values from `npx supabase start` output:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (copy from terminal output)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (copy from terminal output)
```

---

## Next Steps

Once Supabase is running:
1. ✅ Visit http://localhost:54323 to see your database
2. ✅ Check that all tables exist (profiles, recordings, notes, etc.)
3. ✅ Verify RLS policies are enabled
4. ✅ Continue to authentication setup
