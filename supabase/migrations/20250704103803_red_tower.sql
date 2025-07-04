-- Add email verification columns to users table
DO $$
BEGIN
  -- Add email_verification_token column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email_verification_token'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verification_token TEXT;
  END IF;

  -- Add email_verification_expiry column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email_verification_expiry'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verification_expiry TIMESTAMPTZ;
  END IF;
END $$;

-- Add index for email verification token
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token 
ON users (email_verification_token);

-- Add index for email verification expiry
CREATE INDEX IF NOT EXISTS idx_users_email_verification_expiry 
ON users (email_verification_expiry);