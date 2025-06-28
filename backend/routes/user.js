import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// GET /api/user/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, role, plan, trial_expiry, subscription_expiry, email_verified, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const user = result.rows[0];
    
    // Calculate trial/subscription status
    const now = new Date();
    const trialExpiry = new Date(user.trial_expiry);
    const subscriptionExpiry = user.subscription_expiry ? new Date(user.subscription_expiry) : null;
    
    user.trial_active = trialExpiry > now;
    user.subscription_active = subscriptionExpiry && subscriptionExpiry > now;
    user.days_left_trial = user.trial_active ? Math.ceil((trialExpiry - now) / (1000 * 60 * 60 * 24)) : 0;

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', [
  authenticateToken,
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nama lengkap harus antara 2-255 karakter'),
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
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }

    const { fullName, email } = req.body;

    // Check if email is already taken by another user
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, req.user.id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan oleh user lain'
      });
    }

    // Update user profile
    await query(
      'UPDATE users SET full_name = $1, email = $2, updated_at = NOW() WHERE id = $3',
      [fullName, email, req.user.id]
    );

    // Get updated user data
    const result = await query(
      'SELECT id, full_name, email, role, plan, trial_expiry, subscription_expiry, email_verified, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: { user: result.rows[0] }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT /api/user/password - Change password
router.put('/password', [
  authenticateToken,
  body('currentPassword')
    .notEmpty()
    .withMessage('Password saat ini wajib diisi'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password baru minimal 6 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password baru harus mengandung huruf besar, kecil, dan angka'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
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

    const { currentPassword, newPassword } = req.body;

    // Get current user with password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini salah'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST /api/user/avatar - Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File avatar wajib diupload'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar URL
    await query(
      'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
      [avatarUrl, req.user.id]
    );

    res.json({
      success: true,
      message: 'Avatar berhasil diupload',
      data: { avatar_url: avatarUrl }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET /api/user/stats - Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get user project statistics
    const projectStats = await query(
      'SELECT COUNT(*) as total_projects, COUNT(CASE WHEN status = $1 THEN 1 END) as published_projects FROM projects WHERE user_id = $2',
      ['published', req.user.id]
    );

    const stats = {
      total_projects: parseInt(projectStats.rows[0].total_projects) || 0,
      published_projects: parseInt(projectStats.rows[0].published_projects) || 0,
      total_views: 0, // Will be implemented with analytics
      storage_used: '0 MB', // Will be calculated based on uploaded files
      storage_limit: req.user.plan === 'free' ? '100 MB' : req.user.plan === 'pro' ? '1 GB' : '10 GB'
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

export default router;