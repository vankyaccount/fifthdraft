import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:15421'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  { email: 'free@test.com', password: 'Test123!', tier: 'free' },
  { email: 'pro@test.com', password: 'Test123!', tier: 'pro' },
  { email: 'team@test.com', password: 'Test123!', tier: 'team' },
  { email: 'enterprise@test.com', password: 'Test123!', tier: 'enterprise' }
]

async function createTestUsers() {
  console.log('🔍 Checking and creating test users...\n')

  for (const user of testUsers) {
    try {
      // Try to create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          tier: user.tier
        }
      })

      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`✓ ${user.email} already exists`)
        } else {
          console.error(`✗ Error creating ${user.email}:`, error.message)
        }
      } else {
        console.log(`✓ Created ${user.email} (ID: ${data.user.id})`)
      }
    } catch (err) {
      console.error(`✗ Exception for ${user.email}:`, err.message)
    }
  }

  console.log('\n✅ User check/creation complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Run the SQL script: scripts/create-test-users.sql')
  console.log('2. Try logging in with any of these credentials:')
  console.log('   - free@test.com / Test123!')
  console.log('   - pro@test.com / Test123!')
  console.log('   - team@test.com / Test123!')
  console.log('   - enterprise@test.com / Test123!')
}

createTestUsers()
