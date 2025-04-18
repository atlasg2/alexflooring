import { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

// Simple JWT token secret
const JWT_SECRET = process.env.JWT_SECRET || "very-secret-key-for-development-only";

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

// Ensure default admin exists
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
      console.log("Admin user created: ID", user.id);
      console.log("Admin password set to: admin123");
    } else {
      console.log("Admin user already exists: ID", adminUser.id);
    }
  } catch (error) {
    console.error("Error ensuring admin exists:", error);
  }
}

// Set up authentication routes and middleware
export function setupSimpleAuth(app: Express) {
  // Make sure default admin user exists
  ensureAdminExists();
  
  // Login route - no session, just returns JWT token
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      console.log(`Login attempt for ${username}`);
      
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log(`User not found: ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Special case for admin during development
      const isDevelopment = process.env.NODE_ENV !== "production";
      let passwordValid = false;
      
      if (isDevelopment && username === "admin" && password === "admin123") {
        console.log("DEV MODE: Using development admin credentials");
        passwordValid = true;
      } else {
        // Normal password check
        passwordValid = await comparePasswords(password, user.password);
      }
      
      if (!passwordValid) {
        console.log(`Invalid password for ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Login successful, create JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: "7d" } // Token expires in 7 days
      );
      
      console.log(`Login successful for ${username}`);
      
      // Return user data and token
      return res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, role = "user" } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role
      });
      
      // Create token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      return res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Get current user info
  app.get("/api/user", authenticateToken, (req, res) => {
    // User is attached to req by the authenticateToken middleware
    res.json({ user: req.user });
  });
  
  // Debug/test route
  app.get("/api/auth-test", authenticateToken, (req, res) => {
    res.json({ 
      message: "Authentication successful", 
      user: req.user 
    });
  });
  
  // Reset admin password (for debugging)
  app.post("/api/debug/reset-admin", async (req, res) => {
    try {
      const adminUser = await storage.getUserByUsername("admin");
      
      if (!adminUser) {
        const hashedPassword = await hashPassword("admin123");
        const user = await storage.createUser({
          username: "admin",
          password: hashedPassword,
          role: "admin"
        });
        
        return res.json({ 
          message: "Admin user created",
          username: "admin",
          password: "admin123" 
        });
      }
      
      // Reset password
      const hashedPassword = await hashPassword("admin123");
      
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, adminUser.id));
      
      return res.json({ 
        message: "Admin password reset",
        username: "admin",
        password: "admin123" 
      });
    } catch (error) {
      console.error("Error resetting admin:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
}

// Middleware to authenticate JWT token
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // Get auth header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Attach user to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.log("Invalid token:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Middleware to check admin role
export function isAdminSimple(req: Request, res: Response, next: NextFunction) {
  // Must be called after authenticateToken
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Not authorized" });
  }
  
  next();
}

// Use both middlewares together for admin routes
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    isAdminSimple(req, res, next);
  });
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}