import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { db } from './server/db.js';
import { drizzle } from 'drizzle-orm/postgres-js';

// Standalone migration script that runs directly without interactive prompts
async function main() {
  console.log("Starting database migration...");
  
  // Make sure we have a DATABASE_URL
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  console.log("Connecting to database...");
  
  // Create postgres connection
  const sql = postgres(process.env.DATABASE_URL);
  const migrationDb = drizzle(sql);
  
  // Run migrations
  console.log("Running migrations...");
  
  try {
    await migrate(migrationDb, { migrationsFolder: './migrations' });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close connection
    await sql.end();
  }
}

main().catch(console.error);