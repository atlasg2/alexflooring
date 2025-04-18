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

// Initialize admin account if it doesn't exist
async function ensureAdminExists() {
  try {
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
    } else {
      console.log("Admin user already exists:", adminUser.id);
    }
  } catch (error) {
    console.error("Error ensuring admin exists:", error);
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
        const user = await storage.getUserByUsername(username);
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
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
    res.json({ user: req.user });
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
  
  // Debug route to check admin
  app.get("/api/debug/admin", async (req, res) => {
    try {
      const adminUser = await storage.getUserByUsername("admin");
      if (adminUser) {
        res.json({ 
          exists: true, 
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          passwordLength: adminUser.password.length
        });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      console.error("Error in debug route:", error);
      res.status(500).json({ error: "Error checking admin user" });
    }
  });
  
  // Debug route to create admin
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
        passwordHash: hashedPassword
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ error: "Error creating admin user" });
    }
  });
}

// Middleware to check if user is authenticated and is an admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as UserType;
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  
  next();
}