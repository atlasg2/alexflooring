// This script exports database schema to production
import { exec } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const drizzleConfig = require('../drizzle.config.js');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Pushing database schema to production...');

try {
  // Load the environment variables
  const pgHost = process.env.PGHOST;
  const pgUser = process.env.PGUSER;
  const pgPassword = process.env.PGPASSWORD;
  const pgDatabase = process.env.PGDATABASE;
  const pgPort = process.env.PGPORT || '5432';
  
  // Log diagnostic information
  console.log('Database information:');
  console.log(`  Host: ${pgHost ? 'Set' : 'Not set'}`);
  console.log(`  User: ${pgUser ? 'Set' : 'Not set'}`);
  console.log(`  Password: ${pgPassword ? 'Set' : 'Not set'}`);
  console.log(`  Database: ${pgDatabase ? 'Set' : 'Not set'}`);
  console.log(`  Port: ${pgPort ? 'Set' : 'Not set'}`);
  console.log(`  DATABASE_URL: ${DATABASE_URL ? 'Set (length: ' + DATABASE_URL.length + ')' : 'Not set'}`);
  
  // Run the drizzle-kit push command
  exec('npx drizzle-kit push:pg', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing drizzle-kit push: ${error.message}`);
      return;
    }
    
    console.log('Database schema pushed successfully!');
    console.log(stdout);
    
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
  });
} catch (error) {
  console.error(`Failed to push database schema: ${error.message}`);
}