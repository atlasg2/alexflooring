import { db } from '../server/db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Starting database schema update...');

  try {
    // Drop existing tables (be careful here!)
    console.log('Dropping existing tables...');
    await db.execute(sql`DROP TABLE IF EXISTS appointments CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS chat_messages CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS contact_submissions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    
    // Create tables using SQL to avoid interactive prompts
    console.log('Creating contacts table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        source TEXT NOT NULL DEFAULT 'manual',
        lead_stage TEXT NOT NULL DEFAULT 'new',
        lead_score INTEGER DEFAULT 0,
        assigned_to TEXT,
        last_contacted_date TIMESTAMP,
        preferred_contact TEXT DEFAULT 'email',
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        notes TEXT,
        tags TEXT[],
        custom_fields JSONB,
        is_customer BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating users table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating contact_submissions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        service TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        contact_id INTEGER REFERENCES contacts(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating communication_logs table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS communication_logs (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER NOT NULL REFERENCES contacts(id),
        type TEXT NOT NULL,
        direction TEXT NOT NULL,
        subject TEXT,
        content TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        sent_by TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating chat_messages table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        message TEXT NOT NULL,
        contact_id INTEGER REFERENCES contacts(id),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating appointments table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        client_name TEXT NOT NULL,
        client_email TEXT,
        client_phone TEXT,
        date DATE NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        status TEXT NOT NULL DEFAULT 'scheduled',
        location TEXT,
        appointment_type TEXT DEFAULT 'consultation',
        notes TEXT,
        contact_id INTEGER REFERENCES contacts(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating reviews table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id),
        platform TEXT NOT NULL,
        rating INTEGER,
        review_text TEXT,
        review_date TIMESTAMP,
        review_url TEXT,
        is_published BOOLEAN DEFAULT false,
        request_sent_date TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating email_templates table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating sms_templates table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sms_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating automation_workflows table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS automation_workflows (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        trigger TEXT NOT NULL,
        actions JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create admin user
    console.log('Creating admin user...');
    await db.execute(sql`
      INSERT INTO users (username, password, role) 
      VALUES ('admin', '1f041e9364e0f458309b0d04977dfa7a34b66edcb3ac7cfcfede94f7be84e0c19ad5de0057e5c25f6cbb0721cf0fdd3d7f7b25cb40db773c63b87978dabc7c0c.8fc62e2e7a4a9c17', 'admin')
      ON CONFLICT (username) DO NOTHING
    `);
    
    console.log('Schema update completed successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

main();