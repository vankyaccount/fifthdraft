/**
 * Check if everything is set up correctly
 * Usage: node scripts/check-setup.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

console.log('\n🔍 Checking FifthDraft Setup...\n')

// Check 1: Environment Variables
console.log('1️⃣ Checking Environment Variables:')
const requiredEnvVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  'STRIPE_PRO_MONTHLY_PRICE_ID': process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  'STRIPE_PRO_YEARLY_PRICE_ID': process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
  'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
}

let envVarsOk = true
for (const [key, value] of Object.entries(requiredEnvVars)) {
  const isSet = value && !value.includes('YOUR_') && !value.includes('_HERE')
  const status = isSet ? '✅' : '❌'
  const message = isSet ? 'Set' : 'Missing or placeholder'
  console.log(`   ${status} ${key}: ${message}`)
  if (!isSet) envVarsOk = false
}

if (!envVarsOk) {
  console.log('\n⚠️  Some environment variables are missing or using placeholders')
  console.log('   See STRIPE_SETUP_GUIDE.md for instructions\n')
}

// Check 2: Supabase Connection
console.log('\n2️⃣ Checking Supabase Connection:')
try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)

  if (error) {
    console.log('   ❌ Supabase connection failed:', error.message)
  } else {
    console.log('   ✅ Supabase connected successfully')
  }
} catch (err) {
  console.log('   ❌ Supabase connection error:', err.message)
}

// Check 3: User Profile
console.log('\n3️⃣ Checking User Profile (Vaibhavmalhotra100@gmail.com):')
try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('email, full_name, subscription_tier, subscription_status, minutes_quota, minutes_used')
    .eq('email', 'Vaibhavmalhotra100@gmail.com')
    .single()

  if (error || !profile) {
    console.log('   ❌ User not found')
  } else {
    console.log('   ✅ User found')
    console.log('   📧 Email:', profile.email)
    console.log('   👤 Name:', profile.full_name || '(not set)')

    const tierOk = profile.subscription_tier === 'pro'
    console.log(`   ${tierOk ? '✅' : '❌'} Tier: ${profile.subscription_tier} ${tierOk ? '(Pro)' : '(Should be: pro)'}`)

    const statusOk = profile.subscription_status === 'active'
    console.log(`   ${statusOk ? '✅' : '⚠️'} Status: ${profile.subscription_status || 'not set'} ${statusOk ? '(Active)' : '(Should be: active)'}`)

    const quotaOk = profile.minutes_quota === 2000
    console.log(`   ${quotaOk ? '✅' : '❌'} Quota: ${profile.minutes_quota} minutes ${quotaOk ? '(Pro quota)' : '(Should be: 2000)'}`)

    console.log(`   📊 Usage: ${profile.minutes_used} / ${profile.minutes_quota} minutes`)
    console.log(`   ⏱️  Remaining: ${profile.minutes_quota - profile.minutes_used} minutes`)

    if (!tierOk || !quotaOk) {
      console.log('\n   ⚠️  Run: node scripts/update-to-pro.js to fix this')
    }
  }
} catch (err) {
  console.log('   ❌ Error checking profile:', err.message)
}

// Check 4: Stripe Configuration
console.log('\n4️⃣ Checking Stripe Configuration:')
const stripeConfigured =
  process.env.STRIPE_PRO_MONTHLY_PRICE_ID &&
  !process.env.STRIPE_PRO_MONTHLY_PRICE_ID.includes('YOUR_') &&
  process.env.STRIPE_PRO_YEARLY_PRICE_ID &&
  !process.env.STRIPE_PRO_YEARLY_PRICE_ID.includes('YOUR_') &&
  process.env.STRIPE_WEBHOOK_SECRET &&
  !process.env.STRIPE_WEBHOOK_SECRET.includes('YOUR_')

if (stripeConfigured) {
  console.log('   ✅ Stripe Price IDs configured')
  console.log('   ✅ Stripe Webhook Secret configured')
  console.log('   ℹ️  Make sure "stripe listen" is running for local testing')
} else {
  console.log('   ❌ Stripe not fully configured')
  console.log('   📖 See STRIPE_SETUP_GUIDE.md for instructions')
}

// Summary
console.log('\n' + '='.repeat(60))
console.log('📋 Summary:')
console.log('='.repeat(60))

const allChecks = envVarsOk && stripeConfigured
if (allChecks) {
  console.log('✅ All checks passed! Your setup looks good.')
  console.log('\n📝 Next steps:')
  console.log('   1. Make sure dev server is running: npm run dev')
  console.log('   2. Start Stripe webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe')
  console.log('   3. Open http://localhost:3000 and sign in')
  console.log('   4. Test payment flow at http://localhost:3000/pricing')
} else {
  console.log('⚠️  Some setup steps are incomplete.')
  console.log('\n📝 Action items:')
  if (!envVarsOk) {
    console.log('   • Configure missing environment variables in .env.local')
  }
  if (!stripeConfigured) {
    console.log('   • Get Stripe credentials from dashboard')
    console.log('   • See STRIPE_SETUP_GUIDE.md for detailed instructions')
  }
}

console.log('\n📚 Documentation:')
console.log('   • COMPLETE_SETUP_SUMMARY.md - Full setup guide')
console.log('   • STRIPE_SETUP_GUIDE.md - Stripe configuration')
console.log('   • QUICK_FIX_STEPS.md - Quick troubleshooting')
console.log('')
