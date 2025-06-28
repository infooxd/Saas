import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createDefaultUsers = async () => {
  try {
    console.log('🔧 Creating default users...');

    // Hash passwords
    const saltRounds = 12;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const userPassword = await bcrypt.hash('user123', saltRounds);

    // Create admin user
    const adminResult = await query(`
      INSERT INTO users (full_name, email, password_hash, role, plan, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        plan = EXCLUDED.plan,
        updated_at = NOW()
      RETURNING id, full_name, email, role, plan
    `, [
      'Admin User',
      'admin@oxdel.com',
      adminPassword,
      'admin',
      'enterprise',
      true
    ]);

    // Create regular user
    const userResult = await query(`
      INSERT INTO users (full_name, email, password_hash, role, plan, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        plan = EXCLUDED.plan,
        updated_at = NOW()
      RETURNING id, full_name, email, role, plan
    `, [
      'Regular User',
      'user@oxdel.com',
      userPassword,
      'user',
      'free',
      true
    ]);

    console.log('✅ Default users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│                ADMIN ACCOUNT                │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ Email:    admin@oxdel.com                   │');
    console.log('│ Password: admin123                          │');
    console.log('│ Role:     admin                             │');
    console.log('│ Plan:     enterprise                        │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│                USER ACCOUNT                 │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ Email:    user@oxdel.com                    │');
    console.log('│ Password: user123                           │');
    console.log('│ Role:     user                              │');
    console.log('│ Plan:     free                              │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('\n🌐 Login URL: http://localhost:3000/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
};

createDefaultUsers();