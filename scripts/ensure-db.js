// This script ensures the database is initialized in production
// It will run automatically when the application starts in production
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function logInfo(message) {
  console.log(`[DB SETUP] ${message}`);
}

function ensureDatabase() {
  logInfo('Starting database initialization check...');
  
  // Check if we're in production (Replit deployments)
  const isProduction = process.env.REPL_SLUG && process.env.REPL_OWNER;
  
  if (isProduction) {
    logInfo('Running in production environment');
    
    // Check if DATABASE_URL exists as an environment variable
    if (!process.env.DATABASE_URL) {
      logInfo('No DATABASE_URL found in environment variables');
      
      // If not in environment variables, check if we have database credentials in Secrets
      if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
        logInfo('Found PostgreSQL credentials in environment, constructing DATABASE_URL');
        
        // Construct DATABASE_URL from parts
        const pgHost = process.env.PGHOST;
        const pgUser = process.env.PGUSER;
        const pgPassword = process.env.PGPASSWORD;
        const pgDatabase = process.env.PGDATABASE;
        const pgPort = process.env.PGPORT || '5432';
        
        // Create DATABASE_URL from separate credentials
        process.env.DATABASE_URL = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require`;
        logInfo('DATABASE_URL constructed from environment variables');
      } else {
        logInfo('No database credentials found, application may not work correctly');
        return;
      }
    }
    
    try {
      // Run database migrations
      logInfo('Running database migrations...');
      execSync('npm run db:push', { stdio: 'inherit' });
      logInfo('Database migrations completed successfully');
    } catch (error) {
      logInfo(`Error running database migrations: ${error.message}`);
    }
  } else {
    logInfo('Running in development environment, skipping automatic migrations');
  }
}

// Run the function
ensureDatabase();