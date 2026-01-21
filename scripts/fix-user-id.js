import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { Client } = pg
const client = new Client({
  connectionString: process.env.DATABASE_URL
})

const cloudUserId = 'f89b7a78-07c9-48b2-a365-d7d6e6c14b33'
const localUserId = '88a624e6-dbf9-47ec-a9ca-1a4f1278a592'
const email = 'vaibhavmalhotra100@gmail.com'

async function fixUserId() {
  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Delete the existing local user first
    console.log('🗑️  Removing local user with wrong ID...')
    await client.query('DELETE FROM profiles WHERE id = $1', [localUserId])
    await client.query('DELETE FROM auth.users WHERE id = $1', [localUserId])
    console.log('✓ Removed old user\n')

    // Create user with the cloud ID
    console.log(`📝 Creating user with cloud ID: ${cloudUserId}`)

    // Insert into auth.users with the correct ID
    await client.query(`
      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
      )
      VALUES (
        $1,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        $2,
        crypt('Test@123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
      )
      ON CONFLICT (id) DO UPDATE SET
        email = $2,
        encrypted_password = crypt('Test@123', gen_salt('bf')),
        email_confirmed_at = NOW(),
        updated_at = NOW()
    `, [cloudUserId, email])
    console.log('✓ User created in auth.users\n')

    // Create profile with the cloud ID
    console.log('📝 Creating profile...')
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
        email = $2,
        subscription_tier = 'pro',
        subscription_status = 'active',
        minutes_quota = 2000
    `, [cloudUserId, email])
    console.log('✓ Profile created\n')

    // Verify
    const result = await client.query(`
      SELECT u.id, u.email, u.email_confirmed_at IS NOT NULL as confirmed,
             p.subscription_tier, p.minutes_quota
      FROM auth.users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.email = $1
    `, [email])

    console.log('✅ User setup complete:')
    console.table(result.rows)

    console.log('\n🎉 You can now login at http://localhost:3000/login')
    console.log(`   Email: ${email}`)
    console.log('   Password: Test@123')
    console.log(`   User ID: ${cloudUserId} (matches cloud)`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

fixUserId()
