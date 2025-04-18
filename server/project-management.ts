import { Express } from "express";
import { z } from "zod";
import { insertCustomerProjectSchema } from "@shared/schema";
import { storage } from "./storage";
import { isAdminSimple } from "./simple-auth";

export function setupProjectManagementRoutes(app: Express) {
  // List all projects - primarily for the admin panel
  app.get("/api/projects", isAdminSimple, async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get a single project by ID
  app.get("/api/projects/:id", isAdminSimple, async (req, res) => {
    try {
      const project = await storage.getCustomerProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error(`Error fetching project ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create a new project
  app.post("/api/projects", isAdminSimple, async (req, res) => {
    try {
      console.log("Creating new project:", JSON.stringify(req.body, null, 2));
      
      // First, validate the incoming data
      const validatedData = insertCustomerProjectSchema.parse(req.body);
      
      // Create the project
      const project = await storage.createCustomerProject(validatedData);
      console.log("Successfully created project:", JSON.stringify(project, null, 2));
      
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update a project
  app.put("/api/projects/:id", isAdminSimple, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getCustomerProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updatedProject = await storage.updateCustomerProject(id, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error(`Error updating project ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add progress update to a project
  app.post("/api/projects/:id/progress", isAdminSimple, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getCustomerProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const { status, note, date, images } = req.body;
      if (!status || !note) {
        return res.status(400).json({ message: "Status and note are required" });
      }
      
      const updated = await storage.addProjectProgressUpdate(id, { 
        status, 
        note, 
        date, 
        images 
      });
      
      res.json(updated);
    } catch (error) {
      console.error(`Error updating project progress ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add document to a project
  app.post("/api/projects/:id/documents", isAdminSimple, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getCustomerProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const { name, url, type } = req.body;
      if (!name || !url || !type) {
        return res.status(400).json({ message: "Name, URL, and type are required" });
      }
      
      const updated = await storage.addProjectDocument(id, { name, url, type });
      res.json(updated);
    } catch (error) {
      console.error(`Error adding document to project ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error" });
    }
  });
}