import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendEmail } from '../config/email.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// POST /api/auth/register
router.post('/register', [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nama lengkap harus antara 2-255 karakter'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, kecil, dan angka'),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }

    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert new user
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, email_verification_token, email_verification_expiry) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, full_name, email, role, plan, trial_expiry, created_at`,
      [fullName, email, passwordHash, verificationToken, verificationExpiry]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail(email, 'welcome', {
        user: newUser,
        verificationUrl
      });
      console.log('✅ Verification email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat! Silakan cek email untuk verifikasi.',
      data: {
        user: newUser,
        token,
        emailSent: true
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Token verifikasi wajib diisi'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak valid',
        errors: errors.array()
      });
    }

    const { token } = req.body;

    // Find user by verification token
    const result = await query(
      `SELECT id, full_name, email, email_verified 
       FROM users 
       WHERE email_verification_token = $1 
       AND email_verification_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token verifikasi tidak valid atau sudah kedaluwarsa'
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terverifikasi sebelumnya'
      });
    }

    // Update user as verified
    await query(
      `UPDATE users 
       SET email_verified = true, 
           email_verification_token = NULL, 
           email_verification_expiry = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    res.json({
      success: true,
      message: 'Email berhasil diverifikasi! Selamat datang di Oxdel.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email tidak valid',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user
    const result = await query(
      'SELECT id, full_name, email, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email tidak ditemukan'
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terverifikasi'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await query(
      `UPDATE users 
       SET email_verification_token = $1, 
           email_verification_expiry = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [verificationToken, verificationExpiry, user.id]
    );

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail(email, 'welcome', {
        user,
        verificationUrl
      });
      
      res.json({
        success: true,
        message: 'Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.'
      });
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim email verifikasi'
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid'),
  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi'),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await query(
      `SELECT id, full_name, email, password_hash, role, plan, trial_expiry, 
              subscription_expiry, email_verified, avatar_url 
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user,
        token,
        emailVerified: user.email_verified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid'),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email tidak valid',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const result = await query(
      'SELECT id, full_name, email FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'Jika email terdaftar, link reset password telah dikirim'
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to database
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send reset email
    try {
      await sendEmail(user.email, 'resetPassword', {
        user,
        resetUrl
      });
      
      res.json({
        success: true,
        message: 'Link reset password telah dikirim ke email Anda'
      });
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim email reset password'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Token reset wajib diisi'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, kecil, dan angka'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Konfirmasi password tidak cocok');
      }
      return true;
    }),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Find user by reset token
    const result = await query(
      'SELECT id, full_name, email FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token reset tidak valid atau sudah expired'
      });
    }

    const user = result.rows[0];

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    res.json({
      success: true,
      message: 'Password berhasil direset'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

export default router;