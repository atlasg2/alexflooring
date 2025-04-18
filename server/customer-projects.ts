import { Request, Response, Express } from "express";
import { storage } from "./storage";
import { isCustomer } from "./customer-auth";
import { insertCustomerProjectSchema } from "@shared/schema";
import { z } from "zod";
import { emailService } from "./email-service";

// Setup customer project routes
export function setupCustomerProjectRoutes(app: Express) {
  // Get all projects for the current customer
  app.get("/api/customer/projects", isCustomer, async (req, res) => {
    try {
      if (!req.session.customer || !req.session.customer.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const customerId = req.session.customer.id;
      const projects = await storage.getCustomerProjects(customerId);
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching customer projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });
  
  // Get a specific project by ID
  app.get("/api/customer/projects/:id", isCustomer, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const project = await storage.getCustomerProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Security check: make sure the project belongs to the current customer
      if (project.customerId !== req.session.customer?.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });
  
  // Create a new project (admin-only for now)
  app.post("/api/admin/customer-projects", async (req, res) => {
    try {
      // Validate the request body
      const projectData = insertCustomerProjectSchema.parse(req.body);
      
      // Create the project
      const project = await storage.createCustomerProject(projectData);
      
      // Check if there's a contact associated and send email notification
      if (project.contactId) {
        try {
          const contact = await storage.getContact(project.contactId);
          
          // Safety check in case contact doesn't exist
          if (!contact) {
            console.log(`Contact with ID ${project.contactId} not found`);
            res.status(201).json(project);
            return;
          }
          
          const customerUser = contact.email ? 
            await storage.getCustomerUserByEmail(contact.email) : null;
          
          // Generate account response to include in return
          let accountCreation = null;
          
          if (contact && contact.email) {
            if (customerUser) {
              // Customer user already exists, link to project
              accountCreation = {
                status: 'linked',
                message: `Project linked to existing customer account for ${contact.email}`
              };
              
              // Send project notification email
              try {
                await emailService.sendProjectUpdate({
                  to: contact.email || '',
                  name: contact.name,
                  projectTitle: project.title,
                  updateMessage: `A new project "${project.title}" has been created for you. You can view the details in your customer portal.`,
                  loginUrl: `${process.env.APP_URL || 'https://apsflooring.info'}/customer/auth`
                });
                console.log(`Project creation email sent to ${contact.email}`);
              } catch (emailError) {
                console.error("Error sending project creation email:", emailError);
              }
              
            } else {
              // No customer account yet, one will be created by admin-customer-portal.ts
              // when accessing create-customer-account endpoint
              accountCreation = {
                status: 'pending',
                message: 'Customer account needs to be created'
              };
            }
          }
          
          res.status(201).json({
            ...project,
            accountCreation
          });
          return;
        } catch (contactError) {
          console.error("Error handling project contact notification:", contactError);
          // Continue without failing the whole request
        }
      }
      
      // Default response if no contact processing happened
      res.status(201).json(project);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid project data", 
          details: error.errors 
        });
      }
      
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });
  
  // Add a progress update to a project (admin-only for now)
  app.post("/api/admin/customer-projects/:id/progress", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const { status, note, date, images } = req.body;
      
      if (!status || !note) {
        return res.status(400).json({ error: "Status and note are required" });
      }
      
      const project = await storage.addProjectProgressUpdate(projectId, {
        status,
        note,
        date,
        images
      });
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // If the project has a contact, send a notification email
      if (project.contactId) {
        try {
          const contact = await storage.getContact(project.contactId);
          
          // Safety check in case contact doesn't exist
          if (!contact) {
            console.log(`Contact with ID ${project.contactId} not found for progress update`);
            res.json(project);
            return;
          }
          
          if (contact && contact.email) {
            try {
              await emailService.sendProjectUpdate({
                to: contact.email || '',
                name: contact.name,
                projectTitle: project.title,
                updateMessage: `${status}: ${note}`,
                loginUrl: `${process.env.APP_URL || 'https://apsflooring.info'}/customer/auth`
              });
              console.log(`Progress update email sent to ${contact.email}`);
            } catch (emailError) {
              console.error("Error sending progress update email:", emailError);
              // Don't fail the request if the email fails
            }
          }
        } catch (contactError) {
          console.error("Error getting contact for notification:", contactError);
        }
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error adding progress update:", error);
      res.status(500).json({ error: "Failed to add progress update" });
    }
  });
  
  // Add a document to a project (admin-only for now)
  app.post("/api/admin/customer-projects/:id/documents", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const { name, url, type } = req.body;
      
      if (!name || !url || !type) {
        return res.status(400).json({ 
          error: "Document name, URL, and type are required" 
        });
      }
      
      const project = await storage.addProjectDocument(projectId, {
        name,
        url,
        type
      });
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // If the project has a contact, send a document notification email
      if (project.contactId) {
        try {
          const contact = await storage.getContact(project.contactId);
          
          // Safety check in case contact doesn't exist
          if (!contact) {
            console.log(`Contact with ID ${project.contactId} not found for document notification`);
            res.json(project);
            return;
          }
          
          if (contact && contact.email) {
            try {
              await emailService.sendNewDocumentNotification({
                to: contact.email || '',
                name: contact.name,
                projectTitle: project.title,
                documentName: name,
                documentType: type,
                loginUrl: `${process.env.APP_URL || 'https://apsflooring.info'}/customer/auth`
              });
              console.log(`Document notification email sent to ${contact.email}`);
            } catch (emailError) {
              console.error("Error sending document notification email:", emailError);
              // Don't fail the request if the email fails
            }
          }
        } catch (contactError) {
          console.error("Error getting contact for document notification:", contactError);
        }
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error adding document:", error);
      res.status(500).json({ error: "Failed to add document" });
    }
  });
}