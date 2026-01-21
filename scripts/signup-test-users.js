import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testUsers = [
  { email: 'free@test.com', password: 'Test123!' },
  { email: 'pro@test.com', password: 'Test123!' },
  { email: 'team@test.com', password: 'Test123!' },
  { email: 'enterprise@test.com', password: 'Test123!' }
]

async function signupUsers() {
  console.log('📝 Signing up test users...\n')

  for (const user of testUsers) {
    console.log(`Signing up: ${user.email}`)

    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        emailRedirectTo: 'http://localhost:3000/dashboard'
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`  ⚠️  User already exists - trying to login...`)

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        })

        if (loginError) {
          console.log(`  ✗ Login failed: ${loginError.message}`)
        } else {
          console.log(`  ✓ Login successful!`)
        }
      } else {
        console.log(`  ✗ ${error.message}`)
      }
    } else {
      console.log(`  ✓ Signed up successfully! User ID: ${data.user?.id}`)
    }
  }

  console.log('\n✅ User signup complete!')
  console.log('\nℹ️  If auto-confirm is enabled, users can login immediately.')
  console.log('   Otherwise, check your email (InBucket) to confirm.')
}

signupUsers()
