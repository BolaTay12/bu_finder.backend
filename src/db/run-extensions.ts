import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function runExtensions() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }

  console.log('Connecting to database...');

  const pool = new Pool({ connectionString });

  const client = await pool.connect();

  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE EXTENSION IF NOT EXISTS unaccent;
      CREATE INDEX IF NOT EXISTS idx_items_title_trgm ON items USING gin (title gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_items_description_trgm ON items USING gin (description gin_trgm_ops);
    `);
    console.log('✅ pg_trgm extensions and indexes created successfully');
  } catch (err) {
    console.error('❌ Error creating extensions/indexes:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runExtensions();