import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType, InsertUser, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Extend Express.User to include our User type properties
declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

// Helper for password hashing and verification
const scryptAsync = promisify(scrypt);

// Hash passwords for storage
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare supplied password with stored hash
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Initialize admin accounts if they don't exist
async function ensureAdminExists() {
  try {
    // Ensure the default admin account exists
    console.log("Checking if admin user exists...");
    const adminUser = await storage.getUserByUsername("admin");
    
    if (!adminUser) {
      console.log("Creating admin user");
      const hashedPassword = await hashPassword("admin123");
      const user = await storage.createUser({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Admin user created:", user.id);
      console.log("Admin password set to: admin123 (IMPORTANT: Change this in production!)");
    } else {
      console.log("Admin user already exists:", adminUser.id);
      // Show password format for debugging
      console.log("Password format check:", adminUser.password.substring(0, 10) + "..." + 
          (adminUser.password.includes(".") ? " (contains salt separator)" : " (missing salt separator)"));
    }
    
    // Create or check for developer admin account
    console.log("Checking if developer admin exists...");
    const developerUser = await storage.getUserByUsername("developer");
    
    if (!developerUser) {
      console.log("Creating developer admin user");
      const hashedPassword = await hashPassword("dev123");
      const user = await storage.createUser({
        username: "developer",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Developer admin user created:", user.id);
      console.log("Developer password set to: dev123");
    } else {
      console.log("Developer admin account already exists:", developerUser.id);
    }
    
    // Create or check for business owner admin account
    console.log("Checking if business owner admin exists...");
    const ownerUser = await storage.getUserByUsername("owner");
    
    if (!ownerUser) {
      console.log("Creating business owner admin user");
      const hashedPassword = await hashPassword("owner123");
      const user = await storage.createUser({
        username: "owner",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Business owner admin user created:", user.id);
      console.log("Business owner password set to: owner123");
    } else {
      console.log("Business owner admin account already exists:", ownerUser.id);
    }
  } catch (error) {
    console.error("Error ensuring admin accounts exist:", error);
  }
}

// Setup authentication middleware and routes
export function setupAuth(app: Express) {
  // Ensure we have an admin user
  ensureAdminExists();
  
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "jyrHf9HyQg3MvzsdBxB6rjwMrHEpuVm/A5zoDa0oKD8Gvee0Ltq6JogP3xicHPFch6fAuDHu9hvv/CAxEqBepg==",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax' // Works better with redirects
    }
  };

  // Set up session and passport middleware
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`No user found with username: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        console.log(`User found: ID=${user.id}, username=${user.username}, role=${user.role}`);
        console.log(`Stored password format: ${user.password.substring(0, 10)}...`);
        
        // Special case for admin during development (REMOVE IN PRODUCTION)
        const isDevelopment = process.env.NODE_ENV !== "production";
        if (isDevelopment && username === "admin" && password === "admin123") {
          console.log("DEV MODE: Using development admin credentials");
          return done(null, user);
        }
        
        // Normal password check
        const passwordValid = await comparePasswords(password, user.password);
        console.log(`Password validation result: ${passwordValid ? "success" : "failed"}`);
        
        if (!passwordValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }),
  );

  // Specify how to serialize and deserialize users
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    console.log("Login successful for user:", req.user.username);
    console.log("Session ID after login:", req.session.id);
    
    // Ensure session is saved before sending response
    req.session.save(err => {
      if (err) {
        console.error("Error saving session after login:", err);
      } else {
        console.log("Session saved successfully after login");
      }
      
      res.json({ user: req.user });
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({ user: req.user });
  });
  
  // Reset password for any admin account
  app.post("/api/debug/reset-admin-password", async (req, res) => {
    try {
      // Get target username from request or default to "admin"
      const { username = "admin", password } = req.body;
      const newPassword = password || (username === "developer" ? "dev123" : (username === "owner" ? "owner123" : "admin123"));
      
      console.log(`Attempting to reset password for ${username}...`);
      
      // First check database connection
      try {
        console.log("Checking database connection...");
        const testQuery = await db.select().from(users).limit(1);
        console.log("Database connection successful, found users:", testQuery.length);
      } catch (dbErr: any) {
        console.error("Database connection test failed:", dbErr);
        return res.status(500).json({ error: "Database connection failed", details: dbErr.message });
      }
      
      // Find target user
      const targetUser = await storage.getUserByUsername(username);
      
      if (!targetUser) {
        console.log(`No ${username} user found, creating one...`);
        // Create user if doesn't exist
        const hashedPassword = await hashPassword(newPassword);
        const newUser = await storage.createUser({
          username: username,
          password: hashedPassword,
          role: "admin"
        });
        
        console.log(`New ${username} admin created with ID:`, newUser.id);
        
        return res.json({
          action: "created",
          id: newUser.id,
          username: username,
          password: newPassword,
          message: `New ${username} admin user created successfully`
        });
      }
      
      // User exists, update password
      console.log(`Found existing ${username} with ID:`, targetUser.id);
      const hashedPassword = await hashPassword(newPassword);
      
      // Update admin password
      const updatedUser = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, targetUser.id))
        .returning();
        
      console.log(`${username} admin password updated successfully`);
      
      return res.json({
        action: "updated",
        id: targetUser.id,
        username: targetUser.username,
        password: newPassword,
        message: `${username} admin password reset successfully`
      });
    } catch (error: any) {
      console.error("Error resetting admin password:", error);
      res.status(500).json({ 
        error: "Error resetting admin password", 
        details: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      });
    }
  });
  
  // Debug routes for admin user management
  
  // Create test admin with better error handling
  app.post("/api/debug/create-test-admin", async (req, res) => {
    try {
      console.log("Attempting to create test admin account...");
      const username = "testadmin";
      const password = "test123";
      
      // Log database connection check
      try {
        console.log("Checking database connection...");
        const testQuery = await db.select().from(users).limit(1);
        console.log("Database connection successful, found users:", testQuery.length);
      } catch (dbErr) {
        console.error("Database connection test failed:", dbErr);
        return res.status(500).json({ error: "Database connection failed", details: dbErr.message });
      }
      
      // Check if test admin already exists
      console.log("Checking if testadmin already exists...");
      let testAdmin;
      try {
        testAdmin = await storage.getUserByUsername(username);
        console.log("User check result:", testAdmin ? "Found existing user" : "No existing user");
      } catch (checkErr) {
        console.error("Error checking for existing user:", checkErr);
        return res.status(500).json({ error: "Failed to check for existing user", details: checkErr.message });
      }
      
      if (testAdmin) {
        // Delete existing test admin
        console.log("Deleting existing testadmin...");
        try {
          await db.delete(users).where(eq(users.username, username));
          console.log(`Deleted existing ${username} user`);
        } catch (deleteErr) {
          console.error(`Error deleting ${username}:`, deleteErr);
          return res.status(500).json({ error: `Failed to delete existing ${username}`, details: deleteErr.message });
        }
      }
      
      // Create new test admin with simple password
      console.log("Creating new testadmin...");
      let hashedPassword;
      try {
        hashedPassword = await hashPassword(password);
        console.log("Created password hash:", hashedPassword);
      } catch (hashErr) {
        console.error("Error creating password hash:", hashErr);
        return res.status(500).json({ error: "Failed to hash password", details: hashErr.message });
      }
      
      let user;
      try {
        user = await storage.createUser({
          username: username,
          password: hashedPassword,
          role: "admin"
        });
        console.log("Created new test admin user:", user);
      } catch (createErr) {
        console.error("Error creating user in storage:", createErr);
        return res.status(500).json({ error: "Failed to create user", details: createErr.message });
      }
      
      res.json({ 
        message: "Test admin created successfully", 
        id: user.id,
        username: username,
        password: password, // Only sending this back for testing!
        passwordHash: hashedPassword
      });
    } catch (error) {
      console.error("Unexpected error creating test admin:", error);
      res.status(500).json({ 
        error: "Unexpected error creating test admin user",
        details: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      });
    }
  });
  
  // Debug route to create/recreate main admin
  app.post("/api/debug/create-admin", async (req, res) => {
    try {
      // Force recreate admin user by recreating it
      try {
        // Delete existing admin if any
        await db.delete(users).where(eq(users.username, "admin"));
        console.log("Deleted existing admin user");
      } catch (err) {
        console.error("Error deleting admin:", err);
      }
      
      // Create new admin with known password
      const hashedPassword = await hashPassword("admin123");
      console.log("Created password hash:", hashedPassword);
      
      const user = await storage.createUser({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });
      
      console.log("Created new admin user:", user);
      
      res.json({ 
        message: "Admin created/recreated successfully", 
        id: user.id,
        username: "admin",
        password: "admin123", // Only sending this back for testing!
        passwordHash: hashedPassword
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ error: "Error creating admin user" });
    }
  });
}

// API token for alternative authentication method
const DEVELOPER_API_TOKEN = process.env.DEVELOPER_API_TOKEN || "dev-secret-token-for-emergency";
const OWNER_API_TOKEN = process.env.OWNER_API_TOKEN || "owner-secret-token-for-emergency";

// Middleware to check if user is authenticated and is an admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  console.log("isAdmin middleware checking authentication...");
  
  // First check for API token in Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Check if it matches the developer token
    if (token === DEVELOPER_API_TOKEN) {
      console.log("Developer API token authentication successful");
      // Set fake user session for the developer
      req.user = {
        id: 999,
        username: "developer",
        role: "admin"
      } as UserType;
      return next();
    }
    
    // Check if it matches the owner token
    if (token === OWNER_API_TOKEN) {
      console.log("Owner API token authentication successful");
      // Set fake user session for the owner
      req.user = {
        id: 998,
        username: "owner",
        role: "admin"
      } as UserType;
      return next();
    }
    
    console.log("Invalid API token provided");
  }
  
  // If no valid token, fall back to session authentication
  console.log("No valid API token, checking session authentication");
  console.log("Session ID:", req.session.id);
  console.log("isAuthenticated:", req.isAuthenticated());
  
  if (!req.isAuthenticated()) {
    console.log("Admin auth failed: Not authenticated");
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  console.log("User in request:", req.user ? JSON.stringify({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role
  }) : "missing");
  
  const user = req.user as UserType;
  
  if (!user.role) {
    console.log("Admin auth failed: No role specified");
    return res.status(403).json({ error: "Role not specified" });
  }
  
  if (user.role !== "admin") {
    console.log(`Admin auth failed: Role is ${user.role}, not admin`);
    return res.status(403).json({ error: "Not authorized as admin" });
  }
  
  console.log(`Admin auth success: ID ${user.id}, username: ${user.username}`);
  next();
}