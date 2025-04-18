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
      // Extract portal account data before validation
      const { createPortalAccount, portalCredentials, ...projectRequestData } = req.body;
      
      // Validate the request body
      const projectData = insertCustomerProjectSchema.parse(projectRequestData);
      
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
          
          // Generate account response to include in return
          let accountCreation = null;
          
          // If the contact has an email, check for customer account
          if (contact && contact.email) {
            // First check if a customer user already exists
            let customerUser = contact.email ? 
              await storage.getCustomerUserByEmail(contact.email) : null;
            
            // If we're explicitly creating a portal account and have credentials
            if (createPortalAccount && portalCredentials && !customerUser) {
              try {
                console.log("Creating customer portal account during project creation");
                // Create a new customer user with the provided credentials
                customerUser = await storage.createCustomerUser({
                  email: contact.email,
                  name: contact.name,
                  phone: contact.phone || "",
                  password: portalCredentials.password,
                  username: portalCredentials.username,
                });
                
                accountCreation = {
                  status: 'created',
                  message: `New customer account created for ${contact.email}`
                };
                
                // Update the project with the customer ID
                await storage.updateCustomerProject(project.id, {
                  customerId: customerUser.id
                });
                
                // Send account credentials email if requested
                if (portalCredentials.sendEmail) {
                  try {
                    await emailService.sendCustomerPortalCredentials({
                      to: contact.email,
                      name: contact.name,
                      username: portalCredentials.username,
                      password: portalCredentials.password,
                      loginUrl: `${process.env.APP_URL || 'https://apsflooring.info'}/customer/auth`
                    });
                    console.log(`Portal credentials email sent to ${contact.email}`);
                  } catch (emailError) {
                    console.error("Error sending portal credentials email:", emailError);
                  }
                }
                
                // Also send project notification
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
              } catch (accountError) {
                console.error("Error creating customer account:", accountError);
                accountCreation = {
                  status: 'error',
                  message: 'Failed to create customer account'
                };
              }
            } else if (customerUser) {
              // Customer user already exists, link to project
              accountCreation = {
                status: 'linked',
                message: `Project linked to existing customer account for ${contact.email}`
              };
              
              // Update the project with the customer ID if not already set
              if (!project.customerId) {
                await storage.updateCustomerProject(project.id, {
                  customerId: customerUser.id
                });
              }
              
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
            } else if (!createPortalAccount) {
              // No customer account yet and not explicitly creating one
              accountCreation = {
                status: 'pending',
                message: 'Customer account needs to be created'
              };
            }
          }
          
          // Refetch the project with updated customerId if needed
          const updatedProject = await storage.getCustomerProject(project.id) || project;
          
          res.status(201).json({
            ...updatedProject,
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