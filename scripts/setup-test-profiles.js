import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

const userIds = {
  'free@test.com': '049321a9-df88-41a0-b50d-8d71ac47bb9d',
  'pro@test.com': '38c761a4-6c38-4191-a87c-2c03bef9d5bd',
  'team@test.com': '47563b69-75ce-4406-ac1e-e89d92451198',
  'enterprise@test.com': 'a608ba83-6a49-471e-aee0-a17f513f5f98'
}

async function setupProfiles() {
  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Free tier
    console.log('Setting up Free tier user...')
    await client.query(`
      INSERT INTO profiles (
        id, email, full_name, subscription_tier, minutes_used, minutes_quota,
        settings, created_at, updated_at
      )
      VALUES (
        $1, 'free@test.com', 'Free Tier Test User', 'free', 0, 30,
        '{"writing_style": {"tone": "professional", "formality": "balanced", "verbosity": "concise", "person": "first-person", "formatting": "bullet-points"}, "note_structure": {"template": "default", "sections": {"summary": true, "keyPoints": true, "fullTranscript": true, "actionItems": true, "decisions": true, "questions": false, "timestamps": false, "speakers": false, "tags": true, "relatedNotes": false}, "granularity": "standard", "headingStyle": "h1-h2-h3"}, "output_preferences": {"autoExport": false, "defaultExportFormat": "markdown", "includeMetadata": true, "languagePreference": "en", "feedbackFrequency": "occasional"}}',
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        subscription_tier = 'free',
        minutes_quota = 30,
        minutes_used = 0
    `, [userIds['free@test.com']])
    console.log('✓ Free tier profile created\n')

    // Pro tier
    console.log('Setting up Pro tier user...')
    await client.query(`
      INSERT INTO profiles (
        id, email, full_name, subscription_tier, subscription_status,
        minutes_used, minutes_quota, settings, created_at, updated_at
      )
      VALUES (
        $1, 'pro@test.com', 'Pro Tier Test User', 'pro', 'active',
        0, 100,
        '{"writing_style": {"tone": "professional", "formality": "formal", "verbosity": "detailed", "person": "third-person", "formatting": "paragraphs"}, "note_structure": {"template": "executive", "sections": {"summary": true, "keyPoints": true, "fullTranscript": true, "actionItems": true, "decisions": true, "questions": true, "timestamps": true, "speakers": false, "tags": true, "relatedNotes": true}, "granularity": "detailed", "headingStyle": "numbered"}, "output_preferences": {"autoExport": true, "defaultExportFormat": "pdf", "includeMetadata": true, "languagePreference": "en", "feedbackFrequency": "occasional"}}',
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        subscription_tier = 'pro',
        subscription_status = 'active',
        minutes_quota = 100,
        minutes_used = 0
    `, [userIds['pro@test.com']])
    console.log('✓ Pro tier profile created\n')

    // Team tier
    console.log('Setting up Team tier user...')
    await client.query(`
      INSERT INTO profiles (
        id, email, full_name, subscription_tier, subscription_status,
        minutes_used, minutes_quota, settings, created_at, updated_at
      )
      VALUES (
        $1, 'team@test.com', 'Team Tier Test User', 'team', 'active',
        0, 150,
        '{"writing_style": {"tone": "casual", "formality": "balanced", "verbosity": "balanced", "person": "first-person", "formatting": "mixed"}, "note_structure": {"template": "technical", "sections": {"summary": true, "keyPoints": true, "fullTranscript": true, "actionItems": true, "decisions": true, "questions": true, "timestamps": true, "speakers": true, "tags": true, "relatedNotes": true}, "granularity": "detailed", "headingStyle": "emoji"}, "output_preferences": {"autoExport": true, "defaultExportFormat": "docx", "includeMetadata": true, "languagePreference": "en", "feedbackFrequency": "always"}}',
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        subscription_tier = 'team',
        subscription_status = 'active',
        minutes_quota = 150,
        minutes_used = 0
    `, [userIds['team@test.com']])
    console.log('✓ Team tier profile created\n')

    // Enterprise tier
    console.log('Setting up Enterprise tier user...')
    await client.query(`
      INSERT INTO profiles (
        id, email, full_name, subscription_tier, subscription_status,
        minutes_used, minutes_quota, settings, created_at, updated_at
      )
      VALUES (
        $1, 'enterprise@test.com', 'Enterprise Tier Test User', 'enterprise', 'active',
        0, 999999,
        '{"writing_style": {"tone": "academic", "formality": "formal", "verbosity": "detailed", "person": "passive", "formatting": "paragraphs"}, "note_structure": {"template": "custom", "sections": {"summary": true, "keyPoints": true, "fullTranscript": true, "actionItems": true, "decisions": true, "questions": true, "timestamps": true, "speakers": true, "tags": true, "relatedNotes": true}, "granularity": "high-level", "headingStyle": "minimal"}, "output_preferences": {"autoExport": true, "defaultExportFormat": "docx", "includeMetadata": true, "languagePreference": "en", "feedbackFrequency": "never"}}',
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        subscription_tier = 'enterprise',
        subscription_status = 'active',
        minutes_quota = 999999,
        minutes_used = 0
    `, [userIds['enterprise@test.com']])
    console.log('✓ Enterprise tier profile created\n')

    // Verify
    console.log('Verifying profiles...')
    const result = await client.query(`
      SELECT email, full_name, subscription_tier,
             minutes_used || '/' || minutes_quota AS quota,
             subscription_status
      FROM profiles
      WHERE email IN ('free@test.com', 'pro@test.com', 'team@test.com', 'enterprise@test.com')
      ORDER BY CASE subscription_tier
        WHEN 'free' THEN 1
        WHEN 'pro' THEN 2
        WHEN 'team' THEN 3
        WHEN 'enterprise' THEN 4
      END
    `)

    console.log('\n✅ All profiles created successfully!\n')
    console.table(result.rows)

    console.log('\n🎉 You can now login with these credentials:')
    console.log('   - free@test.com / Test123!')
    console.log('   - pro@test.com / Test123!')
    console.log('   - team@test.com / Test123!')
    console.log('   - enterprise@test.com / Test123!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

setupProfiles()
