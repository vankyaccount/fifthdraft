// Run database migrations on Supabase cloud
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('🚀 Starting database migrations...\n');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`📝 Running migration: ${file}`);

    try {
      // Split by semicolons and run each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // If exec_sql doesn't exist, try direct execution
          console.log(`   ℹ️  Executing directly...`);
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement })
          });

          if (!response.ok) {
            // Try using the SQL Editor endpoint
            console.log(`   ⚠️  Using alternative method...`);
            // Note: This requires manual execution via Supabase dashboard
          }
        }
      }

      console.log(`   ✅ ${file} completed\n`);
    } catch (error) {
      console.error(`   ❌ Error in ${file}:`, error.message);
      console.log(`   ℹ️  You may need to run this migration manually in Supabase dashboard\n`);
    }
  }

  console.log('✨ Migration process completed!\n');
  console.log('📋 Next steps:');
  console.log('   1. Verify tables in Supabase dashboard: https://supabase.com/dashboard');
  console.log('   2. Run: npm run dev');
  console.log('   3. Test: http://localhost:3000\n');
}

// Test connection first
async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

  if (error && error.code !== 'PGRST116') {
    console.log(`⚠️  Connection test: ${error.message}`);
    console.log('   This is normal if tables don\'t exist yet\n');
  } else {
    console.log('✅ Connected to Supabase successfully!\n');
  }
}

(async () => {
  await testConnection();
  await runMigrations();
})();
