import { Request, Response, NextFunction, Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { CustomerUser, InsertCustomerUser } from "@shared/schema";

// Declare customer user for Express session
declare global {
  namespace Express {
    interface User {
      id?: number;
      email?: string;
      role?: string;
      name?: string;
      isCustomer?: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Password hashing functions
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Setup customer portal authentication routes
export function setupCustomerAuth(app: Express) {
  // Customer login
  app.post("/api/customer/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const customer = await storage.getCustomerUserByEmail(email);
      
      if (!customer) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const validPassword = await comparePasswords(password, customer.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Update last login time
      await storage.updateCustomerLastLogin(customer.id);
      
      // Set customer in session
      req.session.customer = {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        isCustomer: true
      };
      
      // Return customer info without the password
      const { password: _, ...customerData } = customer;
      res.json(customerData);
    } catch (error) {
      console.error("Customer login error:", error);
      res.status(500).json({ error: "An error occurred during login" });
    }
  });
  
  // Customer registration
  app.post("/api/customer/register", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ 
          error: "Email, password, and name are required" 
        });
      }
      
      // Check if email already exists
      const existingUser = await storage.getCustomerUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: "A user with this email already exists" 
        });
      }
      
      // Check if there's a contact with this email
      const existingContact = await storage.getUserByEmail(email);
      const contactId = existingContact?.id;
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create customer user
      const newCustomer = await storage.createCustomerUser({
        email,
        password: hashedPassword,
        name,
        phone,
        contactId: contactId
      });
      
      // Set customer in session
      req.session.customer = {
        id: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name,
        isCustomer: true
      };
      
      // Return customer info without the password
      const { password: _, ...customerData } = newCustomer;
      res.status(201).json(customerData);
    } catch (error) {
      console.error("Customer registration error:", error);
      res.status(500).json({ error: "An error occurred during registration" });
    }
  });
  
  // Customer logout
  app.post("/api/customer/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Get current customer
  app.get("/api/customer/me", (req, res) => {
    if (!req.session.customer) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    res.json(req.session.customer);
  });
}

// Middleware to check if user is authenticated as a customer
export function isCustomer(req: Request, res: Response, next: NextFunction) {
  if (!req.session.customer || !req.session.customer.isCustomer) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}