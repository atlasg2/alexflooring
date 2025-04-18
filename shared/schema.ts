import { pgTable, text, serial, integer, boolean, timestamp, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with admin role 
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

// Customer portal users
export const customerUsers = pgTable("customer_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  contactId: integer("contact_id").references(() => contacts.id),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerUserSchema = createInsertSchema(customerUsers).pick({
  email: true,
  username: true,
  password: true,
  name: true,
  phone: true,
  contactId: true,
});

// Contact management - expanded from just form submissions to handle manual entries
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  source: text("source").default("manual").notNull(), // manual, form, import, etc.
  leadStage: text("lead_stage").default("new").notNull(), // new, contacted, qualified, proposal, won, lost
  leadScore: integer("lead_score").default(0),
  assignedTo: text("assigned_to"),
  lastContactedDate: timestamp("last_contacted_date"),
  preferredContact: text("preferred_contact").default("email"), // email, phone, text
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  notes: text("notes"),
  tags: text("tags").array(),
  customFields: json("custom_fields").$type<Record<string, string>>(),
  isCustomer: boolean("is_customer").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Contact form submissions - links to contacts
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"), // Made nullable for chat messages
  message: text("message").notNull(),
  service: text("service"),
  status: text("status").default("new").notNull(), // new, contacted, scheduled, completed
  type: text("type").default("contact").notNull(), // contact, quote, chat
  smsOptIn: boolean("sms_opt_in").default(false),
  contactId: integer("contact_id").references(() => contacts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions)
  .pick({
    name: true,
    email: true,
    phone: true,
    message: true,
    service: true,
    type: true,
    status: true,
    contactId: true,
    smsOptIn: true,
  })
  .partial({
    phone: true, // Make phone optional for chat messages
    contactId: true, // Make contactId optional
    smsOptIn: true, // Make SMS opt-in optional
  });

// Communication logs - track all emails, calls, texts
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  type: text("type").notNull(), // email, sms, call, note
  direction: text("direction").notNull(), // inbound, outbound
  subject: text("subject"),
  content: text("content").notNull(),
  status: text("status").default("sent").notNull(), // sent, delivered, failed, etc.
  sentBy: text("sent_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  createdAt: true
});

// Chat messages from the widget
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  message: text("message").notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  name: true,
  email: true,
  message: true,
});

// Appointments/schedule
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(), 
  endTime: text("end_time"),
  status: text("status").default("scheduled").notNull(), // scheduled, completed, cancelled
  location: text("location"),
  appointmentType: text("appointment_type").default("consultation"), // consultation, estimate, installation, followup
  notes: text("notes"),
  contactId: integer("contact_id").references(() => contacts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true
});

// Customer reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  platform: text("platform").notNull(), // google, yelp, facebook, etc.
  rating: integer("rating"), // 1-5 stars
  reviewText: text("review_text"),
  reviewDate: timestamp("review_date"),
  reviewUrl: text("review_url"),
  isPublished: boolean("is_published").default(false),
  requestSentDate: timestamp("request_sent_date"),
  status: text("status").default("pending").notNull(), // pending, requested, received, published
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

// Email templates
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(), // Main content of the email
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content").notNull(),
  category: text("category").default("general").notNull(), // general, follow-up, review-request, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// SMS templates
export const smsTemplates = pgTable("sms_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").default("general").notNull(), // general, follow-up, review-request, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSmsTemplateSchema = createInsertSchema(smsTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Automation workflows
export const automationWorkflows = pgTable("automation_workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  triggerType: text("trigger_type").default("manual").notNull(), // manual, lead_stage_change, appointment, form_submission, review_request
  triggerCondition: text("trigger_condition"), // When lead stage changes to "qualified", 1 day before appointment, etc.
  emailTemplateId: integer("email_template_id").references(() => emailTemplates.id),
  smsTemplateId: integer("sms_template_id").references(() => smsTemplates.id),
  delay: integer("delay").default(0), // Delay in hours
  trigger: text("trigger").notNull(), // Legacy field - for compatibility
  actions: json("actions").notNull(), // Legacy field - for compatibility 
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAutomationWorkflowSchema = createInsertSchema(automationWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export type InsertSmsTemplate = z.infer<typeof insertSmsTemplateSchema>;
export type SmsTemplate = typeof smsTemplates.$inferSelect;

// Customer projects table
export const customerProjects = pgTable("customer_projects", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customerUsers.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(), // pending, in_progress, completed, on_hold, cancelled
  startDate: date("start_date"),
  completionDate: date("completion_date"),
  estimatedCost: text("estimated_cost"),
  actualCost: text("actual_cost"),
  notes: text("notes"),
  projectManager: text("project_manager"),
  flooringType: text("flooring_type"), // hardwood, laminate, vinyl, tile, etc.
  squareFootage: text("square_footage"),
  location: text("location"),
  beforeImages: text("before_images").array(),
  afterImages: text("after_images").array(),
  progressUpdates: json("progress_updates").$type<Array<{
    date: string;
    status: string;
    note: string;
    images?: string[];
  }>>(),
  documents: json("documents").$type<Array<{
    name: string;
    url: string;
    type: string;
    uploadDate: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerProjectSchema = createInsertSchema(customerProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertAutomationWorkflow = z.infer<typeof insertAutomationWorkflowSchema>;
export type AutomationWorkflow = typeof automationWorkflows.$inferSelect;

// Estimates table
export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  customerUserId: integer("customer_user_id").references(() => customerUsers.id),
  estimateNumber: text("estimate_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("draft").notNull(), // draft, sent, viewed, approved, rejected, converted
  subtotal: text("subtotal").notNull(), // Using text for money values to avoid floating point precision issues
  tax: text("tax"),
  discount: text("discount"),
  total: text("total").notNull(),
  validUntil: date("valid_until"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  customerNotes: text("customer_notes"), // Notes from customer
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  createdBy: text("created_by"), // Username of admin who created the estimate
  lineItems: json("line_items").$type<Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: string;
    totalPrice: string;
    category?: string; // materials, labor, etc.
    notes?: string;
  }>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEstimateSchema = createInsertSchema(estimates).omit({
  id: true, 
  createdAt: true,
  updatedAt: true
});

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  contractNumber: text("contract_number").notNull(),
  estimateId: integer("estimate_id").references(() => estimates.id),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  customerUserId: integer("customer_user_id").references(() => customerUsers.id),
  projectId: integer("project_id").references(() => customerProjects.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("draft").notNull(), // draft, sent, viewed, signed, cancelled
  amount: text("amount").notNull(), // Total contract value
  startDate: date("start_date"),
  endDate: date("end_date"),
  paymentTerms: text("payment_terms"),
  paymentSchedule: json("payment_schedule").$type<Array<{
    id: string;
    description: string;
    amount: string;
    dueDate: string;
    status: string; // scheduled, invoiced, paid
  }>>(),
  contractBody: text("contract_body").notNull(), // Full contract text
  customerSignature: text("customer_signature"), // Path to signature or image data
  customerSignedAt: timestamp("customer_signed_at"),
  companySignature: text("company_signature"),
  companySignedAt: timestamp("company_signed_at"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  createdBy: text("created_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  customerUserId: integer("customer_user_id").references(() => customerUsers.id),
  projectId: integer("project_id").references(() => customerProjects.id),
  contractId: integer("contract_id").references(() => contracts.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("draft").notNull(), // draft, sent, viewed, partially_paid, paid, overdue, cancelled
  subtotal: text("subtotal").notNull(),
  tax: text("tax"),
  discount: text("discount"),
  total: text("total").notNull(),
  amountPaid: text("amount_paid").default("0"),
  amountDue: text("amount_due"),
  dueDate: date("due_date"),
  notes: text("notes"),
  paymentTerms: text("payment_terms"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"), // credit_card, check, cash, bank_transfer, etc.
  paymentReference: text("payment_reference"), // Reference number for payment
  createdBy: text("created_by"),
  lineItems: json("line_items").$type<Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: string;
    totalPrice: string;
    category?: string;
    notes?: string;
  }>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  amount: text("amount").notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  paymentMethod: text("payment_method").notNull(), // credit_card, check, cash, bank_transfer, etc.
  paymentReference: text("payment_reference"), // Reference number, check number, transaction ID
  status: text("status").default("completed").notNull(), // pending, completed, failed, refunded
  notes: text("notes"),
  receiptSent: boolean("receipt_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomerUser = z.infer<typeof insertCustomerUserSchema>;
export type CustomerUser = typeof customerUsers.$inferSelect;

export type InsertCustomerProject = z.infer<typeof insertCustomerProjectSchema>;
export type CustomerProject = typeof customerProjects.$inferSelect;

export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type Estimate = typeof estimates.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
