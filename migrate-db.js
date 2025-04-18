import { execSync } from 'child_process';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    console.log('Running schema migrations...');
    
    // Create tables that don't exist yet
    await execSync('npx drizzle-kit generate --config=drizzle.config.ts', { stdio: 'inherit' });
    
    // Apply the migrations
    await migrate(db, { migrationsFolder: path.join(__dirname, 'drizzle') });
    
    console.log('Migrations completed successfully');
    
    // Close the connection pool
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();