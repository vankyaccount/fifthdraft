import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '../src/lib/supabase/server.js';

(async () => {
  const supabase = await createClient();

  // Disable RLS
  let { error: disableRlsError } = await supabase.rpc('pg_execute_sql', {
    sql: 'ALTER TABLE notes DISABLE ROW LEVEL SECURITY;',
  });
  if (disableRlsError) {
    console.error('Error disabling RLS:', disableRlsError);
    return;
  }

  // Insert test note
  const { error: insertError } = await supabase
    .from('notes')
    .insert([
      {
        id: '00000000-0000-0000-0000-000000000000',
        title: 'Test Note',
        content: 'This is a test note.',
        created_at: new Date().toISOString(),
      },
    ]);

  if (insertError) {
    console.error('Error inserting test note:', insertError);
  } else {
    console.log('Test note inserted successfully.');
  }

  // Re-enable RLS
  let { error: enableRlsError } = await supabase.rpc('pg_execute_sql', {
    sql: 'ALTER TABLE notes ENABLE ROW LEVEL SECURITY;',
  });
  if (enableRlsError) {
    console.error('Error re-enabling RLS:', enableRlsError);
  }
})();