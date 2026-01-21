// Setup storage bucket programmatically
// Run with: node setup-storage.js

const { createClient } = require('@supabase/supabase-js');
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

async function setupStorage() {
  console.log('🚀 Setting up storage bucket...\n');

  // Create bucket
  console.log('1. Creating "recordings" bucket...');
  const { data: bucket, error: bucketError } = await supabase
    .storage
    .createBucket('recordings', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/webm', 'audio/opus', 'audio/wav', 'audio/mp3']
    });

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('   ℹ️  Bucket already exists');
    } else {
      console.error('   ❌ Error creating bucket:', bucketError.message);
    }
  } else {
    console.log('   ✅ Bucket created successfully');
  }

  console.log('\n2. Storage bucket setup complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Go to Supabase Dashboard > Storage > recordings');
  console.log('   2. Click "Policies" tab');
  console.log('   3. Add the 3 policies manually (see POST_MIGRATION_STEPS.md)');
  console.log('\n   OR');
  console.log('   1. Go to Authentication > Policies');
  console.log('   2. Find storage.objects table');
  console.log('   3. Create policies via UI\n');
}

setupStorage().catch(console.error);
