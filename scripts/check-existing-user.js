import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

async function checkUser() {
  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Check auth.users table
    console.log('🔍 Checking auth.users for vaibhavmalhotra100@gmail.com...\n')
    const authResult = await client.query(`
      SELECT id, email, email_confirmed_at, created_at, last_sign_in_at,
             raw_app_meta_data, raw_user_meta_data
      FROM auth.users
      WHERE email = 'vaibhavmalhotra100@gmail.com'
    `)

    if (authResult.rows.length === 0) {
      console.log('❌ User NOT FOUND in auth.users table')
      console.log('\n   The user does not exist in Supabase auth.')
      console.log('   You may need to sign up again or the database was reset.')
    } else {
      console.log('✓ User found in auth.users:')
      console.log('  ID:', authResult.rows[0].id)
      console.log('  Email:', authResult.rows[0].email)
      console.log('  Email Confirmed:', authResult.rows[0].email_confirmed_at ? 'Yes' : 'No')
      console.log('  Created:', authResult.rows[0].created_at)
      console.log('  Last Sign In:', authResult.rows[0].last_sign_in_at)
    }

    // Check profiles table
    console.log('\n🔍 Checking profiles table...\n')
    const profileResult = await client.query(`
      SELECT id, email, full_name, subscription_tier, subscription_status,
             minutes_used, minutes_quota
      FROM profiles
      WHERE email = 'vaibhavmalhotra100@gmail.com'
    `)

    if (profileResult.rows.length === 0) {
      console.log('⚠️  No profile found for this user')
    } else {
      console.log('✓ Profile found:')
      console.table(profileResult.rows)
    }

    // List all users in auth.users
    console.log('\n📋 All users in auth.users:')
    const allUsers = await client.query(`
      SELECT email, email_confirmed_at IS NOT NULL as confirmed, created_at
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 10
    `)
    console.table(allUsers.rows)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

checkUser()
