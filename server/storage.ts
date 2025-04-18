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
  automationWorkflows, type AutomationWorkflow, type InsertAutomationWorkflow
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
  createAutomationWorkflow(workflow: InsertAutomationWorkflow): Promise<AutomationWorkflow>;
  updateAutomationWorkflow(id: number, workflow: Partial<InsertAutomationWorkflow>): Promise<AutomationWorkflow | undefined>;
  toggleAutomationWorkflow(id: number, isActive: boolean): Promise<AutomationWorkflow | undefined>;
  deleteAutomationWorkflow(id: number): Promise<void>;
  
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
}

// Use database storage implementation
export const storage = new DatabaseStorage();
