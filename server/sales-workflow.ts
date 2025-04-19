import { Express } from "express";
import { storage } from "./storage";
import { isAdmin } from "./auth";
import { isCustomer } from "./customer-auth";
import { emailService } from "./email-service";
import { 
  insertEstimateSchema, 
  insertContractSchema, 
  insertInvoiceSchema, 
  insertPaymentSchema 
} from "@shared/schema";

export function setupSalesWorkflowRoutes(app: Express) {
  // ESTIMATE ROUTES
  // Admin routes - protected with isAdmin middleware
  app.get("/api/admin/estimates", isAdmin, async (req, res) => {
    try {
      const estimates = await storage.getEstimates();
      res.json(estimates);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/admin/estimates/:id", isAdmin, async (req, res) => {
    try {
      const estimate = await storage.getEstimate(parseInt(req.params.id));
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      console.error("Error fetching estimate:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/estimates", isAdmin, async (req, res) => {
    try {
      console.log("Creating estimate from admin panel:", JSON.stringify(req.body, null, 2));
      
      // Add more detailed error logging for debugging
      try {
        // Check if an estimateNumber field is present - if not, add it
        if (!req.body.estimateNumber) {
          req.body.estimateNumber = await storage.getNextEstimateNumber();
          console.log("Added estimate number:", req.body.estimateNumber);
        }
        
        // If status isn't provided, set it to 'draft'
        if (!req.body.status) {
          req.body.status = 'draft';
          console.log("Set default status to 'draft'");
        }
        
        console.log("Validating data with schema...");
        const validatedData = insertEstimateSchema.parse(req.body);
        console.log("Data validated successfully!");
        
        const estimate = await storage.createEstimate(validatedData);
        console.log("Successfully created estimate:", estimate.id);
        
        // Send email notification to customer if we have customerUserId
        if (estimate.customerUserId) {
          try {
            const customer = await storage.getCustomerUser(estimate.customerUserId);
            if (customer && customer.email) {
              console.log(`Sending notification email to customer ${customer.name} (${customer.email})`);
              
              await emailService.sendCustomEmail({
                to: customer.email,
                subject: `New Estimate Available: ${estimate.title || 'Flooring Estimate'}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New Estimate Available</h2>
                    <p>Dear ${customer.name},</p>
                    <p>A new estimate (#${estimate.estimateNumber}) has been created for you.</p>
                    <p><strong>Amount:</strong> $${estimate.total}</p>
                    <p>You can view your estimate and provide approval through your customer portal.</p>
                    <p><a href="${process.env.APP_URL || 'https://apsflooring.info'}/customer/estimates/${estimate.id}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Estimate</a></p>
                    <p>Thank you for choosing APS Flooring.</p>
                  </div>
                `
              });
              console.log(`Email notification sent successfully to ${customer.email}`);
            }
          } catch (emailError) {
            console.error("Failed to send email notification:", emailError);
            // Continue despite email error
          }
        } else if (estimate.contactId) {
          // If no customer user exists, create one for the contact
          try {
            const contact = await storage.getContact(estimate.contactId);
            
            if (contact && contact.email && !contact.isCustomer) {
              console.log(`Creating customer portal account for contact ${contact.name} (${contact.email})`);
              
              // Generate a temporary password
              const { generatePassword } = require('./customer-auth');
              const tempPassword = generatePassword(10);
              
              // Create customer user
              const customerUser = await storage.createCustomerUser({
                email: contact.email,
                username: contact.email.split('@')[0],
                password: tempPassword,
                name: contact.name,
                phone: contact.phone || null,
                contactId: contact.id
              });
              
              // Update the estimate with the new customerUserId
              await storage.updateEstimate(estimate.id, { customerUserId: customerUser.id });
              
              // Update contact to mark as customer
              await storage.updateContact(contact.id, { isCustomer: true });
              
              console.log(`Customer portal account created with ID ${customerUser.id}`);
              
              // Don't send login credentials yet - we'll do that later
            }
          } catch (customerError) {
            console.error("Failed to create customer portal account:", customerError);
            // Continue despite customer creation error
          }
        }
        
        res.status(201).json(estimate);
      } catch (validationError: any) {
        console.error("Validation error details:", 
          validationError.errors ? JSON.stringify(validationError.errors, null, 2) : validationError);
        
        // Log the expected vs actual shape
        console.error("Schema expects:", Object.keys(insertEstimateSchema.shape || {}).join(", "));
        console.error("Received:", Object.keys(req.body).join(", "));
        
        throw validationError;
      }
    } catch (error: any) {
      console.error("Error creating estimate:", error);
      
      // More detailed error response for debugging
      const errorDetails = error.errors ? error.errors.map((err: any) => ({
        path: err.path?.join('.'),
        message: err.message,
        expected: err.expected,
        received: err.received
      })) : undefined;
      
      res.status(400).json({ 
        error: "Invalid estimate data", 
        message: error.message || "Unknown error",
        details: errorDetails || error.toString()
      });
    }
  });

  app.put("/api/admin/estimates/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEstimateSchema.partial().parse(req.body);
      
      const updated = await storage.updateEstimate(id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating estimate:", error);
      res.status(400).json({ error: "Invalid estimate data" });
    }
  });

  app.delete("/api/admin/estimates/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteEstimate(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting estimate:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/estimates/:id/send", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = await storage.sendEstimate(id);
      
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }

      // Fetch customer info for email
      if (estimate.customerUserId) {
        const customer = await storage.getCustomerUser(estimate.customerUserId);
        if (customer) {
          // Send email to customer
          await emailService.sendCustomEmail({
            to: customer.email,
            subject: `New Estimate: ${estimate.title}`,
            html: `
              <h2>New Estimate Available</h2>
              <p>Dear ${customer.name},</p>
              <p>A new estimate (${estimate.estimateNumber}) is available for your review in your customer portal.</p>
              <p><a href="${process.env.APP_URL || 'https://apsflooring.info'}/customer/auth">View Estimate</a></p>
            `
          });
        }
      }
      
      res.json(estimate);
    } catch (error) {
      console.error("Error sending estimate:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/estimates/:id/convert", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = await storage.getEstimate(id);
      
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      
      if (estimate.status !== "approved") {
        return res.status(400).json({ error: "Only approved estimates can be converted to contracts" });
      }
      
      const contract = await storage.createContractFromEstimate(id);
      if (!contract) {
        return res.status(500).json({ error: "Failed to create contract from estimate" });
      }
      
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error converting estimate to contract:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Customer routes
  app.get("/api/customer/estimates", isCustomer, async (req, res) => {
    try {
      const customerId = req.session.customer?.id;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID not found in session" });
      }
      
      const estimates = await storage.getEstimatesByCustomer(customerId);
      res.json(estimates);
    } catch (error) {
      console.error("Error fetching customer estimates:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/customer/estimates/:id", isCustomer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = await storage.getEstimate(id);
      
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      
      // Check if this estimate belongs to the customer
      const customerId = req.session.customer?.id;
      if (estimate.customerUserId !== customerId) {
        return res.status(403).json({ error: "You don't have access to this estimate" });
      }
      
      // Mark estimate as viewed if it was in 'sent' status
      if (estimate.status === "sent") {
        await storage.markEstimateViewed(id);
      }
      
      res.json(estimate);
    } catch (error) {
      console.error("Error fetching customer estimate:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/customer/estimates/:id/approve", isCustomer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { customerNotes } = req.body;
      
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      
      // Check if this estimate belongs to the customer
      const customerId = req.session.customer?.id;
      if (estimate.customerUserId !== customerId) {
        return res.status(403).json({ error: "You don't have access to this estimate" });
      }
      
      const approvedEstimate = await storage.approveEstimate(id, customerNotes);
      
      // Notify admin via email
      // TODO: Add notification to admin about the approval
      
      // Trigger workflow automation for estimate approval
      try {
        const { workflowEvents } = require('./workflow-automation');
        await workflowEvents.onEstimateApproved(id);
      } catch (error) {
        console.error("Failed to trigger estimate approval workflow:", error);
      }
      
      res.json(approvedEstimate);
    } catch (error) {
      console.error("Error approving estimate:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/customer/estimates/:id/reject", isCustomer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { customerNotes } = req.body;
      
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      
      // Check if this estimate belongs to the customer
      const customerId = req.session.customer?.id;
      if (estimate.customerUserId !== customerId) {
        return res.status(403).json({ error: "You don't have access to this estimate" });
      }
      
      const rejectedEstimate = await storage.rejectEstimate(id, customerNotes);
      
      // Notify admin via email
      // TODO: Add notification to admin about the rejection
      
      res.json(rejectedEstimate);
    } catch (error) {
      console.error("Error rejecting estimate:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // CONTRACT ROUTES
  // Admin routes
  app.get("/api/admin/contracts", isAdmin, async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/admin/contracts/:id", isAdmin, async (req, res) => {
    try {
      const contract = await storage.getContract(parseInt(req.params.id));
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/contracts", isAdmin, async (req, res) => {
    try {
      const validatedData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(validatedData);
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(400).json({ error: "Invalid contract data" });
    }
  });

  app.put("/api/admin/contracts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContractSchema.partial().parse(req.body);
      
      const updated = await storage.updateContract(id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating contract:", error);
      res.status(400).json({ error: "Invalid contract data" });
    }
  });

  app.delete("/api/admin/contracts/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteContract(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting contract:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/contracts/:id/send", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.sendContract(id);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }

      // Fetch customer info for email
      if (contract.customerUserId) {
        const customer = await storage.getCustomerUser(contract.customerUserId);
        if (customer) {
          // Send email to customer
          await emailService.sendCustomEmail({
            to: customer.email,
            subject: `Contract Ready for Signature: ${contract.title}`,
            html: `
              <h2>Contract Ready for Signature</h2>
              <p>Dear ${customer.name},</p>
              <p>A new contract (${contract.contractNumber}) is available for your review and signature in your customer portal.</p>
              <p><a href="${process.env.APP_URL || 'https://apsflooring.info'}/customer/auth">View and Sign Contract</a></p>
            `
          });
        }
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error sending contract:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/contracts/:id/create-invoice", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentScheduleItemId } = req.body;
      
      if (!paymentScheduleItemId) {
        return res.status(400).json({ error: "Payment schedule item ID is required" });
      }
      
      const invoice = await storage.createInvoiceFromContract(id, paymentScheduleItemId);
      if (!invoice) {
        return res.status(404).json({ error: "Contract or payment schedule item not found" });
      }
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice from contract:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Customer routes
  app.get("/api/customer/contracts", isCustomer, async (req, res) => {
    try {
      const customerId = req.session.customer?.id;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID not found in session" });
      }
      
      const contracts = await storage.getContractsByCustomer(customerId);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching customer contracts:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/customer/contracts/:id", isCustomer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getContract(id);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Check if this contract belongs to the customer
      const customerId = req.session.customer?.id;
      if (contract.customerUserId !== customerId) {
        return res.status(403).json({ error: "You don't have access to this contract" });
      }
      
      // Mark contract as viewed if it was in 'sent' status
      if (contract.status === "sent") {
        await storage.markContractViewed(id);
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error fetching customer contract:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/customer/contracts/:id/sign", isCustomer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { signature } = req.body;
      
      if (!signature) {
        return res.status(400).json({ error: "Signature is required" });
      }
      
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Check if this contract belongs to the customer
      const customerId = req.session.customer?.id;
      if (contract.customerUserId !== customerId) {
        return res.status(403).json({ error: "You don't have access to this contract" });
      }
      
      const signedContract = await storage.signContract(id, signature);
      
      // Notify admin via email
      // TODO: Add notification to admin about the signature
      
      // Trigger workflow automation for contract signing
      try {
        const { workflowEvents } = require('./workflow-automation');
        await workflowEvents.onContractSigned(id);
      } catch (error) {
        console.error("Failed to trigger contract signed workflow:", error);
      }
      
      res.json(signedContract);
    } catch (error) {
      console.error("Error signing contract:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // INVOICE ROUTES
  // Admin routes
  app.get("/api/admin/invoices", isAdmin, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/admin/invoices/:id", isAdmin, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(parseInt(req.params.id));
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/invoices", isAdmin, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.put("/api/admin/invoices/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      
      const updated = await storage.updateInvoice(id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.delete("/api/admin/invoices/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteInvoice(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/invoices/:id/send", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.sendInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Fetch customer info for email
      if (invoice.customerUserId) {
        const customer = await storage.getCustomerUser(invoice.customerUserId);
        if (customer) {
          // Send email to customer
          await emailService.sendCustomEmail({
            to: customer.email,
            subject: `New Invoice: ${invoice.title}`,
            html: `
              <h2>New Invoice Available</h2>
              <p>Dear ${customer.name},</p>
              <p>A new invoice (${invoice.invoiceNumber}) is available for your review in your customer portal.</p>
              <p>Amount Due: $${invoice.amountDue}</p>
              <p>Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
              <p><a href="${process.env.APP_URL || 'https://apsflooring.info'}/customer/auth">View Invoice</a></p>
            `
          });
        }
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/invoices/:id/record-payment", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.recordPayment(id, validatedData);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error recording payment:", error);
      res.status(400).json({ error: "Invalid payment data" });
    }
  });

  // Customer routes
  app.get("/api/customer/invoices", isCustomer, async (req, res) => {
    try {
      const customerId = req.session.customer?.id;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID not found in session" });
      }
      
      const invoices = await storage.getInvoicesByCustomer(customerId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/customer/invoices/:id", isCustomer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Check if this invoice belongs to the customer
      const customerId = req.session.customer?.id;
      if (invoice.customerUserId !== customerId) {
        return res.status(403).json({ error: "You don't have access to this invoice" });
      }
      
      // Mark invoice as viewed if it was in 'sent' status
      if (invoice.status === "sent") {
        await storage.markInvoiceViewed(id);
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching customer invoice:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // PAYMENT ROUTES
  // Admin routes
  app.get("/api/admin/payments", isAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/admin/payments/:id", isAdmin, async (req, res) => {
    try {
      const payment = await storage.getPayment(parseInt(req.params.id));
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/payments/:id/send-receipt", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      const updatedPayment = await storage.sendReceipt(id);
      
      // Get invoice and customer info
      const invoice = await storage.getInvoice(payment.invoiceId);
      if (invoice && invoice.customerUserId) {
        const customer = await storage.getCustomerUser(invoice.customerUserId);
        if (customer) {
          // Send receipt email
          await emailService.sendCustomEmail({
            to: customer.email,
            subject: `Payment Receipt for Invoice #${invoice.invoiceNumber}`,
            html: `
              <h2>Payment Receipt</h2>
              <p>Dear ${customer.name},</p>
              <p>Thank you for your payment of $${payment.amount} for invoice #${invoice.invoiceNumber}.</p>
              <p>Payment Date: ${payment.paymentDate.toLocaleDateString()}</p>
              <p>Payment Method: ${payment.paymentMethod}</p>
              <p>Reference: ${payment.paymentReference || 'N/A'}</p>
            `
          });
        }
      }
      
      res.json(updatedPayment);
    } catch (error) {
      console.error("Error sending receipt:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Customer routes
  app.get("/api/customer/payments", isCustomer, async (req, res) => {
    try {
      const customerId = req.session.customer?.id;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID not found in session" });
      }
      
      // First get all invoices for this customer
      const invoices = await storage.getInvoicesByCustomer(customerId);
      const invoiceIds = invoices.map(inv => inv.id);
      
      // Then get all payments for these invoices
      const allPayments = await Promise.all(
        invoiceIds.map(id => storage.getPaymentsByInvoice(id))
      );
      
      // Flatten the array of payment arrays
      const payments = allPayments.flat();
      
      res.json(payments);
    } catch (error) {
      console.error("Error fetching customer payments:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Customer payment creation - for online payments
  app.post("/api/customer/invoices/:id/pay", isCustomer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Check if this invoice belongs to the customer
      const customerId = req.session.customer?.id;
      if (invoice.customerUserId !== customerId) {
        return res.status(403).json({ error: "You don't have access to this invoice" });
      }
      
      // Get payment details from request body
      const { amount, paymentMethod, paymentReference } = req.body;
      
      if (!amount || !paymentMethod) {
        return res.status(400).json({ error: "Amount and payment method are required" });
      }
      
      // Process payment - in a real app, you would integrate with a payment gateway here
      // For now, we'll just record the payment directly
      const payment = await storage.recordPayment(id, {
        invoiceId: id,
        contactId: invoice.contactId,
        amount,
        paymentMethod,
        paymentReference,
        status: "completed"
      });
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(400).json({ error: "Invalid payment data" });
    }
  });
}