CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_number" text NOT NULL,
	"estimate_id" integer,
	"contact_id" integer NOT NULL,
	"customer_user_id" integer,
	"project_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"amount" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"payment_terms" text,
	"payment_schedule" json,
	"contract_body" text NOT NULL,
	"customer_signature" text,
	"customer_signed_at" timestamp,
	"company_signature" text,
	"company_signed_at" timestamp,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"created_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimates" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"customer_user_id" integer,
	"estimate_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" text NOT NULL,
	"tax" text,
	"discount" text,
	"total" text NOT NULL,
	"valid_until" date,
	"notes" text,
	"terms_and_conditions" text,
	"customer_notes" text,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"created_by" text,
	"line_items" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"contact_id" integer NOT NULL,
	"customer_user_id" integer,
	"project_id" integer,
	"contract_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" text NOT NULL,
	"tax" text,
	"discount" text,
	"total" text NOT NULL,
	"amount_paid" text DEFAULT '0',
	"amount_due" text,
	"due_date" date,
	"notes" text,
	"payment_terms" text,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"paid_at" timestamp,
	"payment_method" text,
	"payment_reference" text,
	"created_by" text,
	"line_items" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"contact_id" integer NOT NULL,
	"amount" text NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"payment_method" text NOT NULL,
	"payment_reference" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"notes" text,
	"receipt_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_users" ADD COLUMN "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customer_user_id_customer_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."customer_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_project_id_customer_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."customer_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_customer_user_id_customer_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."customer_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_user_id_customer_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."customer_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_customer_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."customer_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_users" ADD CONSTRAINT "customer_users_username_unique" UNIQUE("username");