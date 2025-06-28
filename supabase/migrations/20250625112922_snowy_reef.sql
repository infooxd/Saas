/*
  # Create users table for Oxdel SaaS Platform

  1. New Tables
    - `users`
      - `id` (serial, primary key)
      - `full_name` (varchar, user's full name)
      - `email` (varchar, unique, user email)
      - `password_hash` (varchar, bcrypt hashed password)
      - `role` (varchar, user role: user/admin)
      - `plan` (varchar, subscription plan: free/pro/enterprise)
      - `trial_expiry` (timestamp, trial expiration date)
      - `subscription_expiry` (timestamp, subscription expiration)
      - `email_verified` (boolean, email verification status)
      - `avatar_url` (varchar, profile picture URL)
      - `reset_token` (varchar, password reset token)
      - `reset_token_expiry` (timestamp, reset token expiration)
      - `created_at` (timestamp, account creation)
      - `updated_at` (timestamp, last update)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
    - Add policy for admins to manage all users

  3. Indexes
    - Unique index on email
    - Index on reset_token for faster lookups
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  trial_expiry TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_expiry TIMESTAMP NULL,
  email_verified BOOLEAN DEFAULT false,
  avatar_url VARCHAR(500) NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();