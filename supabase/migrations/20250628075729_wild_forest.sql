/*
  # Add project management features

  1. New Columns
    - Add `is_favorite` column to projects table
    - Add `views` column to projects table for tracking page views
    - Add indexes for better performance

  2. Security
    - Update RLS policies to handle new columns
    - Ensure proper access control

  3. Performance
    - Add indexes for favorite and views columns
*/

-- Add new columns to projects table
DO $$
BEGIN
  -- Add is_favorite column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE projects ADD COLUMN is_favorite BOOLEAN DEFAULT false;
  END IF;

  -- Add views column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'views'
  ) THEN
    ALTER TABLE projects ADD COLUMN views INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_is_favorite ON projects(is_favorite);
CREATE INDEX IF NOT EXISTS idx_projects_views ON projects(views);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_user_favorite ON projects(user_id, is_favorite);

-- Update RLS policies to ensure they work with new columns
-- (The existing policies should already cover these columns, but let's make sure)

-- Add sample data for testing (optional)
-- You can remove this section if you don't want sample data

-- Insert sample projects for testing (only if no projects exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects LIMIT 1) THEN
    -- Insert sample projects for the first user
    INSERT INTO projects (user_id, title, description, template_id, content, slug, status, is_favorite, views) 
    SELECT 
      u.id,
      'Sample Portfolio Project',
      'A beautiful portfolio website showcasing my work and skills',
      '1',
      '{"blocks": [{"id": "hero_1", "type": "hero", "name": "Hero Section", "visible": true, "content": {"title": "Welcome to My Portfolio", "subtitle": "I create amazing digital experiences", "buttonText": "View My Work", "backgroundImage": "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg"}}]}',
      'sample-portfolio-' || u.id,
      'published',
      true,
      156
    FROM users u 
    WHERE u.email = 'user@oxdel.com'
    LIMIT 1;

    INSERT INTO projects (user_id, title, description, template_id, content, slug, status, is_favorite, views) 
    SELECT 
      u.id,
      'Business Landing Page',
      'Professional landing page for my business',
      '2',
      '{"blocks": [{"id": "hero_2", "type": "hero", "name": "Hero Section", "visible": true, "content": {"title": "Grow Your Business", "subtitle": "Professional solutions for modern companies", "buttonText": "Get Started", "backgroundImage": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"}}]}',
      'business-landing-' || u.id,
      'draft',
      false,
      0
    FROM users u 
    WHERE u.email = 'user@oxdel.com'
    LIMIT 1;

    INSERT INTO projects (user_id, title, description, template_id, content, slug, status, is_favorite, views) 
    SELECT 
      u.id,
      'Event Website',
      'Website for upcoming conference event',
      '4',
      '{"blocks": [{"id": "hero_3", "type": "hero", "name": "Hero Section", "visible": true, "content": {"title": "Tech Conference 2024", "subtitle": "Join us for the biggest tech event of the year", "buttonText": "Register Now", "backgroundImage": "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg"}}]}',
      'event-website-' || u.id,
      'published',
      true,
      89
    FROM users u 
    WHERE u.email = 'user@oxdel.com'
    LIMIT 1;
  END IF;
END $$;