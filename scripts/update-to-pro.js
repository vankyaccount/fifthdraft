/**
 * Quick script to update a user to Pro tier
 * Usage: node scripts/update-to-pro.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateUserToPro() {
  const email = 'vaibhavmalhotra100@gmail.com'

  console.log(`\n🔍 Looking for user: ${email}`)

  // First, get the current profile (case-insensitive search)
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email)
    .single()

  if (fetchError || !profile) {
    console.error('❌ User not found:', fetchError?.message)
    return
  }

  console.log('\n📊 Current profile:')
  console.log('  - Name:', profile.full_name || '(not set)')
  console.log('  - Tier:', profile.subscription_tier)
  console.log('  - Quota:', profile.minutes_quota)
  console.log('  - Used:', profile.minutes_used)

  // Update to Pro
  console.log('\n🔄 Updating to Pro tier...')

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: 'Vaibhav Malhotra',
      subscription_tier: 'pro',
      subscription_status: 'active',
      minutes_quota: 2000,
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id)
    .select()
    .single()

  if (updateError) {
    console.error('❌ Update failed:', updateError.message)
    return
  }

  console.log('\n✅ Successfully updated to Pro!')
  console.log('\n📊 New profile:')
  console.log('  - Name:', updated.full_name)
  console.log('  - Tier:', updated.subscription_tier)
  console.log('  - Status:', updated.subscription_status)
  console.log('  - Quota:', updated.minutes_quota, 'minutes')
  console.log('  - Used:', updated.minutes_used, 'minutes')
  console.log('  - Remaining:', updated.minutes_quota - updated.minutes_used, 'minutes')

  console.log('\n🎉 All done! Now:')
  console.log('  1. Restart your dev server (npm run dev)')
  console.log('  2. Hard refresh browser (Ctrl+Shift+R)')
  console.log('  3. Sign out and sign back in')
  console.log('  4. You should see "Welcome back, Vaibhav Malhotra!" and Pro status\n')
}

updateUserToPro().catch(console.error)
