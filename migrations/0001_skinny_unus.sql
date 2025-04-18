CREATE TABLE "customer_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"contact_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"start_date" date,
	"completion_date" date,
	"estimated_cost" text,
	"actual_cost" text,
	"notes" text,
	"project_manager" text,
	"flooring_type" text,
	"square_footage" text,
	"location" text,
	"before_images" text[],
	"after_images" text[],
	"progress_updates" json,
	"documents" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"contact_id" integer,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "contact_submissions" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "type" text DEFAULT 'contact' NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "sms_opt_in" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "customer_projects" ADD CONSTRAINT "customer_projects_customer_id_customer_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_projects" ADD CONSTRAINT "customer_projects_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_users" ADD CONSTRAINT "customer_users_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;