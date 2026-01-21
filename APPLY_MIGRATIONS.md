# Apply Database Migrations to Supabase Cloud

Since you're using Supabase Cloud (not local Docker), you need to apply migrations through the Supabase dashboard.

## Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp**
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"**

## Step 2: Run Migration 1 - Initial Schema

Copy the contents of `supabase/migrations/00001_initial_schema.sql` and paste into the SQL Editor.

Or run this command to view the file:
```bash
cat "supabase/migrations/00001_initial_schema.sql"
```

Click **"Run"** to execute the migration.

Expected result: Creates tables for profiles, recordings, transcriptions, notes, action_items, etc.

## Step 3: Run Migration 2 - RLS Policies

Copy the contents of `supabase/migrations/00002_rls_policies.sql` and paste into a new query.

Click **"Run"** to execute.

Expected result: Enables Row Level Security and creates security policies.

## Step 4: Run Migration 3 - Data Retention

Copy the contents of `supabase/migrations/00003_data_retention.sql` and paste into a new query.

Click **"Run"** to execute.

Expected result: Creates functions for data retention and cleanup.

## Step 5: Verify Setup

1. Go to **"Table Editor"** in Supabase dashboard
2. Verify these tables exist:
   - ✅ profiles
   - ✅ recordings
   - ✅ transcriptions
   - ✅ notes
   - ✅ action_items
   - ✅ subscriptions
   - ✅ usage_tracking

3. Go to **"Authentication" > "Policies"**
4. Verify RLS policies are enabled

## Alternative: Use Supabase CLI (if Docker issues resolved)

If you get Docker working later, you can push migrations automatically:

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref wxcnnysvzfsrljyehygp

# Push migrations
npx supabase db push

# Pull existing schema (if needed)
npx supabase db pull
```

## After Migrations Complete

Once all migrations are applied:

```bash
# Start your Next.js app
npm run dev

# Open in browser
start http://localhost:3000
```

Test the setup:
1. Go to http://localhost:3000/signup
2. Create a test account
3. Verify it redirects to dashboard
4. Check Supabase dashboard > Authentication > Users to see your new user

---

**Quick Access Links:**
- Supabase Dashboard: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp
- SQL Editor: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/sql
- Table Editor: https://supabase.com/dashboard/project/wxcnnysvzfsrljyehygp/editor
