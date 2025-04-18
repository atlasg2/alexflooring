import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { promises as fs } from 'fs';
import path from 'path';

// Configure Neon client
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Setting up database for Alex Flooring...');
  
  // Set up database URL
  const DATABASE_URL = "postgresql://neondb_owner:npg_px3evr9UcOoF@ep-fancy-feather-a6l960wk.us-west-2.aws.neon.tech/neondb?sslmode=require";
  
  try {
    // Connect to database
    const pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool);
    
    console.log('Connected to database');
    
    // For future migrations
    console.log('Setting DATABASE_URL for future sessions');
    await fs.writeFile('.env', `DATABASE_URL=${DATABASE_URL}\n`, 'utf8');
    
    console.log('Ready to run application!');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

main();