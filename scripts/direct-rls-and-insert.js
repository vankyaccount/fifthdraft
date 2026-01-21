import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Client } from 'pg';

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Disable RLS
    await client.query('ALTER TABLE notes DISABLE ROW LEVEL SECURITY;');

    // Insert test note
    await client.query(
      `INSERT INTO notes (id, title, content, created_at) VALUES ($1, $2, $3, NOW());`,
      ['00000000-0000-0000-0000-000000000000', 'Test Note', 'This is a test note.']
    );

    console.log('Test note inserted successfully.');

    // Re-enable RLS
    await client.query('ALTER TABLE notes ENABLE ROW LEVEL SECURITY;');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
})();