/*
  # Create templates table for website templates

  1. New Tables
    - `templates`
      - `id` (serial, primary key)
      - `name` (varchar, template name)
      - `description` (text, template description)
      - `category` (varchar, template category)
      - `preview_url` (varchar, preview image URL)
      - `thumbnail_url` (varchar, thumbnail image URL)
      - `content` (jsonb, template structure/content)
      - `is_premium` (boolean, premium template flag)
      - `price` (decimal, template price if premium)
      - `tags` (text array, template tags)
      - `created_at` (timestamp, creation date)
      - `updated_at` (timestamp, last update)

  2. Security
    - Enable RLS on `templates` table
    - Add policy for public read access to all templates
    - Add policy for admins to manage templates

  3. Indexes
    - Index on category for filtering
    - Index on is_premium for plan restrictions
    - Index on tags for search functionality
*/

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  preview_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  content JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0.00,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read all templates"
  ON templates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage templates"
  ON templates
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
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_premium ON templates(is_premium);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);

-- Create updated_at trigger
CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample templates
INSERT INTO templates (name, description, category, preview_url, thumbnail_url, content, is_premium, tags) VALUES
('Modern Portfolio', 'Clean and modern portfolio template for professionals', 'portfolio', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=300&h=200', '{"sections": ["hero", "about", "portfolio", "contact"]}', false, ARRAY['portfolio', 'modern', 'clean']),
('Business Landing', 'Professional business landing page template', 'business', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=300&h=200', '{"sections": ["hero", "services", "about", "testimonials", "contact"]}', false, ARRAY['business', 'corporate', 'professional']),
('E-commerce Store', 'Complete e-commerce store template with cart', 'ecommerce', 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg', 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?w=300&h=200', '{"sections": ["hero", "products", "categories", "cart", "checkout"]}', true, ARRAY['ecommerce', 'store', 'shopping']),
('Event Landing', 'Beautiful event and conference landing page', 'event', 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg', 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?w=300&h=200', '{"sections": ["hero", "schedule", "speakers", "tickets", "contact"]}', false, ARRAY['event', 'conference', 'landing']);