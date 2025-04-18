-- Create customer_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  contact_id INTEGER REFERENCES contacts(id),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create customer_projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer_projects (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer_users(id),
  contact_id INTEGER REFERENCES contacts(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  start_date DATE,
  completion_date DATE,
  estimated_cost TEXT,
  actual_cost TEXT,
  notes TEXT,
  project_manager TEXT,
  flooring_type TEXT,
  square_footage TEXT,
  location TEXT,
  before_images TEXT[],
  after_images TEXT[],
  progress_updates JSONB,
  documents JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);