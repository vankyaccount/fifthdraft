/**
 * List all users in the local Supabase database
 * Usage: node scripts/list-users.js
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

async function listUsers() {
  console.log('\n🔍 Fetching all users from local Supabase...\n')

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, subscription_tier, subscription_status, minutes_quota, minutes_used')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching users:', error.message)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('📭 No users found in the database.')
    console.log('\nℹ️  To create a user:')
    console.log('  1. Start your dev server: npm run dev')
    console.log('  2. Go to: http://localhost:3000/signup')
    console.log('  3. Sign up with: Vaibhavmalhotra100@gmail.com')
    console.log('  4. Then run: node scripts/update-to-pro.js\n')
    return
  }

  console.log(`✅ Found ${profiles.length} user(s):\n`)

  profiles.forEach((profile, index) => {
    console.log(`${index + 1}. ${profile.email}`)
    console.log(`   👤 Name: ${profile.full_name || '(not set)'}`)
    console.log(`   📊 Tier: ${profile.subscription_tier}`)
    console.log(`   ⚡ Status: ${profile.subscription_status || 'not set'}`)
    console.log(`   ⏱️  Usage: ${profile.minutes_used}/${profile.minutes_quota} minutes`)
    console.log(`   🆔 ID: ${profile.id}`)
    console.log('')
  })

  const vaibhavUser = profiles.find(p => p.email.toLowerCase().includes('vaibhav'))
  if (vaibhavUser) {
    console.log('✅ Found Vaibhav\'s user!')
    if (vaibhavUser.subscription_tier !== 'pro') {
      console.log('⚠️  Not Pro yet. Run: node scripts/update-to-pro.js')
    } else {
      console.log('🎉 Already Pro!')
    }
  } else {
    console.log('ℹ️  Vaibhavmalhotra100@gmail.com not found.')
    console.log('   Sign up at: http://localhost:3000/signup')
  }
  console.log('')
}

listUsers().catch(console.error)
