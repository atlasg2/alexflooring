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

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication and admin protection
  setupAuth(app);
  
  // Public endpoints
  
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.status(201).json({ message: "Contact form submitted successfully", id: submission.id });
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
  
  app.get("/api/admin/chat/unread-count", isAdmin, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/admin/chat/:id/read", isAdmin, async (req, res) => {
    try {
      await storage.markChatMessageAsRead(parseInt(req.params.id));
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
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
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
