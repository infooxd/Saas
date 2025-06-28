/*
  # Create projects table for user projects

  1. New Tables
    - `projects`
      - `id` (serial, primary key)
      - `user_id` (integer, foreign key to users)
      - `title` (varchar, project title)
      - `description` (text, project description)
      - `template_id` (varchar, template identifier)
      - `content` (jsonb, project content/data)
      - `status` (varchar, draft/published/archived)
      - `slug` (varchar, unique URL slug)
      - `custom_domain` (varchar, custom domain if any)
      - `published_at` (timestamp, publication date)
      - `created_at` (timestamp, creation date)
      - `updated_at` (timestamp, last update)

  2. Security
    - Enable RLS on `projects` table
    - Add policy for users to manage their own projects
    - Add policy for public read access to published projects

  3. Indexes
    - Index on user_id for faster user project queries
    - Unique index on slug for URL routing
    - Index on status for filtering
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  template_id VARCHAR(100),
  content JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  slug VARCHAR(255) UNIQUE NOT NULL,
  custom_domain VARCHAR(255) NULL,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Public can read published projects"
  ON projects
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_template_id ON projects(template_id);

-- Create updated_at trigger
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();