import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertChatMessageSchema,
  insertAppointmentSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
