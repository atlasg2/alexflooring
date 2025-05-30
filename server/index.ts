import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { exec } from "child_process";
import path from "path";

// ========== TEST CHANGE FOR VISIBILITY ==========
console.log("*******************************************");
console.log("* SERVER STARTING - TEST VERSION 12345678 *");
console.log("* TIMESTAMP: " + new Date().toISOString() + " *");
console.log("*******************************************");

// Run database setup script for production environments
const isProduction = process.env.REPL_SLUG && process.env.REPL_OWNER;
if (isProduction) {
  log("Running in production environment");
  log("Environment variables available:", Object.keys(process.env).filter(key => !key.includes('SECRET')).join(', '));
  
  // Construct DATABASE_URL from parts if in production and not already set
  if (!process.env.DATABASE_URL && process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    const pgHost = process.env.PGHOST;
    const pgUser = process.env.PGUSER;
    const pgPassword = process.env.PGPASSWORD;
    const pgDatabase = process.env.PGDATABASE;
    const pgPort = process.env.PGPORT || '5432';
    
    process.env.DATABASE_URL = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require`;
    log("DATABASE_URL constructed from environment variables");
  }
  
  // Verify DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    log("DATABASE_URL is available");
  } else {
    log("WARNING: DATABASE_URL is not set - database connection will fail!");
  }
  
  // Verify SESSION_SECRET is set
  if (process.env.SESSION_SECRET) {
    log("SESSION_SECRET is available");
  } else {
    // Set a fallback value to make sure sessions work
    process.env.SESSION_SECRET = "jyrHf9HyQg3MvzsdBxB6rjwMrHEpuVm/A5zoDa0oKD8Gvee0Ltq6JogP3xicHPFch6fAuDHu9hvv/CAxEqBepg==";
    log("WARNING: SESSION_SECRET not set - using fallback value");
  }
  
  // Set NODE_ENV for proper cookie settings
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
    log("Set NODE_ENV to production");
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Add handler for uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION - keeping process alive:', error);
    // Don't exit the process, just log the error
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Keep the process alive
  });
  
  // Set reasonable memory limits
  const memoryLimit = 1024; // MB
  if (process.memoryUsage().rss > memoryLimit * 1024 * 1024) {
    console.warn(`Memory usage exceeds ${memoryLimit}MB - potential memory leak`);
  }
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
