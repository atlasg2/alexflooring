CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"client_name" text NOT NULL,
	"client_email" text,
	"client_phone" text,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"location" text,
	"appointment_type" text DEFAULT 'consultation',
	"notes" text,
	"contact_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_type" text DEFAULT 'manual' NOT NULL,
	"trigger_condition" text,
	"email_template_id" integer,
	"sms_template_id" integer,
	"delay" integer DEFAULT 0,
	"trigger" text NOT NULL,
	"actions" json NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"message" text NOT NULL,
	"contact_id" integer,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"type" text NOT NULL,
	"direction" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"sent_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"service" text,
	"status" text DEFAULT 'new' NOT NULL,
	"contact_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"lead_stage" text DEFAULT 'new' NOT NULL,
	"lead_score" integer DEFAULT 0,
	"assigned_to" text,
	"last_contacted_date" timestamp,
	"preferred_contact" text DEFAULT 'email',
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"notes" text,
	"tags" text[],
	"custom_fields" json,
	"is_customer" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer,
	"platform" text NOT NULL,
	"rating" integer,
	"review_text" text,
	"review_date" timestamp,
	"review_url" text,
	"is_published" boolean DEFAULT false,
	"request_sent_date" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_workflows" ADD CONSTRAINT "automation_workflows_email_template_id_email_templates_id_fk" FOREIGN KEY ("email_template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_workflows" ADD CONSTRAINT "automation_workflows_sms_template_id_sms_templates_id_fk" FOREIGN KEY ("sms_template_id") REFERENCES "public"."sms_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;
-- Add 'body' column to email_templates table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='email_templates' AND column_name='body'
    ) THEN
        ALTER TABLE email_templates ADD COLUMN body text;
    END IF;
END
$$;

-- Add 'is_active' column to email_templates table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='email_templates' AND column_name='is_active'
    ) THEN
        ALTER TABLE email_templates ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END
$$;

-- Add 'is_active' column to sms_templates table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='sms_templates' AND column_name='is_active'
    ) THEN
        ALTER TABLE sms_templates ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END
$$;

-- Add automation workflow fields
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='automation_workflows' AND column_name='trigger_type'
    ) THEN
        ALTER TABLE automation_workflows ADD COLUMN trigger_type text DEFAULT 'manual' NOT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='automation_workflows' AND column_name='trigger_condition'
    ) THEN
        ALTER TABLE automation_workflows ADD COLUMN trigger_condition text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='automation_workflows' AND column_name='email_template_id'
    ) THEN
        ALTER TABLE automation_workflows ADD COLUMN email_template_id integer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='automation_workflows' AND column_name='sms_template_id'
    ) THEN
        ALTER TABLE automation_workflows ADD COLUMN sms_template_id integer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='automation_workflows' AND column_name='delay'
    ) THEN
        ALTER TABLE automation_workflows ADD COLUMN delay integer DEFAULT 0;
    END IF;
END
$$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='automation_workflows_email_template_id_fkey'
    ) THEN
        ALTER TABLE automation_workflows 
        ADD CONSTRAINT automation_workflows_email_template_id_fkey 
        FOREIGN KEY (email_template_id) REFERENCES email_templates(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='automation_workflows_sms_template_id_fkey'
    ) THEN
        ALTER TABLE automation_workflows 
        ADD CONSTRAINT automation_workflows_sms_template_id_fkey 
        FOREIGN KEY (sms_template_id) REFERENCES sms_templates(id);
    END IF;
END
$$;