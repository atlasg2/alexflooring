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

export const pool = new Pool({ 
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

export const db = drizzle({ client: pool, schema });
