import { execSync } from 'child_process';
import { Pool } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Check if database URL is defined
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable not defined');
  process.exit(1);
}

// Connect to database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    console.log('Running migrations...');

    // Get existing tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = result.rows.map(row => row.table_name);
    console.log('Existing tables:', existingTables.join(', '));
    
    // Execute db:push with force flag to accept all changes
    execSync('npx drizzle-kit push:pg --accept-data-loss', { 
      stdio: 'inherit',
      env: { ...process.env }
    });

    console.log('Successfully applied migrations');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();