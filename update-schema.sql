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