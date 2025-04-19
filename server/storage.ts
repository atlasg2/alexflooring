import { 
  users, type User, type InsertUser,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission,
  chatMessages, type ChatMessage, type InsertChatMessage,
  appointments, type Appointment, type InsertAppointment,
  contacts, type Contact, type InsertContact,
  communicationLogs, type CommunicationLog, type InsertCommunicationLog,
  reviews, type Review, type InsertReview,
  emailTemplates, type EmailTemplate, type InsertEmailTemplate,
  smsTemplates, type SmsTemplate, type InsertSmsTemplate,
  automationWorkflows, type AutomationWorkflow, type InsertAutomationWorkflow,
  customerUsers, type CustomerUser, type InsertCustomerUser,
  customerProjects, type CustomerProject, type InsertCustomerProject,
  estimates, type Estimate, type InsertEstimate,
  contracts, type Contract, type InsertContract,
  invoices, type Invoice, type InsertInvoice,
  payments, type Payment, type InsertPayment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql, ilike } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Update the interface with all CRUD methods needed for admin backend
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<Contact | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer portal user methods
  getCustomerUser(id: number): Promise<CustomerUser | undefined>;
  getCustomerUserByEmail(email: string): Promise<CustomerUser | undefined>;
  getCustomerUserByUsername(username: string): Promise<CustomerUser | undefined>;
  getCustomerUsers(): Promise<CustomerUser[]>;
  createCustomerUser(user: InsertCustomerUser): Promise<CustomerUser>;
  updateCustomerUser(id: number, user: Partial<InsertCustomerUser>): Promise<CustomerUser | undefined>;
  deleteCustomerUser(id: number): Promise<void>;
  verifyCustomerUserCredentials(email: string, password: string): Promise<CustomerUser | undefined>;
  updateCustomerLastLogin(id: number): Promise<void>;
  
  // Customer project methods
  getCustomerProjects(customerId: number): Promise<CustomerProject[]>;
  getAllCustomerProjects(): Promise<CustomerProject[]>;
  getAllProjects(): Promise<CustomerProject[]>; // New method for projects page
  getCustomerProject(id: number): Promise<CustomerProject | undefined>;
  createCustomerProject(project: InsertCustomerProject): Promise<CustomerProject>;
  updateCustomerProject(id: number, project: Partial<InsertCustomerProject>): Promise<CustomerProject | undefined>;
  addProjectProgressUpdate(id: number, update: { status: string, note: string, date?: string, images?: string[] }): Promise<CustomerProject | undefined>;
  addProjectDocument(id: number, document: { name: string, url: string, type: string }): Promise<CustomerProject | undefined>;
  
  // Contact management methods
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<void>;
  searchContacts(query: string): Promise<Contact[]>;
  
  // Contact submission methods
  getContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmission(id: number): Promise<ContactSubmission | undefined>;
  updateContactSubmissionStatus(id: number, status: string): Promise<ContactSubmission | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Communication logs methods
  getCommunicationLogs(contactId?: number): Promise<CommunicationLog[]>;
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  
  // Chat message methods
  getChatMessages(): Promise<ChatMessage[]>;
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markChatMessageAsRead(id: number): Promise<void>;
  getUnreadMessageCount(): Promise<number>;
  
  // Appointment methods
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  
  // Review methods
  getReviews(): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReviewStatus(id: number, status: string): Promise<Review | undefined>;
  
  // Email Template methods
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<void>;
  
  // SMS Template methods
  getSmsTemplates(): Promise<SmsTemplate[]>;
  getSmsTemplate(id: number): Promise<SmsTemplate | undefined>;
  createSmsTemplate(template: InsertSmsTemplate): Promise<SmsTemplate>;
  updateSmsTemplate(id: number, template: Partial<InsertSmsTemplate>): Promise<SmsTemplate | undefined>;
  deleteSmsTemplate(id: number): Promise<void>;
  
  // Automation Workflow methods
  getAutomationWorkflows(): Promise<AutomationWorkflow[]>;
  getAutomationWorkflow(id: number): Promise<AutomationWorkflow | undefined>;
  getWorkflowsByTrigger(triggerType: string, condition?: string): Promise<AutomationWorkflow[]>;
  createAutomationWorkflow(workflow: InsertAutomationWorkflow): Promise<AutomationWorkflow>;
  updateAutomationWorkflow(id: number, workflow: Partial<InsertAutomationWorkflow>): Promise<AutomationWorkflow | undefined>;
  toggleAutomationWorkflow(id: number, isActive: boolean): Promise<AutomationWorkflow | undefined>;
  deleteAutomationWorkflow(id: number): Promise<void>;
  
  // Estimate methods
  getEstimates(): Promise<Estimate[]>;
  getEstimate(id: number): Promise<Estimate | undefined>;
  getEstimatesByContact(contactId: number): Promise<Estimate[]>;
  getEstimatesByCustomer(customerUserId: number): Promise<Estimate[]>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  updateEstimate(id: number, estimate: Partial<InsertEstimate>): Promise<Estimate | undefined>;
  deleteEstimate(id: number): Promise<void>;
  sendEstimate(id: number): Promise<Estimate | undefined>;
  markEstimateViewed(id: number): Promise<Estimate | undefined>;
  approveEstimate(id: number, customerNotes?: string): Promise<Estimate | undefined>;
  rejectEstimate(id: number, customerNotes?: string): Promise<Estimate | undefined>;
  getNextEstimateNumber(): Promise<string>;
  
  // Contract methods
  getContracts(): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByContact(contactId: number): Promise<Contract[]>;
  getContractsByCustomer(customerUserId: number): Promise<Contract[]>;
  getContractsByProject(projectId: number): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  createContractFromEstimate(estimateId: number): Promise<Contract | undefined>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: number): Promise<void>;
  sendContract(id: number): Promise<Contract | undefined>;
  markContractViewed(id: number): Promise<Contract | undefined>;
  signContract(id: number, signature: string): Promise<Contract | undefined>;
  getNextContractNumber(): Promise<string>;
  
  // Invoice methods
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByContact(contactId: number): Promise<Invoice[]>;
  getInvoicesByCustomer(customerUserId: number): Promise<Invoice[]>;
  getInvoicesByProject(projectId: number): Promise<Invoice[]>;
  getInvoicesByContract(contractId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  createInvoiceFromContract(contractId: number, paymentScheduleItemId: string): Promise<Invoice | undefined>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<void>;
  sendInvoice(id: number): Promise<Invoice | undefined>;
  markInvoiceViewed(id: number): Promise<Invoice | undefined>;
  recordPayment(id: number, payment: InsertPayment): Promise<Payment>;
  getNextInvoiceNumber(): Promise<string>;
  
  // Payment methods
  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByInvoice(invoiceId: number): Promise<Payment[]>;
  getPaymentsByContact(contactId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  sendReceipt(id: number): Promise<Payment | undefined>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.email, email));
    return contact;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // CUSTOMER USER METHODS
  async getCustomerUser(id: number): Promise<CustomerUser | undefined> {
    const [user] = await db.select().from(customerUsers).where(eq(customerUsers.id, id));
    return user;
  }
  
  async getCustomerUserByEmail(email: string): Promise<CustomerUser | undefined> {
    const [user] = await db.select().from(customerUsers).where(eq(customerUsers.email, email));
    return user;
  }
  
  async getCustomerUserByUsername(username: string): Promise<CustomerUser | undefined> {
    const [user] = await db.select().from(customerUsers).where(eq(customerUsers.username, username));
    return user;
  }
  
  // Get a customer user by contact ID
  async getCustomerUserByContactId(contactId: number): Promise<CustomerUser | undefined> {
    try {
      const [user] = await db.select().from(customerUsers).where(eq(customerUsers.contactId, contactId));
      return user;
    } catch (error) {
      console.error("Error getting customer by contact ID:", error);
      return undefined;
    }
  }
  
  async getCustomerUsers(): Promise<CustomerUser[]> {
    return await db.select().from(customerUsers).orderBy(desc(customerUsers.createdAt));
  }
  
  async createCustomerUser(user: InsertCustomerUser): Promise<CustomerUser> {
    const [result] = await db.insert(customerUsers).values(user).returning();
    return result;
  }
  
  async deleteCustomerUser(id: number): Promise<void> {
    await db.delete(customerUsers).where(eq(customerUsers.id, id));
  }
  
  async updateCustomerUser(id: number, userData: Partial<InsertCustomerUser>): Promise<CustomerUser | undefined> {
    const [updated] = await db
      .update(customerUsers)
      .set(userData)
      .where(eq(customerUsers.id, id))
      .returning();
    return updated;
  }
  
  async verifyCustomerUserCredentials(email: string, password: string): Promise<CustomerUser | undefined> {
    const [user] = await db.select().from(customerUsers).where(eq(customerUsers.email, email));
    
    if (user) {
      // In a real app, we'd verify hashed passwords, but for simplicity here we'll just check plaintext
      // Note: In production, use proper password hashing like bcrypt
      if (user.password === password) {
        return user;
      }
    }
    
    return undefined;
  }
  
  async updateCustomerLastLogin(id: number): Promise<void> {
    await db
      .update(customerUsers)
      .set({ lastLogin: new Date() })
      .where(eq(customerUsers.id, id));
  }
  
  // CUSTOMER PROJECT METHODS
  async getCustomerProjects(customerId: number): Promise<CustomerProject[]> {
    return await db
      .select()
      .from(customerProjects)
      .where(eq(customerProjects.customerId, customerId))
      .orderBy(desc(customerProjects.updatedAt));
  }
  
  async getAllCustomerProjects(): Promise<CustomerProject[]> {
    return await db
      .select()
      .from(customerProjects)
      .orderBy(desc(customerProjects.updatedAt));
  }
  
  // Alias for the project management module - the same as getAllCustomerProjects
  async getAllProjects(): Promise<CustomerProject[]> {
    return await db
      .select()
      .from(customerProjects)
      .orderBy(desc(customerProjects.updatedAt));
  }
  
  async getCustomerProject(id: number): Promise<CustomerProject | undefined> {
    const [project] = await db
      .select()
      .from(customerProjects)
      .where(eq(customerProjects.id, id));
    return project;
  }
  
  async createCustomerProject(project: InsertCustomerProject): Promise<CustomerProject> {
    const [result] = await db
      .insert(customerProjects)
      .values(project)
      .returning();
    return result;
  }
  
  async updateCustomerProject(id: number, projectData: Partial<InsertCustomerProject>): Promise<CustomerProject | undefined> {
    const [updated] = await db
      .update(customerProjects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(customerProjects.id, id))
      .returning();
    return updated;
  }
  
  async addProjectProgressUpdate(id: number, update: { status: string, note: string, date?: string, images?: string[] }): Promise<CustomerProject | undefined> {
    // First get the existing project
    const [project] = await db
      .select()
      .from(customerProjects)
      .where(eq(customerProjects.id, id));
    
    if (!project) return undefined;
    
    // Format the update with current date if not provided
    const progressUpdate = {
      date: update.date || new Date().toISOString(),
      status: update.status,
      note: update.note,
      images: update.images || []
    };
    
    // Prepare the existing updates or create a new array
    const existingUpdates = project.progressUpdates || [];
    const newUpdates = [...existingUpdates, progressUpdate];
    
    // Update the project with the new progress update
    const [updated] = await db
      .update(customerProjects)
      .set({ 
        progressUpdates: newUpdates, 
        status: update.status, // Also update the main project status
        updatedAt: new Date() 
      })
      .where(eq(customerProjects.id, id))
      .returning();
    
    return updated;
  }
  
  async addProjectDocument(id: number, document: { name: string, url: string, type: string }): Promise<CustomerProject | undefined> {
    // First get the existing project
    const [project] = await db
      .select()
      .from(customerProjects)
      .where(eq(customerProjects.id, id));
    
    if (!project) return undefined;
    
    // Format the document with current date
    const documentWithDate = {
      ...document,
      uploadDate: new Date().toISOString()
    };
    
    // Prepare the existing documents or create a new array
    const existingDocs = project.documents || [];
    const newDocs = [...existingDocs, documentWithDate];
    
    // Update the project with the new document
    const [updated] = await db
      .update(customerProjects)
      .set({ 
        documents: newDocs, 
        updatedAt: new Date() 
      })
      .where(eq(customerProjects.id, id))
      .returning();
    
    return updated;
  }
  
  // CONTACT MANAGEMENT METHODS
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const [result] = await db.insert(contacts).values(contact).returning();
    return result;
  }
  
  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const [updated] = await db
      .update(contacts)
      .set({ ...contact, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return updated;
  }
  
  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }
  
  async searchContacts(query: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(
        sql`${contacts.name} ILIKE ${`%${query}%`} OR 
            ${contacts.email} ILIKE ${`%${query}%`} OR
            ${contacts.phone} ILIKE ${`%${query}%`} OR
            ${contacts.company} ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(contacts.createdAt));
  }
  
  // CONTACT SUBMISSION METHODS
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }
  
  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    const [submission] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
    return submission;
  }
  
  async updateContactSubmissionStatus(id: number, status: string): Promise<ContactSubmission | undefined> {
    const [updated] = await db
      .update(contactSubmissions)
      .set({ status })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return updated;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    console.log('Creating contact submission:', JSON.stringify(submission, null, 2));
    
    // Ensure consistent handling of the type field
    if (!submission.type) {
      submission.type = 'contact';
    }
    
    // Ensure we have a status
    if (!submission.status) {
      submission.status = 'new';
    }
    
    // Create or find an existing contact if this is from the chat widget
    let contactId: number | null = null;
    
    if (submission.type === 'chat' && submission.email) {
      console.log('Processing chat message, attempting to create or find contact for:', submission.email);
      
      // Try to find an existing contact with this email
      const [existingContact] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.email, submission.email));
      
      if (existingContact) {
        console.log('Found existing contact with ID:', existingContact.id);
        contactId = existingContact.id;
      } else {
        // Create a new contact
        try {
          console.log('Creating new contact from chat message');
          const contactData = {
            name: submission.name || 'Unknown',
            email: submission.email,
            phone: submission.phone || null,
            source: 'chat',
            notes: `Initial contact via chat widget: ${submission.message}`,
            leadStage: 'new'
          };
          console.log('New contact data:', JSON.stringify(contactData, null, 2));
          
          const [newContact] = await db.insert(contacts).values(contactData).returning();
          console.log('Successfully created new contact with ID:', newContact.id);
          
          contactId = newContact.id;
        } catch (error) {
          console.error('Error creating contact from chat:', error);
        }
      }
    }
    
    // Create the contact submission with the contact ID if available
    console.log('Creating contact submission with contactId:', contactId);
    
    const submissionData = {
      name: submission.name,
      email: submission.email,
      phone: submission.phone || null,
      message: submission.message,
      service: submission.service || null,
      type: submission.type,
      status: submission.status,
      smsOptIn: submission.smsOptIn || false,
      contactId: contactId
    };
    
    console.log('Submission data:', JSON.stringify(submissionData, null, 2));
    
    const [result] = await db.insert(contactSubmissions).values(submissionData).returning();
    
    console.log('Successfully created contact submission with ID:', result.id);
    return result;
  }
  
  // COMMUNICATION LOGS METHODS
  async getCommunicationLogs(contactId?: number): Promise<CommunicationLog[]> {
    if (contactId) {
      return await db
        .select()
        .from(communicationLogs)
        .where(eq(communicationLogs.contactId, contactId))
        .orderBy(desc(communicationLogs.createdAt));
    } else {
      return await db
        .select()
        .from(communicationLogs)
        .orderBy(desc(communicationLogs.createdAt));
    }
  }
  
  async createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog> {
    const [result] = await db.insert(communicationLogs).values(log).returning();
    return result;
  }
  
  // CHAT MESSAGE METHODS
  async getChatMessages(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
  }
  
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message;
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [result] = await db.insert(chatMessages).values(message).returning();
    return result;
  }
  
  async markChatMessageAsRead(id: number): Promise<void> {
    await db.update(chatMessages).set({ isRead: true }).where(eq(chatMessages.id, id));
  }
  
  async getUnreadMessageCount(): Promise<number> {
    // Count unread chat messages (legacy method)
    const chatResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(eq(chatMessages.isRead, false));
    
    // Count new contact submissions of type 'chat'
    const contactResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactSubmissions)
      .where(
        and(
          eq(contactSubmissions.type, 'chat'),
          eq(contactSubmissions.status, 'new')
        )
      );
    
    // Combine both counts
    return chatResult[0].count + contactResult[0].count;
  }
  
  // APPOINTMENT METHODS
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.date));
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [result] = await db.insert(appointments).values(appointment).returning();
    return result;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }
  
  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    // Format date to ISO string and extract just the date part (YYYY-MM-DD)
    const dateStr = date.toISOString().split('T')[0];
    
    return await db
      .select()
      .from(appointments)
      .where(sql`${appointments.date}::text = ${dateStr}`)
      .orderBy(appointments.startTime);
  }
  
  // REVIEW METHODS
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }
  
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    return result;
  }
  
  async updateReviewStatus(id: number, status: string): Promise<Review | undefined> {
    const [updated] = await db
      .update(reviews)
      .set({ status })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }
  
  // EMAIL TEMPLATE METHODS
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(emailTemplates.name);
  }
  
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }
  
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    // Make sure HTML content is copied to body field if not provided
    if (!template.body && template.htmlContent) {
      template.body = template.htmlContent;
    }
    
    // Ensure isActive is set to true if not specified
    if (template.isActive === undefined) {
      template.isActive = true;
    }
    
    const [result] = await db.insert(emailTemplates).values(template).returning();
    return result;
  }
  
  async updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    // If HTML content is updated but body isn't, update body too
    if (template.htmlContent && !template.body) {
      template.body = template.htmlContent;
    }
    
    const [updated] = await db
      .update(emailTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updated;
  }
  
  async deleteEmailTemplate(id: number): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }
  
  // SMS TEMPLATE METHODS
  async getSmsTemplates(): Promise<SmsTemplate[]> {
    return await db.select().from(smsTemplates).orderBy(smsTemplates.name);
  }
  
  async getSmsTemplate(id: number): Promise<SmsTemplate | undefined> {
    const [template] = await db.select().from(smsTemplates).where(eq(smsTemplates.id, id));
    return template;
  }
  
  async createSmsTemplate(template: InsertSmsTemplate): Promise<SmsTemplate> {
    // Ensure isActive is set to true if not specified
    if (template.isActive === undefined) {
      template.isActive = true;
    }
    
    const [result] = await db.insert(smsTemplates).values(template).returning();
    return result;
  }
  
  async updateSmsTemplate(id: number, template: Partial<InsertSmsTemplate>): Promise<SmsTemplate | undefined> {
    const [updated] = await db
      .update(smsTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(smsTemplates.id, id))
      .returning();
    return updated;
  }
  
  async deleteSmsTemplate(id: number): Promise<void> {
    await db.delete(smsTemplates).where(eq(smsTemplates.id, id));
  }
  
  // AUTOMATION WORKFLOW METHODS
  async getAutomationWorkflows(): Promise<AutomationWorkflow[]> {
    return await db.select().from(automationWorkflows).orderBy(automationWorkflows.name);
  }
  
  async getAutomationWorkflow(id: number): Promise<AutomationWorkflow | undefined> {
    const [workflow] = await db.select().from(automationWorkflows).where(eq(automationWorkflows.id, id));
    return workflow;
  }
  
  // Get workflows by trigger type and condition
  async getWorkflowsByTrigger(triggerType: string, condition?: string): Promise<AutomationWorkflow[]> {
    try {
      if (condition) {
        return await db.select().from(automationWorkflows)
          .where(and(
            eq(automationWorkflows.triggerType, triggerType),
            eq(automationWorkflows.triggerCondition, condition),
            eq(automationWorkflows.isActive, true)
          ));
      } else {
        return await db.select().from(automationWorkflows)
          .where(and(
            eq(automationWorkflows.triggerType, triggerType),
            eq(automationWorkflows.isActive, true)
          ));
      }
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }
  
  async createAutomationWorkflow(workflow: InsertAutomationWorkflow): Promise<AutomationWorkflow> {
    // Set default values if not provided
    if (workflow.triggerType === undefined) {
      workflow.triggerType = 'manual';
    }
    
    // For legacy compatibility if not provided
    if (workflow.trigger === undefined) {
      workflow.trigger = workflow.triggerType;
    }
    
    // For legacy compatibility if not provided
    if (workflow.actions === undefined) {
      workflow.actions = {
        emailTemplateId: workflow.emailTemplateId,
        smsTemplateId: workflow.smsTemplateId,
        delay: workflow.delay
      };
    }
    
    // Ensure isActive is set to true if not specified
    if (workflow.isActive === undefined) {
      workflow.isActive = true;
    }
    
    const [result] = await db.insert(automationWorkflows).values(workflow).returning();
    return result;
  }
  
  async updateAutomationWorkflow(id: number, workflow: Partial<InsertAutomationWorkflow>): Promise<AutomationWorkflow | undefined> {
    // If trigger type changes, update legacy trigger field too
    if (workflow.triggerType && !workflow.trigger) {
      workflow.trigger = workflow.triggerType;
    }
    
    // If any of the specific fields change, update the actions JSON too
    if (workflow.emailTemplateId !== undefined || workflow.smsTemplateId !== undefined || workflow.delay !== undefined) {
      const currentWorkflow = await this.getAutomationWorkflow(id);
      if (currentWorkflow) {
        const currentActions = currentWorkflow.actions || {};
        workflow.actions = {
          ...currentActions,
          emailTemplateId: workflow.emailTemplateId !== undefined ? workflow.emailTemplateId : currentWorkflow.emailTemplateId,
          smsTemplateId: workflow.smsTemplateId !== undefined ? workflow.smsTemplateId : currentWorkflow.smsTemplateId,
          delay: workflow.delay !== undefined ? workflow.delay : currentWorkflow.delay
        };
      }
    }
    
    const [updated] = await db
      .update(automationWorkflows)
      .set({ ...workflow, updatedAt: new Date() })
      .where(eq(automationWorkflows.id, id))
      .returning();
    return updated;
  }
  
  async toggleAutomationWorkflow(id: number, isActive: boolean): Promise<AutomationWorkflow | undefined> {
    const [updated] = await db
      .update(automationWorkflows)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(automationWorkflows.id, id))
      .returning();
    return updated;
  }
  
  async deleteAutomationWorkflow(id: number): Promise<void> {
    await db.delete(automationWorkflows).where(eq(automationWorkflows.id, id));
  }
  
  // ESTIMATE METHODS
  async getEstimates(): Promise<Estimate[]> {
    return await db.select().from(estimates).orderBy(desc(estimates.createdAt));
  }
  
  async getEstimate(id: number): Promise<Estimate | undefined> {
    const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id));
    return estimate;
  }
  
  async getEstimatesByContact(contactId: number): Promise<Estimate[]> {
    return await db.select().from(estimates)
      .where(eq(estimates.contactId, contactId))
      .orderBy(desc(estimates.createdAt));
  }
  
  async getEstimatesByCustomer(customerUserId: number): Promise<Estimate[]> {
    return await db.select().from(estimates)
      .where(eq(estimates.customerUserId, customerUserId))
      .orderBy(desc(estimates.createdAt));
  }
  
  async createEstimate(estimate: InsertEstimate): Promise<Estimate> {
    try {
      console.log("Creating estimate with data:", JSON.stringify(estimate, null, 2));
      
      // Generate estimate number if not provided
      if (!estimate.estimateNumber) {
        estimate.estimateNumber = await this.getNextEstimateNumber();
        console.log("Using estimate number:", estimate.estimateNumber);
      }
      
      // Set default status if not provided
      if (!estimate.status) {
        estimate.status = 'draft';
        console.log("Setting default status to 'draft'");
      }
      
      // Lookup customer user ID from contact ID if not provided
      if (estimate.contactId && !estimate.customerUserId) {
        try {
          const contact = await db.select().from(contacts)
            .where(eq(contacts.id, estimate.contactId)).limit(1);
          
          if (contact.length > 0 && contact[0].isCustomer) {
            // Find customer user associated with this contact
            const customerUser = await db.select().from(customerUsers)
              .where(eq(customerUsers.contactId, estimate.contactId)).limit(1);
            
            if (customerUser.length > 0) {
              estimate.customerUserId = customerUser[0].id;
              console.log(`Found customer user ID ${estimate.customerUserId} for contact ${estimate.contactId}`);
            }
          }
        } catch (err) {
          console.error("Error looking up customer user ID:", err);
        }
      }
      
      // Make sure lineItems is properly formatted as JSON
      if (estimate.lineItems && typeof estimate.lineItems === 'string') {
        try {
          estimate.lineItems = JSON.parse(estimate.lineItems);
        } catch (e) {
          console.error("Error parsing lineItems string:", e);
        }
      }
      
      // Ensure lineItems is an array
      if (!Array.isArray(estimate.lineItems)) {
        console.warn("lineItems is not an array, setting to empty array");
        estimate.lineItems = [];
      }
      
      // Log the data we're about to insert
      console.log("Final estimate data to insert:", {
        ...estimate, 
        lineItems: Array.isArray(estimate.lineItems) ? `Array of ${estimate.lineItems.length} items` : estimate.lineItems
      });
      
      const [result] = await db.insert(estimates).values(estimate).returning();
      console.log("Estimate created successfully with ID:", result.id);
      
      // Check if we need to trigger workflow for new estimate
      if (result) {
        try {
          // Import here to avoid circular dependency
          const { workflowEvents } = await import("./workflow-automation");
          // Trigger the workflow for a new estimate
          await workflowEvents.onEstimateCreated(result.id);
          console.log("Triggered estimate creation workflow for estimate ID:", result.id);
        } catch (err) {
          console.error("Error triggering estimate creation workflow:", err);
          // Don't block the estimate creation if workflow fails
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error in createEstimate:", error);
      throw error;
    }
  }
  
  async updateEstimate(id: number, estimateData: Partial<InsertEstimate>): Promise<Estimate | undefined> {
    const [updated] = await db
      .update(estimates)
      .set({ ...estimateData, updatedAt: new Date() })
      .where(eq(estimates.id, id))
      .returning();
    return updated;
  }
  
  async deleteEstimate(id: number): Promise<void> {
    await db.delete(estimates).where(eq(estimates.id, id));
  }
  
  async sendEstimate(id: number): Promise<Estimate | undefined> {
    const [updated] = await db
      .update(estimates)
      .set({ 
        status: "sent", 
        sentAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(estimates.id, id))
      .returning();
    
    // TODO: Send email notification to customer
    
    return updated;
  }
  
  async markEstimateViewed(id: number): Promise<Estimate | undefined> {
    const [updated] = await db
      .update(estimates)
      .set({ 
        status: "viewed", 
        viewedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(estimates.id, id))
      .returning();
    
    return updated;
  }
  
  async approveEstimate(id: number, customerNotes?: string): Promise<Estimate | undefined> {
    const [updated] = await db
      .update(estimates)
      .set({ 
        status: "approved", 
        approvedAt: new Date(),
        customerNotes: customerNotes || null,
        updatedAt: new Date() 
      })
      .where(eq(estimates.id, id))
      .returning();
    
    // TODO: Send email notification to admin
    
    return updated;
  }
  
  async rejectEstimate(id: number, customerNotes?: string): Promise<Estimate | undefined> {
    const [updated] = await db
      .update(estimates)
      .set({ 
        status: "rejected", 
        rejectedAt: new Date(),
        customerNotes: customerNotes || null,
        updatedAt: new Date() 
      })
      .where(eq(estimates.id, id))
      .returning();
    
    // TODO: Send email notification to admin
    
    return updated;
  }
  
  async getNextEstimateNumber(): Promise<string> {
    try {
      console.log("Generating next estimate number");
      // First try to get the highest estimate number from the database
      const [result] = await db
        .select({ maxEstimateNumber: sql<string>`MAX(${estimates.estimateNumber})` })
        .from(estimates);
      
      const currentYear = new Date().getFullYear();
      let nextNumber = 1;
      
      if (result?.maxEstimateNumber) {
        // Extract the number part if it follows our format (EST-YYYY-XXXX)
        const match = result.maxEstimateNumber.match(/EST-\d{4}-(\d+)/);
        if (match && match[1]) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      
      // Format: EST-YYYY-XXXX (e.g., EST-2025-0001)
      const estimateNumber = `EST-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
      console.log("Generated estimate number:", estimateNumber);
      return estimateNumber;
    } catch (error) {
      console.error("Error generating estimate number:", error);
      // Return a fallback estimate number if there's an error
      const today = new Date();
      const timestamp = Math.floor(today.getTime() / 1000);
      return `EST-${timestamp}`;
    }
  }
  
  // CONTRACT METHODS
  async getContracts(): Promise<Contract[]> {
    return await db.select().from(contracts).orderBy(desc(contracts.createdAt));
  }
  
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }
  
  async getContractsByContact(contactId: number): Promise<Contract[]> {
    return await db.select().from(contracts)
      .where(eq(contracts.contactId, contactId))
      .orderBy(desc(contracts.createdAt));
  }
  
  async getContractsByCustomer(customerUserId: number): Promise<Contract[]> {
    return await db.select().from(contracts)
      .where(eq(contracts.customerUserId, customerUserId))
      .orderBy(desc(contracts.createdAt));
  }
  
  async getContractsByProject(projectId: number): Promise<Contract[]> {
    return await db.select().from(contracts)
      .where(eq(contracts.projectId, projectId))
      .orderBy(desc(contracts.createdAt));
  }
  
  async createContract(contract: InsertContract): Promise<Contract> {
    // Generate contract number if not provided
    if (!contract.contractNumber) {
      contract.contractNumber = await this.getNextContractNumber();
    }
    
    const [result] = await db.insert(contracts).values(contract).returning();
    return result;
  }
  
  async createContractFromEstimate(estimateId: number): Promise<Contract | undefined> {
    // First get the estimate
    const estimate = await this.getEstimate(estimateId);
    if (!estimate) return undefined;
    
    // Generate a new contract from the estimate data
    const contractData: InsertContract = {
      contractNumber: await this.getNextContractNumber(),
      estimateId: estimate.id,
      contactId: estimate.contactId,
      customerUserId: estimate.customerUserId,
      title: `Contract for ${estimate.title}`,
      description: estimate.description,
      status: "draft",
      amount: estimate.total,
      startDate: new Date(),
      paymentTerms: "Net 30",
      contractBody: `This contract is based on estimate ${estimate.estimateNumber}: ${estimate.title}\n\n${estimate.termsAndConditions || ''}`,
      createdBy: estimate.createdBy,
    };
    
    // Generate payment schedule based on the estimate amount
    const totalAmount = parseFloat(estimate.total);
    const depositAmount = (totalAmount * 0.25).toFixed(2); // 25% deposit
    const finalAmount = (totalAmount * 0.75).toFixed(2); // 75% upon completion
    
    contractData.paymentSchedule = [
      {
        id: "deposit",
        description: "Initial Deposit",
        amount: depositAmount,
        dueDate: new Date().toISOString(), // Due immediately
        status: "scheduled"
      },
      {
        id: "final",
        description: "Final Payment",
        amount: finalAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Due in 30 days
        status: "scheduled"
      }
    ];
    
    const contract = await this.createContract(contractData);
    
    // Update the estimate status to converted
    await this.updateEstimate(estimateId, { status: "converted" });
    
    return contract;
  }
  
  async updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract | undefined> {
    const [updated] = await db
      .update(contracts)
      .set({ ...contractData, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updated;
  }
  
  async deleteContract(id: number): Promise<void> {
    await db.delete(contracts).where(eq(contracts.id, id));
  }
  
  async sendContract(id: number): Promise<Contract | undefined> {
    const [updated] = await db
      .update(contracts)
      .set({ 
        status: "sent", 
        sentAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(contracts.id, id))
      .returning();
    
    // TODO: Send email notification to customer
    
    return updated;
  }
  
  async markContractViewed(id: number): Promise<Contract | undefined> {
    const [updated] = await db
      .update(contracts)
      .set({ 
        status: "viewed", 
        viewedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return updated;
  }
  
  async signContract(id: number, signature: string): Promise<Contract | undefined> {
    const [updated] = await db
      .update(contracts)
      .set({ 
        status: "signed", 
        customerSignature: signature,
        customerSignedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(contracts.id, id))
      .returning();
    
    // If contract was signed and has a project ID, update the project status
    if (updated && updated.projectId) {
      await this.updateCustomerProject(updated.projectId, { status: "in_progress" });
    }
    // If contract was signed but doesn't have a project, create one
    else if (updated && updated.contactId && updated.customerUserId) {
      // Create a new project from the contract
      const projectData: InsertCustomerProject = {
        customerId: updated.customerUserId,
        contactId: updated.contactId,
        title: `Project for ${updated.title}`,
        description: updated.description,
        status: "in_progress",
        startDate: updated.startDate || new Date(),
        estimatedCost: updated.amount,
        notes: `Based on contract ${updated.contractNumber}`,
      };
      
      const project = await this.createCustomerProject(projectData);
      
      // Update the contract with the new project ID
      await this.updateContract(id, { projectId: project.id });
    }
    
    // TODO: Send email notification to admin and create first invoice
    
    return updated;
  }
  
  async getNextContractNumber(): Promise<string> {
    // First try to get the highest contract number from the database
    const [result] = await db
      .select({ maxContractNumber: sql<string>`MAX(${contracts.contractNumber})` })
      .from(contracts);
    
    const currentYear = new Date().getFullYear();
    let nextNumber = 1;
    
    if (result?.maxContractNumber) {
      // Extract the number part if it follows our format (CTR-YYYY-XXXX)
      const match = result.maxContractNumber.match(/CTR-\d{4}-(\d+)/);
      if (match && match[1]) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    // Format: CTR-YYYY-XXXX (e.g., CTR-2025-0001)
    return `CTR-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
  }
  
  // INVOICE METHODS
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }
  
  async getInvoicesByContact(contactId: number): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .where(eq(invoices.contactId, contactId))
      .orderBy(desc(invoices.createdAt));
  }
  
  async getInvoicesByCustomer(customerUserId: number): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .where(eq(invoices.customerUserId, customerUserId))
      .orderBy(desc(invoices.createdAt));
  }
  
  async getInvoicesByProject(projectId: number): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .where(eq(invoices.projectId, projectId))
      .orderBy(desc(invoices.createdAt));
  }
  
  async getInvoicesByContract(contractId: number): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .where(eq(invoices.contractId, contractId))
      .orderBy(desc(invoices.createdAt));
  }
  
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    // Generate invoice number if not provided
    if (!invoice.invoiceNumber) {
      invoice.invoiceNumber = await this.getNextInvoiceNumber();
    }
    
    // Set due date if not provided (default 30 days from now)
    if (!invoice.dueDate) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      invoice.dueDate = dueDate;
    }
    
    // Set amount due to equal total if not provided
    if (!invoice.amountDue) {
      invoice.amountDue = invoice.total;
    }
    
    const [result] = await db.insert(invoices).values(invoice).returning();
    return result;
  }
  
  async createInvoiceFromContract(contractId: number, paymentScheduleItemId: string): Promise<Invoice | undefined> {
    // First get the contract
    const contract = await this.getContract(contractId);
    if (!contract || !contract.paymentSchedule) return undefined;
    
    // Find the specific payment schedule item
    const paymentItem = contract.paymentSchedule.find(item => item.id === paymentScheduleItemId);
    if (!paymentItem) return undefined;
    
    // Generate a new invoice from the contract data and payment item
    const invoiceData: InsertInvoice = {
      invoiceNumber: await this.getNextInvoiceNumber(),
      contactId: contract.contactId,
      customerUserId: contract.customerUserId,
      projectId: contract.projectId,
      contractId: contract.id,
      title: `Invoice for ${paymentItem.description}`,
      description: `Payment for "${contract.title}" - ${paymentItem.description}`,
      status: "draft",
      subtotal: paymentItem.amount,
      total: paymentItem.amount,
      amountDue: paymentItem.amount,
      dueDate: new Date(paymentItem.dueDate),
      paymentTerms: contract.paymentTerms || "Net 30",
      createdBy: contract.createdBy,
      lineItems: [
        {
          id: "1",
          description: paymentItem.description,
          quantity: 1,
          unit: "each",
          unitPrice: paymentItem.amount,
          totalPrice: paymentItem.amount
        }
      ]
    };
    
    const invoice = await this.createInvoice(invoiceData);
    
    // Update the payment schedule item status to invoiced
    const updatedSchedule = [...contract.paymentSchedule];
    const itemIndex = updatedSchedule.findIndex(item => item.id === paymentScheduleItemId);
    if (itemIndex >= 0) {
      updatedSchedule[itemIndex] = {
        ...updatedSchedule[itemIndex],
        status: "invoiced"
      };
      
      await this.updateContract(contractId, { paymentSchedule: updatedSchedule });
    }
    
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(invoices)
      .set({ ...invoiceData, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }
  
  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }
  
  async sendInvoice(id: number): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(invoices)
      .set({ 
        status: "sent", 
        sentAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(invoices.id, id))
      .returning();
    
    // TODO: Send email notification to customer
    
    return updated;
  }
  
  async markInvoiceViewed(id: number): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(invoices)
      .set({ 
        status: "viewed", 
        viewedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(invoices.id, id))
      .returning();
    
    return updated;
  }
  
  async recordPayment(invoiceId: number, payment: InsertPayment): Promise<Payment> {
    // Get the current invoice
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    // Add the payment
    const [newPayment] = await db.insert(payments).values({
      ...payment,
      invoiceId
    }).returning();
    
    // Update the invoice with payment info
    const amountPaid = (parseFloat(invoice.amountPaid || "0") + parseFloat(payment.amount)).toString();
    const amountDue = (parseFloat(invoice.total) - parseFloat(amountPaid)).toString();
    
    // Determine new status
    let status = invoice.status;
    if (parseFloat(amountDue) <= 0) {
      status = "paid";
    } else if (parseFloat(amountPaid) > 0) {
      status = "partially_paid";
    }
    
    // Update the invoice
    await this.updateInvoice(invoiceId, {
      amountPaid,
      amountDue,
      status,
      paidAt: parseFloat(amountDue) <= 0 ? new Date() : undefined,
      paymentMethod: payment.paymentMethod,
      paymentReference: payment.paymentReference
    });
    
    // If this is related to a contract, update the payment schedule
    if (invoice.contractId) {
      const contract = await this.getContract(invoice.contractId);
      if (contract && contract.paymentSchedule) {
        // Find the matching payment item (by matching amount)
        const updatedSchedule = [...contract.paymentSchedule];
        const paymentItemIndex = updatedSchedule.findIndex(item => 
          parseFloat(item.amount) === parseFloat(invoice.total)
        );
        
        if (paymentItemIndex >= 0) {
          updatedSchedule[paymentItemIndex] = {
            ...updatedSchedule[paymentItemIndex],
            status: parseFloat(amountDue) <= 0 ? "paid" : "invoiced"
          };
          
          await this.updateContract(invoice.contractId, { paymentSchedule: updatedSchedule });
        }
      }
    }
    
    return newPayment;
  }
  
  async getNextInvoiceNumber(): Promise<string> {
    // First try to get the highest invoice number from the database
    const [result] = await db
      .select({ maxInvoiceNumber: sql<string>`MAX(${invoices.invoiceNumber})` })
      .from(invoices);
    
    const currentYear = new Date().getFullYear();
    let nextNumber = 1;
    
    if (result?.maxInvoiceNumber) {
      // Extract the number part if it follows our format (INV-YYYY-XXXX)
      const match = result.maxInvoiceNumber.match(/INV-\d{4}-(\d+)/);
      if (match && match[1]) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    // Format: INV-YYYY-XXXX (e.g., INV-2025-0001)
    return `INV-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
  }
  
  // PAYMENT METHODS
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.paymentDate));
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  
  async getPaymentsByInvoice(invoiceId: number): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.paymentDate));
  }
  
  async getPaymentsByContact(contactId: number): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.contactId, contactId))
      .orderBy(desc(payments.paymentDate));
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [result] = await db.insert(payments).values(payment).returning();
    
    // Also update the corresponding invoice
    await this.recordPayment(payment.invoiceId, payment);
    
    return result;
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updated] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }
  
  async sendReceipt(id: number): Promise<Payment | undefined> {
    const [updated] = await db
      .update(payments)
      .set({ receiptSent: true })
      .where(eq(payments.id, id))
      .returning();
    
    // TODO: Send receipt email
    
    return updated;
  }
}

// Use database storage implementation
export const storage = new DatabaseStorage();
