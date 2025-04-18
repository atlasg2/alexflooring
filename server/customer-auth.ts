import { Request, Response, NextFunction, Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { CustomerUser, InsertCustomerUser } from "@shared/schema";
import session from "express-session";

// Extend SessionData to include customer property
declare module "express-session" {
  interface SessionData {
    customer?: {
      id: number;
      email: string;
      username: string;
      name: string;
      isCustomer: boolean;
    };
  }
}

// Declare customer user for Express session
declare global {
  namespace Express {
    interface User {
      id?: number;
      email?: string;
      username?: string;
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
        return res.status(400).json({ error: "Email/username and password are required" });
      }
      
      console.log(`Customer login attempt: ${email}`);
      
      // Support login via email or username
      let customer;
      if (email.includes('@')) {
        // If it looks like an email, search by email
        customer = await storage.getCustomerUserByEmail(email);
        console.log(`Searching by email: ${email}, found:`, customer ? "yes" : "no");
      } else {
        // Otherwise, assume it's a username
        customer = await storage.getCustomerUserByUsername(email);
        console.log(`Searching by username: ${email}, found:`, customer ? "yes" : "no");
      }
      
      if (!customer) {
        console.log(`No customer found for login: ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const validPassword = await comparePasswords(password, customer.password);
      console.log(`Password validation for ${email}: ${validPassword ? "success" : "failed"}`);
      
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Update last login time
      await storage.updateCustomerLastLogin(customer.id);
      
      // Set customer in session
      req.session.customer = {
        id: customer.id,
        email: customer.email,
        username: customer.username,
        name: customer.name,
        isCustomer: true
      };
      
      // Make sure session is saved before sending response
      req.session.save(err => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ error: "Session error" });
        }
        
        // Return customer info without the password
        const { password: _, ...customerData } = customer;
        console.log(`Customer login successful for ${email}, customer ID: ${customer.id}`);
        res.json(customerData);
      });
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
      
      // Create username from email if not provided
      const username = email.split('@')[0];
      
      // Create customer user
      const newCustomer = await storage.createCustomerUser({
        email,
        username,
        password: hashedPassword,
        name,
        phone,
        contactId: contactId
      });
      
      // Set customer in session
      req.session.customer = {
        id: newCustomer.id,
        email: newCustomer.email,
        username: newCustomer.username,
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
    console.log("Checking customer session:", req.session.id);
    console.log("Customer in session:", req.session.customer ? "yes" : "no");
    
    if (!req.session.customer) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Access the customer from the session
    const customerInSession = req.session.customer;
    console.log(`Retrieved customer from session: ID ${customerInSession.id}, ${customerInSession.username}`);
    
    // Optionally, refresh the customer data from the database
    if (customerInSession.id) {
      storage.getCustomerUser(customerInSession.id)
        .then(freshCustomer => {
          if (freshCustomer) {
            // Don't send the password back
            const { password: _, ...customerData } = freshCustomer;
            console.log(`Returning fresh customer data for ID: ${freshCustomer.id}`);
            res.json({
              ...customerData,
              isCustomer: true // Ensure this flag is set
            });
          } else {
            // If the customer no longer exists in the DB but is in the session
            console.log("Customer found in session but not in DB - using session data");
            res.json(customerInSession);
          }
        })
        .catch(err => {
          console.error("Error fetching fresh customer data:", err);
          // Fallback to session data if DB fetch fails
          res.json(customerInSession);
        });
    } else {
      // If no customer ID, just return session data
      res.json(customerInSession);
    }
  });
}

// Middleware to check if user is authenticated as a customer
export function isCustomer(req: Request, res: Response, next: NextFunction) {
  console.log("isCustomer middleware - session ID:", req.session.id);
  
  if (!req.session) {
    console.log("CRITICAL ERROR: No session object available");
    return res.status(401).json({ error: "No session available" });
  }
  
  if (!req.session.customer) {
    console.log("Customer auth failed: No customer in session");
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  if (!req.session.customer.isCustomer) {
    console.log("Customer auth failed: Session user is not a customer");
    return res.status(401).json({ error: "Not authorized as customer" });
  }
  
  console.log(`Customer auth success: ID ${req.session.customer.id}, username: ${req.session.customer.username}`);
  next();
}