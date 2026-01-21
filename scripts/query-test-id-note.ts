import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '../src/lib/supabase/server.js';

(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();

  if (error) {
    console.error('Error fetching note:', error);
  } else {
    console.log('Note data:', data);
  }
})();