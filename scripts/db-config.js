// This script ensures that drizzle.config.ts works in both development and production environments
const fs = require('fs');
const path = require('path');

function logInfo(message) {
  console.log(`[DB CONFIG] ${message}`);
}

// Check if we're in production (Replit deployments)
const isProduction = process.env.REPL_SLUG && process.env.REPL_OWNER;

function setupDrizzleConfig() {
  try {
    const drizzleConfigPath = path.join(process.cwd(), 'drizzle.config.ts');
    logInfo(`Checking drizzle config at ${drizzleConfigPath}`);
    
    if (!fs.existsSync(drizzleConfigPath)) {
      logInfo('drizzle.config.ts not found');
      return;
    }
    
    const drizzleConfig = fs.readFileSync(drizzleConfigPath, 'utf8');
    
    // Only modify if we need to add the production DATABASE_URL construction code
    if (isProduction && !drizzleConfig.includes('process.env.PGHOST')) {
      logInfo('Updating drizzle.config.ts for production environment');
      
      const updatedConfig = drizzleConfig.replace(
        'if (!process.env.DATABASE_URL) {',
        `// Construct DATABASE_URL from parts if in production and not already set
if (!process.env.DATABASE_URL && process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
  const pgHost = process.env.PGHOST;
  const pgUser = process.env.PGUSER;
  const pgPassword = process.env.PGPASSWORD;
  const pgDatabase = process.env.PGDATABASE;
  const pgPort = process.env.PGPORT || '5432';
  
  process.env.DATABASE_URL = \`postgresql://\${pgUser}:\${pgPassword}@\${pgHost}:\${pgPort}/\${pgDatabase}?sslmode=require\`;
}

if (!process.env.DATABASE_URL) {`
      );
      
      fs.writeFileSync(drizzleConfigPath, updatedConfig, 'utf8');
      logInfo('drizzle.config.ts updated successfully');
    } else {
      logInfo('No changes needed for drizzle.config.ts');
    }
  } catch (error) {
    logInfo(`Error updating drizzle config: ${error.message}`);
  }
}

// Run the function
setupDrizzleConfig();