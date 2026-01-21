/**
 * Direct fix for Pro quota - bypasses triggers
 * Usage: node scripts/fix-pro-quota-direct.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })

const dbUrl = process.env.DATABASE_URL

if (!dbUrl) {
  console.error('❌ Missing DATABASE_URL in .env.local')
  process.exit(1)
}

async function fixProQuota() {
  const client = new pg.Client(dbUrl)

  try {
    await client.connect()
    console.log('\n✅ Connected to database\n')

    // Step 1: Update the function
    console.log('1️⃣  Updating update_subscription_quota function...')
    await client.query(`
      CREATE OR REPLACE FUNCTION update_subscription_quota()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.minutes_quota = CASE NEW.subscription_tier
          WHEN 'free' THEN 30
          WHEN 'pro' THEN 2000
          WHEN 'team' THEN 150
          WHEN 'enterprise' THEN 999999
        END;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('   ✅ Function updated (Pro now gets 2000 minutes)\n')

    // Step 2: Update existing Pro users
    console.log('2️⃣  Updating all Pro users to 2000 minutes...')
    const updateResult = await client.query(`
      UPDATE profiles
      SET minutes_quota = 2000
      WHERE subscription_tier = 'pro'
      RETURNING email, full_name, subscription_tier, minutes_quota, minutes_used;
    `)

    if (updateResult.rows.length > 0) {
      console.log(`   ✅ Updated ${updateResult.rows.length} Pro user(s):\n`)
      updateResult.rows.forEach((user) => {
        console.log(`   📧 ${user.email}`)
        console.log(`   👤 ${user.full_name}`)
        console.log(`   📊 Tier: ${user.subscription_tier}`)
        console.log(`   ⏱️  Quota: ${user.minutes_used}/${user.minutes_quota} minutes`)
        console.log(`   ✨ Remaining: ${user.minutes_quota - user.minutes_used} minutes\n`)
      })
    } else {
      console.log('   ℹ️  No Pro users found to update\n')
    }

    console.log('🎉 All done! Pro quota fixed to 2000 minutes.')
    console.log('\n📝 Next steps:')
    console.log('  1. Restart your dev server (Ctrl+C then npm run dev)')
    console.log('  2. Hard refresh browser (Ctrl+Shift+R)')
    console.log('  3. Sign out and sign back in')
    console.log('  4. You should now see 2000 minutes quota!\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

fixProQuota().catch(console.error)
