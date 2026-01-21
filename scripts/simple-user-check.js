import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey?.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('\n🔍 Testing login with test credentials...\n')

  const testEmails = ['free@test.com', 'pro@test.com', 'vaibhavmalhotra100@gmail.com']

  for (const email of testEmails) {
    console.log(`Testing: ${email}`)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'Test123!'
    })

    if (error) {
      console.log(`  ✗ ${error.message}`)
    } else {
      console.log(`  ✓ Login successful! User ID: ${data.user.id}`)
    }
  }
}

testLogin()
