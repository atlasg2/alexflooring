const { execSync } = require('child_process');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { migrate } = require('drizzle-orm/neon-serverless/migrator');
const path = require('path');

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