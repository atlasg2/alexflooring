import { Express } from "express";
import { isAdmin } from "./auth";
import { storage } from "./storage";
import { emailService } from "./email-service";
import { 
  insertAutomationWorkflowSchema,
  InsertCustomerUser
} from "@shared/schema";
import { generatePassword } from "./customer-auth";
import { db } from "./db";

// Types for workflow engine
interface WorkflowTrigger {
  name: string;
  description: string;
  type: 'manual' | 'lead_stage_change' | 'appointment' | 'form_submission' | 'estimate_approval' | 'contract_signed' | 'schedule';
}

interface WorkflowAction {
  name: string;
  description: string;
  type: 'send_email' | 'send_sms' | 'create_task' | 'create_customer_account' | 'create_project' | 'convert_to_contract' | 'create_invoice';
  handler: (data: any, options?: any) => Promise<any>;
}

// Available workflow triggers
const WORKFLOW_TRIGGERS: WorkflowTrigger[] = [
  {
    name: 'lead_stage_change',
    description: 'Triggered when a lead changes stage',
    type: 'lead_stage_change'
  },
  {
    name: 'estimate_approval',
    description: 'Triggered when an estimate is approved',
    type: 'estimate_approval'
  },
  {
    name: 'contract_signed',
    description: 'Triggered when a contract is signed',
    type: 'contract_signed'
  },
  {
    name: 'form_submission',
    description: 'Triggered when a contact form is submitted',
    type: 'form_submission'
  },
  {
    name: 'appointment_scheduled',
    description: 'Triggered when an appointment is scheduled',
    type: 'appointment'
  },
  {
    name: 'appointment_reminder',
    description: 'Triggered before an appointment (reminder)',
    type: 'schedule'
  },
  {
    name: 'manual_trigger',
    description: 'Manually triggered workflow',
    type: 'manual'
  }
];

// Workflow action handlers
const workflowActions: Record<string, WorkflowAction> = {
  send_email: {
    name: 'send_email',
    description: 'Sends an email using a template',
    type: 'send_email',
    handler: async (data: { 
      recipientEmail: string; 
      templateId?: number; 
      customSubject?: string; 
      customBody?: string;
      variables?: Record<string, string>;
    }) => {
      try {
        // If template ID is provided, get the template
        if (data.templateId) {
          const template = await storage.getEmailTemplate(data.templateId);
          if (template) {
            // Replace variables in the template
            let htmlContent = template.htmlContent;
            if (data.variables) {
              Object.entries(data.variables).forEach(([key, value]) => {
                htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
              });
            }
            
            return await emailService.sendCustomEmail({
              to: data.recipientEmail,
              subject: template.subject,
              html: htmlContent
            });
          }
        }
        
        // If no template or template not found, use custom content
        if (data.customSubject && data.customBody) {
          let htmlContent = data.customBody;
          if (data.variables) {
            Object.entries(data.variables).forEach(([key, value]) => {
              htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
          }
          
          return await emailService.sendCustomEmail({
            to: data.recipientEmail,
            subject: data.customSubject,
            html: htmlContent
          });
        }
        
        throw new Error("Email template or custom content not provided");
      } catch (error) {
        console.error("Error in send_email action:", error);
        throw error;
      }
    }
  },
  
  create_customer_account: {
    name: 'create_customer_account',
    description: 'Creates a customer portal account',
    type: 'create_customer_account',
    handler: async (data: { 
      contactId: number;
      email?: string;
      name?: string;
      phone?: string;
      sendWelcomeEmail?: boolean;
    }) => {
      try {
        // Get contact info if needed
        const contact = await storage.getContact(data.contactId);
        if (!contact) {
          throw new Error(`Contact with ID ${data.contactId} not found`);
        }
        
        // Check if customer account already exists for this contact
        const existingUser = await storage.getCustomerUserByContactId(data.contactId);
        if (existingUser) {
          console.log(`Customer account already exists for contact ID ${data.contactId}`);
          return existingUser;
        }
        
        // Generate temporary password
        const tempPassword = generatePassword();
        
        // Create user data
        const customerData: InsertCustomerUser = {
          email: data.email || contact.email || '',
          username: (data.email || contact.email || '').toLowerCase(),
          password: tempPassword, // Will be hashed by storage module
          name: data.name || contact.name,
          phone: data.phone || contact.phone || '',
          contactId: data.contactId
        };
        
        // Validate email
        if (!customerData.email) {
          throw new Error(`Email is required for customer account creation`);
        }
        
        // Create customer account
        const newCustomer = await storage.createCustomerUser(customerData);
        
        // Send welcome email if requested
        if (data.sendWelcomeEmail !== false && newCustomer) {
          await emailService.sendCustomerPortalWelcome({
            to: newCustomer.email,
            name: newCustomer.name,
            email: newCustomer.email,
            password: tempPassword // Send the un-hashed password
          });
        }
        
        return newCustomer;
      } catch (error) {
        console.error("Error in create_customer_account action:", error);
        throw error;
      }
    }
  },
  
  create_project: {
    name: 'create_project',
    description: 'Creates a customer project',
    type: 'create_project',
    handler: async (data: { 
      customerId: number;
      contactId?: number;
      title: string;
      description?: string;
      flooringType?: string;
      squareFootage?: string;
      estimatedCost?: string;
      notifyCustomer?: boolean;
    }) => {
      try {
        // Create the project
        const project = await storage.createCustomerProject({
          customerId: data.customerId,
          contactId: data.contactId,
          title: data.title,
          description: data.description || '',
          flooringType: data.flooringType || '',
          squareFootage: data.squareFootage || '',
          estimatedCost: data.estimatedCost || '',
          status: 'pending'
        });
        
        // Notify customer if requested
        if (data.notifyCustomer !== false && project) {
          const customer = await storage.getCustomerUser(data.customerId);
          if (customer) {
            await emailService.sendProjectUpdate({
              to: customer.email,
              name: customer.name,
              projectTitle: project.title,
              updateMessage: `Your new project "${project.title}" has been created in your customer portal. Log in to view details.`
            });
          }
        }
        
        return project;
      } catch (error) {
        console.error("Error in create_project action:", error);
        throw error;
      }
    }
  },
  
  convert_to_contract: {
    name: 'convert_to_contract',
    description: 'Converts an estimate to a contract',
    type: 'convert_to_contract',
    handler: async (data: { 
      estimateId: number;
      sendToCustomer?: boolean;
    }) => {
      try {
        // Convert the estimate to a contract
        const contract = await storage.createContractFromEstimate(data.estimateId);
        
        // Send to customer if requested
        if (data.sendToCustomer === true && contract) {
          await storage.sendContract(contract.id);
        }
        
        return contract;
      } catch (error) {
        console.error("Error in convert_to_contract action:", error);
        throw error;
      }
    }
  }
};

// Workflow execution engine
class WorkflowEngine {
  // Run a workflow by ID
  async runWorkflow(workflowId: number, data: any): Promise<any> {
    try {
      const workflow = await storage.getAutomationWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }
      
      if (!workflow.isActive) {
        console.log(`Workflow ${workflow.name} (ID: ${workflowId}) is inactive`);
        return null;
      }
      
      console.log(`Executing workflow: ${workflow.name} (ID: ${workflowId})`);
      
      // Parse the actions JSON
      const actions = workflow.actions as any[];
      
      // Execute each action in sequence
      const results = [];
      for (const action of actions) {
        if (!action.type || !workflowActions[action.type]) {
          console.warn(`Unknown action type: ${action.type}`);
          continue;
        }
        
        // Execute the action with merged data
        const actionData = { ...data, ...action.data };
        console.log(`Executing action: ${action.type}`);
        const result = await workflowActions[action.type].handler(actionData);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error("Error executing workflow:", error);
      throw error;
    }
  }
  
  // Run workflows based on a trigger type and data
  async runWorkflowsByTrigger(triggerType: string, data: any, condition?: string): Promise<any> {
    try {
      // Find all active workflows with matching trigger
      const workflows = await storage.getWorkflowsByTrigger(triggerType, condition);
      
      const results = [];
      for (const workflow of workflows) {
        // Check if we need to delay execution
        if (workflow.delay && workflow.delay > 0) {
          console.log(`Scheduling workflow ${workflow.name} to run in ${workflow.delay} hours`);
          // Schedule for later execution
          setTimeout(() => {
            this.runWorkflow(workflow.id, data).catch(err => {
              console.error(`Error executing delayed workflow ${workflow.name}:`, err);
            });
          }, workflow.delay * 60 * 60 * 1000);
        } else {
          // Execute immediately
          const result = await this.runWorkflow(workflow.id, data);
          results.push(result);
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error running workflows by trigger:", error);
      throw error;
    }
  }
}

// Create singleton instance
export const workflowEngine = new WorkflowEngine();

// Set up workflow-related routes
export function setupWorkflowRoutes(app: Express) {
  // Get all available triggers
  app.get("/api/admin/workflows/triggers", isAdmin, (req, res) => {
    res.json(WORKFLOW_TRIGGERS);
  });
  
  // Get all available actions
  app.get("/api/admin/workflows/actions", isAdmin, (req, res) => {
    const actions = Object.values(workflowActions).map(action => ({
      name: action.name,
      description: action.description,
      type: action.type
    }));
    res.json(actions);
  });
  
  // Get all workflows
  app.get("/api/admin/workflows", isAdmin, async (req, res) => {
    try {
      const workflows = await storage.getAutomationWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Get a specific workflow
  app.get("/api/admin/workflows/:id", isAdmin, async (req, res) => {
    try {
      const workflow = await storage.getAutomationWorkflow(parseInt(req.params.id));
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Create a new workflow
  app.post("/api/admin/workflows", isAdmin, async (req, res) => {
    try {
      const validatedData = insertAutomationWorkflowSchema.parse(req.body);
      const workflow = await storage.createAutomationWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });
  
  // Update a workflow
  app.put("/api/admin/workflows/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAutomationWorkflowSchema.partial().parse(req.body);
      
      const updated = await storage.updateAutomationWorkflow(id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating workflow:", error);
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });
  
  // Delete a workflow
  app.delete("/api/admin/workflows/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteAutomationWorkflow(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Manually run a workflow
  app.post("/api/admin/workflows/:id/run", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      const results = await workflowEngine.runWorkflow(id, data);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Error running workflow:", error);
      res.status(500).json({ error: "Error running workflow" });
    }
  });
  
  // Create customer portal account for contact
  app.post("/api/admin/contacts/:id/create-account", isAdmin, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const options = req.body || {};
      
      const result = await workflowActions.create_customer_account.handler({
        contactId,
        ...options
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating customer account:", error);
      res.status(400).json({ error: "Failed to create customer account" });
    }
  });
}

// Event handlers for various triggers
export const workflowEvents = {
  // When estimate is approved
  onEstimateApproved: async (estimateId: number) => {
    try {
      const estimate = await storage.getEstimate(estimateId);
      if (!estimate) return;
      
      await workflowEngine.runWorkflowsByTrigger('estimate_approval', {
        estimateId,
        estimate
      });
    } catch (error) {
      console.error("Error handling estimate approval workflow:", error);
    }
  },
  
  // When contract is signed
  onContractSigned: async (contractId: number) => {
    try {
      const contract = await storage.getContract(contractId);
      if (!contract) return;
      
      await workflowEngine.runWorkflowsByTrigger('contract_signed', {
        contractId,
        contract
      });
    } catch (error) {
      console.error("Error handling contract signed workflow:", error);
    }
  },
  
  // When contact form is submitted
  onContactFormSubmitted: async (submissionId: number) => {
    try {
      const submission = await storage.getContactSubmission(submissionId);
      if (!submission) return;
      
      await workflowEngine.runWorkflowsByTrigger('form_submission', {
        submissionId,
        submission
      });
    } catch (error) {
      console.error("Error handling form submission workflow:", error);
    }
  },
  
  // When lead stage changes
  onLeadStageChanged: async (contactId: number, newStage: string, oldStage: string) => {
    try {
      const contact = await storage.getContact(contactId);
      if (!contact) return;
      
      await workflowEngine.runWorkflowsByTrigger('lead_stage_change', {
        contactId,
        contact,
        newStage,
        oldStage
      }, newStage);
    } catch (error) {
      console.error("Error handling lead stage change workflow:", error);
    }
  },
  
  // When appointment is scheduled
  onAppointmentScheduled: async (appointmentId: number) => {
    try {
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) return;
      
      await workflowEngine.runWorkflowsByTrigger('appointment', {
        appointmentId,
        appointment
      });
    } catch (error) {
      console.error("Error handling appointment workflow:", error);
    }
  }
};