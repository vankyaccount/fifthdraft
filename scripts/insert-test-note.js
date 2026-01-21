import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '../src/lib/supabase/server.js';

(async () => {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notes')
    .insert([
      {
        id: '00000000-0000-0000-0000-000000000000',
        title: 'Test Note',
        content: 'This is a test note.',
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Error inserting test note:', error);
  } else {
    console.log('Test note inserted successfully.');
  }
})();