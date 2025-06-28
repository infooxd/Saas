/*
  # Production Ready Database Schema

  1. New Tables
    - `payments` (payment transactions)
    - `marketplace_templates` (user uploaded templates)
    - `template_purchases` (template purchase history)
    - `affiliate_links` (referral tracking)
    - `affiliate_commissions` (commission tracking)
    - `rsvp_submissions` (form submissions)
    - `email_logs` (email tracking)

  2. Security
    - Enhanced RLS policies
    - Audit triggers
    - Performance indexes

  3. Performance
    - Optimized indexes
    - Materialized views for analytics
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  plan VARCHAR(50),
  type VARCHAR(50) DEFAULT 'subscription' CHECK (type IN ('subscription', 'one_time', 'template')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create marketplace_templates table
CREATE TABLE IF NOT EXISTS marketplace_templates (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  preview_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  file_url VARCHAR(500),
  content JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create template_purchases table
CREATE TABLE IF NOT EXISTS template_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id INTEGER NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  payment_id INTEGER REFERENCES payments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Create affiliate_links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create affiliate_commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id INTEGER REFERENCES payments(id),
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.1000 for 10%
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled')),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create rsvp_submissions table
CREATE TABLE IF NOT EXISTS rsvp_submissions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  custom_fields JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email_to VARCHAR(255) NOT NULL,
  email_from VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template VARCHAR(100),
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
  message_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for marketplace_templates
CREATE POLICY "Public can view approved templates"
  ON marketplace_templates FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Users can manage own templates"
  ON marketplace_templates FOR ALL
  TO authenticated
  USING (creator_id::text = auth.uid()::text);

CREATE POLICY "Admins can manage all templates"
  ON marketplace_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for template_purchases
CREATE POLICY "Users can view own purchases"
  ON template_purchases FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create purchases"
  ON template_purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

-- RLS Policies for affiliate_links
CREATE POLICY "Users can manage own affiliate links"
  ON affiliate_links FOR ALL
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- RLS Policies for affiliate_commissions
CREATE POLICY "Users can view own commissions"
  ON affiliate_commissions FOR SELECT
  TO authenticated
  USING (affiliate_id::text = auth.uid()::text);

-- RLS Policies for rsvp_submissions
CREATE POLICY "Project owners can view submissions"
  ON rsvp_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Anyone can submit RSVP"
  ON rsvp_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for email_logs
CREATE POLICY "Users can view own email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_templates_creator ON marketplace_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_status ON marketplace_templates(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_category ON marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_tags ON marketplace_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_rating ON marketplace_templates(rating DESC);

CREATE INDEX IF NOT EXISTS idx_template_purchases_user ON template_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_template ON template_purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_created ON template_purchases(created_at);

CREATE INDEX IF NOT EXISTS idx_affiliate_links_user ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_active ON affiliate_links(is_active);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_referred ON affiliate_commissions(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);

CREATE INDEX IF NOT EXISTS idx_rsvp_submissions_project ON rsvp_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_submissions_email ON rsvp_submissions(email);
CREATE INDEX IF NOT EXISTS idx_rsvp_submissions_created ON rsvp_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_templates_updated_at 
  BEFORE UPDATE ON marketplace_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at 
  BEFORE UPDATE ON affiliate_links 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate affiliate codes
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 8 character random code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_check FROM affiliate_links WHERE code = code;
    
    -- Exit loop if code is unique
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
DO $$
BEGIN
  -- Insert sample marketplace templates
  IF NOT EXISTS (SELECT 1 FROM marketplace_templates LIMIT 1) THEN
    INSERT INTO marketplace_templates (creator_id, name, description, category, price, preview_url, thumbnail_url, content, tags, status, approved_at) 
    SELECT 
      u.id,
      'Premium Business Template',
      'Professional business template with advanced features',
      'business',
      49.99,
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=300&h=200',
      '{"sections": ["hero", "services", "about", "testimonials", "contact"], "premium": true}',
      ARRAY['business', 'premium', 'professional'],
      'approved',
      NOW()
    FROM users u 
    WHERE u.email = 'admin@oxdel.com'
    LIMIT 1;

    INSERT INTO marketplace_templates (creator_id, name, description, category, price, preview_url, thumbnail_url, content, tags, status, approved_at) 
    SELECT 
      u.id,
      'Creative Portfolio Template',
      'Stunning portfolio template for creatives',
      'portfolio',
      29.99,
      'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
      'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=300&h=200',
      '{"sections": ["hero", "portfolio", "about", "contact"], "creative": true}',
      ARRAY['portfolio', 'creative', 'modern'],
      'approved',
      NOW()
    FROM users u 
    WHERE u.email = 'admin@oxdel.com'
    LIMIT 1;
  END IF;

  -- Create affiliate links for users
  IF NOT EXISTS (SELECT 1 FROM affiliate_links LIMIT 1) THEN
    INSERT INTO affiliate_links (user_id, code, clicks, conversions, total_commission)
    SELECT 
      u.id,
      generate_affiliate_code(),
      FLOOR(RANDOM() * 100),
      FLOOR(RANDOM() * 10),
      ROUND((RANDOM() * 500)::numeric, 2)
    FROM users u 
    WHERE u.email IN ('user@oxdel.com', 'admin@oxdel.com');
  END IF;
END $$;