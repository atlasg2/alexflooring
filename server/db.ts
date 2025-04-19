import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For production environments, construct DATABASE_URL from PostgreSQL credentials if needed
const isProduction = process.env.REPL_SLUG && process.env.REPL_OWNER;

// Construct DATABASE_URL from parts if not already set but individual credentials exist
if (!process.env.DATABASE_URL && process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
  const pgHost = process.env.PGHOST;
  const pgUser = process.env.PGUSER;
  const pgPassword = process.env.PGPASSWORD;
  const pgDatabase = process.env.PGDATABASE;
  const pgPort = process.env.PGPORT || '5432';
  
  process.env.DATABASE_URL = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require`;
  console.log("[DB] DATABASE_URL constructed from environment variables");
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Log connection status (without revealing sensitive info)
console.log(`[DB] Connecting to PostgreSQL database ${isProduction ? 'in production' : 'in development'}`);

// Create a connection pool with more resilient settings
const createConnectionPool = () => {
  console.log('[DB] Creating new connection pool');
  return new Pool({ 
    connectionString: process.env.DATABASE_URL,
    // Optimized connection pool settings for better performance and stability
    max: isProduction ? 15 : 5, // Increase max connections for production
    min: isProduction ? 2 : 1, // Keep minimum connections alive
    idleTimeoutMillis: 15000, // Reduce idle timeout to recycle connections faster
    connectionTimeoutMillis: 10000, // Increase timeout for initial connections
    allowExitOnIdle: false, // Don't allow exiting when idle
    keepAlive: true, // Enable TCP keepalive
    statement_timeout: 30000, // Timeout long-running queries after 30 seconds
  });
};

// Initialize pool
export let pool = createConnectionPool();

// Add error handling and automatic recovery
pool.on('error', (err) => {
  console.error('[DB] Pool error occurred:', err.message);
  // Don't throw the error - just log it
  
  // If error is connection related, try to reconnect
  if (err.message.includes('connection') || err.message.includes('timeout')) {
    console.log('[DB] Attempting to recover pool');
    try {
      // End the old pool gracefully
      pool.end().catch(endErr => {
        console.error('[DB] Error ending old pool:', endErr.message);
      });
      
      // Create a new pool
      pool = createConnectionPool();
      console.log('[DB] Successfully created new pool');
    } catch (recoveryErr) {
      console.error('[DB] Failed to recover pool:', recoveryErr);
    }
  }
});

// Keep the pool healthy with periodic pings
const healthCheckInterval = setInterval(() => {
  pool.query('SELECT 1')
    .then(() => {
      // console.log('[DB] Connection health check successful');
    })
    .catch(err => {
      console.error('[DB] Health check failed:', err.message);
      // Let the error handler above deal with recovery
    });
}, 30000); // Check every 30 seconds

// Clean up on app termination
process.on('SIGINT', async () => {
  clearInterval(healthCheckInterval);
  await pool.end();
  console.log('[DB] Pool connections closed');
  process.exit(0);
});

export const db = drizzle({ client: pool, schema });
