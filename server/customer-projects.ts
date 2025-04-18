import { Request, Response, Express } from "express";
import { storage } from "./storage";
import { isCustomer } from "./customer-auth";
import { insertCustomerProjectSchema } from "@shared/schema";
import { z } from "zod";

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
      
      res.json(project);
    } catch (error) {
      console.error("Error adding document:", error);
      res.status(500).json({ error: "Failed to add document" });
    }
  });
}