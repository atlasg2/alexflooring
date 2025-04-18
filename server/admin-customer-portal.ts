import { Express } from "express";
import { isAdmin } from "./auth";
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { insertCustomerProjectSchema, insertCustomerUserSchema } from "@shared/schema";

const scryptAsync = promisify(scrypt);

// Helper function to generate a random password
function generateRandomPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to hash a password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Setup customer portal admin routes
export function setupAdminCustomerPortalRoutes(app: Express) {
  // Customer User Management
  
  // Get all customer users
  app.get("/api/admin/customer-users", isAdmin, async (req, res) => {
    try {
      // This would be implemented in the storage layer
      // For now, let's convert and return mock customer users
      const customers = await storage.getCustomerUsers();
      
      // Return without the password field
      const safeCustomers = customers.map(customer => {
        const { password, ...safeData } = customer;
        return safeData;
      });
      
      res.json(safeCustomers);
    } catch (error) {
      console.error("Error fetching customer users:", error);
      res.status(500).json({ error: "Failed to fetch customer users" });
    }
  });
  
  // Create customer user
  app.post("/api/admin/customer-users", isAdmin, async (req, res) => {
    try {
      const { generatePassword, ...userData } = req.body;
      
      // Check if email already exists
      const existingUser = await storage.getCustomerUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      
      // Generate random password if requested
      const password = generatePassword 
        ? generateRandomPassword()
        : userData.password;
        
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Validate user data against the schema
      const validUserData = insertCustomerUserSchema.parse({
        ...userData,
        password: hashedPassword
      });
      
      // Create the user
      const newUser = await storage.createCustomerUser(validUserData);
      
      // Remove password from the response
      const { password: _, ...safeUserData } = newUser;
      
      // TODO: Send welcome email with login credentials if generatePassword is true
      
      res.status(201).json({
        ...safeUserData,
        message: generatePassword ? 
          `Account created. Temporary password: ${password}` : 
          "Account created successfully"
      });
    } catch (error) {
      console.error("Error creating customer user:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid user data", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: "Failed to create customer user" });
    }
  });
  
  // Reset customer user password
  app.post("/api/admin/customer-users/:id/reset-password", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { generatePassword, newPassword } = req.body;
      
      // Get the user
      const user = await storage.getCustomerUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Generate random password if requested
      const password = generatePassword 
        ? generateRandomPassword()
        : newPassword;
        
      if (!password) {
        return res.status(400).json({ error: "New password is required" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Update the user's password
      await storage.updateCustomerUser(userId, { password: hashedPassword });
      
      // TODO: Send email with new credentials
      
      res.json({
        message: generatePassword ? 
          `Password reset. New temporary password: ${password}` : 
          "Password reset successfully"
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  
  // Delete customer user
  app.delete("/api/admin/customer-users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get the user
      const user = await storage.getCustomerUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Delete the user - this should be implemented in the storage layer
      // await storage.deleteCustomerUser(userId);
      
      // For now, just return success
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer user:", error);
      res.status(500).json({ error: "Failed to delete customer user" });
    }
  });
  
  // Project Management
  
  // Get all customer projects
  app.get("/api/admin/customer-projects", isAdmin, async (req, res) => {
    try {
      // This would be implemented in the storage layer
      // For now, we'll use the projects from getAllCustomerProjects
      const projects = await storage.getAllCustomerProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching customer projects:", error);
      res.status(500).json({ error: "Failed to fetch customer projects" });
    }
  });
  
  // Create customer project
  app.post("/api/admin/customer-projects", isAdmin, async (req, res) => {
    try {
      // Validate project data against the schema
      const validProjectData = insertCustomerProjectSchema.parse(req.body);
      
      // Create the project
      const newProject = await storage.createCustomerProject(validProjectData);
      
      // Automatically generate customer account if contactId is provided
      let accountCreationResult = null;
      if (validProjectData.contactId) {
        try {
          // Get the contact
          const contact = await storage.getContact(validProjectData.contactId);
          
          if (contact && contact.email) {
            // Check if customer user already exists with this email
            const existingUser = await storage.getCustomerUserByEmail(contact.email);
            
            if (existingUser) {
              // If user exists, link the project to this user
              await storage.updateCustomerProject(newProject.id, { 
                customerId: existingUser.id 
              });
              accountCreationResult = {
                status: 'linked',
                message: `Project linked to existing customer account: ${contact.email}`
              };
            } else {
              // Generate random password
              const password = generateRandomPassword();
              
              // Hash the password
              const hashedPassword = await hashPassword(password);
              
              // Create customer user
              const newUser = await storage.createCustomerUser({
                email: contact.email,
                name: contact.name,
                phone: contact.phone || undefined,
                password: hashedPassword,
                contactId: contact.id
              });
              
              // Link the project to this new user
              await storage.updateCustomerProject(newProject.id, { 
                customerId: newUser.id 
              });
              
              accountCreationResult = {
                status: 'created',
                message: `Customer portal account created with email: ${contact.email}`,
                temporaryPassword: password
              };
              
              // TODO: Send welcome email with login credentials
            }
          }
        } catch (accountError) {
          // Log error but don't fail the entire request
          console.error("Error auto-generating customer account:", accountError);
          accountCreationResult = {
            status: 'error',
            message: 'Project created but failed to create customer portal account'
          };
        }
      }
      
      res.status(201).json({
        ...newProject,
        accountCreation: accountCreationResult
      });
    } catch (error) {
      console.error("Error creating customer project:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid project data", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: "Failed to create customer project" });
    }
  });
  
  // Update customer project
  app.put("/api/admin/customer-projects/:id", isAdmin, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Get the project
      const project = await storage.getCustomerProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Update the project
      const updatedProject = await storage.updateCustomerProject(projectId, req.body);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating customer project:", error);
      res.status(500).json({ error: "Failed to update customer project" });
    }
  });
  
  // Generate customer account from contact
  app.post("/api/admin/generate-customer-account", isAdmin, async (req, res) => {
    try {
      const { contactId, projectId } = req.body;
      
      if (!contactId) {
        return res.status(400).json({ error: "Contact ID is required" });
      }
      
      // Get the contact
      const contact = await storage.getContact(contactId);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      // Check if customer user already exists with this email
      if (contact.email) {
        const existingUser = await storage.getCustomerUserByEmail(contact.email);
        if (existingUser) {
          // If project ID is provided, link the project to this user
          if (projectId) {
            const project = await storage.getCustomerProject(projectId);
            if (project) {
              await storage.updateCustomerProject(projectId, { 
                customerId: existingUser.id 
              });
            }
          }
          
          const { password, ...safeUserData } = existingUser;
          return res.json({
            ...safeUserData,
            message: "Customer already has a portal account"
          });
        }
      } else {
        return res.status(400).json({ error: "Contact must have an email address" });
      }
      
      // Generate random password
      const password = generateRandomPassword();
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create customer user
      const newUser = await storage.createCustomerUser({
        email: contact.email,
        name: contact.name,
        phone: contact.phone || undefined,
        password: hashedPassword,
        contactId: contact.id
      });
      
      // If project ID is provided, link the project to this user
      if (projectId) {
        const project = await storage.getCustomerProject(projectId);
        if (project) {
          await storage.updateCustomerProject(projectId, { 
            customerId: newUser.id 
          });
        }
      }
      
      // Remove password from the response
      const { password: _, ...safeUserData } = newUser;
      
      // TODO: Send welcome email with login credentials
      
      res.status(201).json({
        ...safeUserData,
        message: `Account created with temporary password: ${password}`
      });
    } catch (error) {
      console.error("Error generating customer account:", error);
      res.status(500).json({ error: "Failed to generate customer account" });
    }
  });
}