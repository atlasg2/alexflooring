-- Add username column to customer_users table
ALTER TABLE customer_users ADD COLUMN IF NOT EXISTS username TEXT;

-- Make it not null with a default value initially to handle existing rows
UPDATE customer_users SET username = email WHERE username IS NULL;

-- Add unique constraint
ALTER TABLE customer_users ALTER COLUMN username SET NOT NULL;
ALTER TABLE customer_users ADD CONSTRAINT customer_users_username_unique UNIQUE (username);