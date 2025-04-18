import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertChatMessageSchema,
  insertAppointmentSchema,
  insertContactSchema,
  insertCommunicationLogSchema,
  insertReviewSchema,
  insertEmailTemplateSchema,
  insertSmsTemplateSchema,
  insertAutomationWorkflowSchema
} from "@shared/schema";
import { setupAuth, isAdmin } from "./auth";
import { setupAuth as setupNewAuth } from "./auth-new";
import { setupSimpleAuth, isAdminSimple } from "./simple-auth";
import { setupCustomerAuth } from "./customer-auth";
import { setupCustomerProjectRoutes } from "./customer-projects";
import { setupProjectManagementRoutes } from "./project-management"; 
import { setupAdminCustomerPortalRoutes } from "./admin-customer-portal";
import { setupSalesWorkflowRoutes } from "./sales-workflow";
import { emailService } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication and admin protection
  setupAuth(app);
  
  // Set up our new authentication systems
  setupNewAuth(app);
  setupSimpleAuth(app); // Simple JWT-based auth
  
  // Set up customer portal authentication and routes
  setupCustomerAuth(app);
  setupCustomerProjectRoutes(app);
  
  // Set up admin customer portal routes
  setupAdminCustomerPortalRoutes(app);
  
  // Set up project management routes
  setupProjectManagementRoutes(app);
  
  // Set up sales workflow routes (estimates, contracts, invoices)
  setupSalesWorkflowRoutes(app);
  
  // Test email functionality
  app.get("/api/test-email", async (req, res) => {
    try {
      const result = await emailService.sendCustomEmail({
        to: "nicksanford2341@gmail.com",
        subject: "Test Email from APS Flooring Portal",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
            <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0;">Test Email</p>
            </div>
            
            <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
              <h2 style="color: #000000; margin-top: 0;">This is a test email</h2>
              <p>This email was sent as a test of the email functionality in the APS Flooring admin portal.</p>
              <p>Date/Time: ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
              <p>&copy; ${new Date().getFullYear()} APS Flooring LLC. All rights reserved.</p>
            </div>
          </div>
        `
      });
      
      res.json({ success: true, result });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  
  // Public endpoints
  
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      console.log("Received contact submission:", req.body);
      
      // Explicitly handle createContact flag to prioritize contact creation from chat
      const createContact = req.body.createContact === true;
      
      // Remove non-schema fields before validation
      const { createContact: _, ...dataToValidate } = req.body;
      
      const validatedData = insertContactSubmissionSchema.parse(dataToValidate);
      
      // For chat messages, explicitly force contact creation if requested
      if (validatedData.type === 'chat' && createContact) {
        console.log("Creating contact from chat message is explicitly requested");
        
        // Create or find a contact
        let contactId: number | null = null;
        
        try {
          // First check if contact with this email already exists
          if (validatedData.email) {
            const existingContact = await storage.getUserByEmail(validatedData.email);
            
            if (existingContact) {
              contactId = existingContact.id;
              console.log("Found existing contact:", contactId);
            } else {
              // Create new contact directly 
              const newContact = await storage.createContact({
                name: validatedData.name || 'Unknown',
                email: validatedData.email,
                phone: validatedData.phone || null,
                source: 'chat',
                notes: `Initial contact via chat widget: ${validatedData.message}`,
                leadStage: 'new'
              });
              
              contactId = newContact.id;
              console.log("Created new contact:", contactId);
            }
          }
        } catch (contactError) {
          console.error("Error handling contact creation:", contactError);
          // Continue even if contact creation fails
        }
        
        // If we have a contactId, include it in the submission
        if (contactId) {
          validatedData.contactId = contactId;
        }
      }
      
      const submission = await storage.createContactSubmission(validatedData);
      res.status(201).json({ 
        message: "Contact form submitted successfully", 
        id: submission.id,
        contactId: submission.contactId 
      });
    } catch (error) {
      console.error("Contact form submission error:", error);
      res.status(400).json({ message: "Invalid form data" });
    }
  });
  
  // Chat messages API
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json({ message: "Message sent successfully", id: message.id });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });
  
  // Admin API endpoints - protected with isAdmin middleware
  
  // Contact submissions
  app.get("/api/admin/contacts", isAdmin, async (req, res) => {
    try {
      const contacts = await storage.getContactSubmissions();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/contacts/:id", isAdmin, async (req, res) => {
    try {
      const contact = await storage.getContactSubmission(parseInt(req.params.id));
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/admin/contacts/:id/status", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updated = await storage.updateContactSubmissionStatus(parseInt(req.params.id), status);
      if (!updated) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating contact status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Chat messages
  app.get("/api/admin/chat", isAdmin, async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get unread messages count
  app.get("/api/admin/chat/unread-count", isAdmin, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount();
      res.json({ count: count.toString() });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/admin/chat/:id/read", isAdmin, async (req, res) => {
    try {
      // Try to update the contact submission status first
      await storage.updateContactSubmissionStatus(parseInt(req.params.id), 'read');
      
      // For legacy support, also try to mark chat message as read
      try {
        await storage.markChatMessageAsRead(parseInt(req.params.id));
      } catch (error) {
        // Ignore errors from the chat message system
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Appointments
  app.get("/api/admin/appointments", isAdmin, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/admin/appointments", isAdmin, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Appointment creation error:", error);
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });
  
  app.get("/api/admin/appointments/:id", isAdmin, async (req, res) => {
    try {
      const appointment = await storage.getAppointment(parseInt(req.params.id));
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/admin/appointments/:id/status", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updated = await storage.updateAppointmentStatus(parseInt(req.params.id), status);
      if (!updated) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Calendar view - get appointments by date
  app.get("/api/admin/calendar/:date", isAdmin, async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const appointments = await storage.getAppointmentsByDate(date);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching calendar:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // CONTACT MANAGEMENT ENDPOINTS
  app.get("/api/admin/crm/contacts", isAdmin, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/crm/contacts/search", isAdmin, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        const contacts = await storage.getContacts();
        return res.json(contacts);
      }
      
      const results = await storage.searchContacts(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching contacts:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/crm/contacts/:id", isAdmin, async (req, res) => {
    try {
      const contact = await storage.getContact(parseInt(req.params.id));
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/admin/crm/contacts", isAdmin, async (req, res) => {
    try {
      console.log("Creating contact from admin panel:", JSON.stringify(req.body, null, 2));
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      console.log("Successfully created contact:", JSON.stringify(contact, null, 2));
      res.status(201).json(contact);
    } catch (error) {
      console.error("Contact creation error:", error);
      res.status(400).json({ message: "Invalid contact data" });
    }
  });
  
  app.put("/api/admin/crm/contacts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateContact(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/admin/crm/contacts/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteContact(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // COMMUNICATION LOGS ENDPOINTS
  app.get("/api/admin/crm/communications", isAdmin, async (req, res) => {
    try {
      const contactId = req.query.contactId ? parseInt(req.query.contactId as string) : undefined;
      const logs = await storage.getCommunicationLogs(contactId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching communication logs:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/admin/crm/communications", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCommunicationLogSchema.parse(req.body);
      const log = await storage.createCommunicationLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Communication log creation error:", error);
      res.status(400).json({ message: "Invalid communication log data" });
    }
  });
  
  // REVIEW MANAGEMENT ENDPOINTS
  app.get("/api/admin/reviews", isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/reviews/:id", isAdmin, async (req, res) => {
    try {
      const review = await storage.getReview(parseInt(req.params.id));
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/admin/reviews", isAdmin, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Review creation error:", error);
      res.status(400).json({ message: "Invalid review data" });
    }
  });
  
  app.put("/api/admin/reviews/:id/status", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updated = await storage.updateReviewStatus(parseInt(req.params.id), status);
      if (!updated) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating review status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // EMAIL TEMPLATE ENDPOINTS
  app.get("/api/admin/email-templates", isAdmin, async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/email-templates/:id", isAdmin, async (req, res) => {
    try {
      const template = await storage.getEmailTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/admin/email-templates", isAdmin, async (req, res) => {
    try {
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Email template creation error:", error);
      res.status(400).json({ message: "Invalid email template data" });
    }
  });
  
  app.put("/api/admin/email-templates/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateEmailTemplate(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/admin/email-templates/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteEmailTemplate(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // SMS TEMPLATE ENDPOINTS
  app.get("/api/admin/sms-templates", isAdmin, async (req, res) => {
    try {
      const templates = await storage.getSmsTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching SMS templates:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/sms-templates/:id", isAdmin, async (req, res) => {
    try {
      const template = await storage.getSmsTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ message: "SMS template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching SMS template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/admin/sms-templates", isAdmin, async (req, res) => {
    try {
      const validatedData = insertSmsTemplateSchema.parse(req.body);
      const template = await storage.createSmsTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("SMS template creation error:", error);
      res.status(400).json({ message: "Invalid SMS template data" });
    }
  });
  
  app.put("/api/admin/sms-templates/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateSmsTemplate(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "SMS template not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating SMS template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/admin/sms-templates/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteSmsTemplate(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting SMS template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // AUTOMATION WORKFLOW ENDPOINTS - using "/api/admin/automation" path
  app.get("/api/admin/automation", isAdmin, async (req, res) => {
    try {
      const workflows = await storage.getAutomationWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching automation workflows:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/admin/automation/:id", isAdmin, async (req, res) => {
    try {
      const workflow = await storage.getAutomationWorkflow(parseInt(req.params.id));
      if (!workflow) {
        return res.status(404).json({ message: "Automation workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching automation workflow:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/admin/automation", isAdmin, async (req, res) => {
    try {
      const validatedData = insertAutomationWorkflowSchema.parse(req.body);
      const workflow = await storage.createAutomationWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      console.error("Automation workflow creation error:", error);
      res.status(400).json({ message: "Invalid workflow data" });
    }
  });
  
  app.put("/api/admin/automation/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateAutomationWorkflow(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Automation workflow not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating automation workflow:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/api/admin/automation/:id/toggle", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean value" });
      }
      
      const updated = await storage.toggleAutomationWorkflow(id, isActive);
      if (!updated) {
        return res.status(404).json({ message: "Automation workflow not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error toggling automation workflow:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/admin/automation/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteAutomationWorkflow(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting automation workflow:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
