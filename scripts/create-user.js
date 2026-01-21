import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const { Client } = pg
const client = new Client({
  connectionString: process.env.DATABASE_URL
})

async function createUser() {
  const email = 'vaibhavmalhotra100@gmail.com'
  const password = 'Test@123'

  console.log(`📝 Creating user: ${email}\n`)

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:3000/dashboard'
    }
  })

  if (error) {
    console.error('❌ Signup error:', error.message)
    return
  }

  console.log('✓ User created in auth.users')
  console.log('  ID:', data.user.id)

  // Create profile
  await client.connect()

  await client.query(`
    INSERT INTO profiles (
      id, email, full_name, subscription_tier, subscription_status,
      minutes_used, minutes_quota, created_at, updated_at
    )
    VALUES (
      $1, $2, 'Vaibhav Malhotra', 'pro', 'active',
      0, 2000, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      subscription_tier = 'pro',
      subscription_status = 'active',
      minutes_quota = 2000
  `, [data.user.id, email])

  console.log('✓ Profile created with Pro tier\n')

  // Test login
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (loginError) {
    console.error('❌ Login test failed:', loginError.message)
  } else {
    console.log('✅ Login test successful!')
    console.log('\n🎉 You can now login at http://localhost:3000/login')
    console.log(`   Email: ${email}`)
    console.log('   Password: Test@123')
  }

  await client.end()
}

createUser()
