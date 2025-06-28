import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { cache } from '../config/redis.js';
import { sendBulkEmail } from '../config/email.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/dashboard - Admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'admin:dashboard:stats';
    const cachedStats = await cache.get(cacheKey);
    
    if (cachedStats) {
      return res.json({
        success: true,
        data: cachedStats,
        cached: true
      });
    }

    // Get user statistics
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN plan = 'pro' THEN 1 END) as pro_users,
        COUNT(CASE WHEN plan = 'enterprise' THEN 1 END) as enterprise_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7d
      FROM users
    `);

    // Get project statistics
    const projectStats = await query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_projects,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_projects_30d,
        SUM(COALESCE(views, 0)) as total_views
      FROM projects
    `);

    // Get template statistics
    const templateStats = await query(`
      SELECT 
        COUNT(*) as total_templates,
        COUNT(CASE WHEN is_premium = true THEN 1 END) as premium_templates,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_templates_30d
      FROM templates
    `);

    // Get payment statistics
    const paymentStats = await query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN status = 'succeeded' AND created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as payments_30d,
        SUM(CASE WHEN status = 'succeeded' AND created_at >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END) as revenue_30d
      FROM payments
    `);

    const stats = {
      users: userStats.rows[0],
      projects: projectStats.rows[0],
      templates: templateStats.rows[0],
      payments: {
        ...paymentStats.rows[0],
        total_revenue: (paymentStats.rows[0].total_revenue || 0) / 100,
        revenue_30d: (paymentStats.rows[0].revenue_30d || 0) / 100
      }
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, stats, 300);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin dashboard data'
    });
  }
});

// GET /api/admin/users - Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      search = '', 
      plan = 'all',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add plan filter
    if (plan !== 'all') {
      whereClause += ` AND plan = $${paramIndex}`;
      params.push(plan);
      paramIndex++;
    }

    // Validate sort parameters
    const validSortColumns = ['created_at', 'full_name', 'email', 'plan'];
    const validSortOrders = ['asc', 'desc'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = validSortOrders.includes(sort_order) ? sort_order : 'desc';

    const usersQuery = `
      SELECT id, full_name, email, role, plan, trial_expiry, subscription_expiry, 
             email_verified, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), parseInt(offset));

    const users = await query(usersQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        users: users.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', [
  body('plan')
    .optional()
    .isIn(['free', 'pro', 'enterprise'])
    .withMessage('Invalid plan'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Invalid role'),
  body('email_verified')
    .optional()
    .isBoolean()
    .withMessage('Email verified must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { plan, role, email_verified } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (plan !== undefined) {
      updates.push(`plan = $${paramIndex}`);
      values.push(plan);
      paramIndex++;
    }

    if (role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

    if (email_verified !== undefined) {
      updates.push(`email_verified = $${paramIndex}`);
      values.push(email_verified);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, full_name, email, role, plan, email_verified, updated_at
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: result.rows[0] }
    });

  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, full_name, email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// GET /api/admin/templates/pending - Get pending templates
router.get('/templates/pending', async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*, u.full_name as creator_name, u.email as creator_email
      FROM marketplace_templates t
      JOIN users u ON t.creator_id = u.id
      WHERE t.status = 'pending'
      ORDER BY t.created_at DESC
    `);

    res.json({
      success: true,
      data: { templates: result.rows }
    });

  } catch (error) {
    console.error('Admin get pending templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending templates'
    });
  }
});

// PUT /api/admin/templates/:id/approve - Approve template
router.put('/templates/:id/approve', [
  body('approved')
    .isBoolean()
    .withMessage('Approved must be boolean'),
  body('rejection_reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Rejection reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { approved, rejection_reason } = req.body;

    const status = approved ? 'approved' : 'rejected';
    
    const result = await query(`
      UPDATE marketplace_templates 
      SET status = $1, rejection_reason = $2, approved_by = $3, approved_at = NOW(), updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [status, rejection_reason || null, req.user.id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: `Template ${status} successfully`,
      data: { template: result.rows[0] }
    });

  } catch (error) {
    console.error('Admin approve template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve template'
    });
  }
});

// POST /api/admin/broadcast - Send broadcast email
router.post('/broadcast', [
  body('subject')
    .notEmpty()
    .withMessage('Subject is required'),
  body('message')
    .notEmpty()
    .withMessage('Message is required'),
  body('recipients')
    .isIn(['all', 'free', 'pro', 'enterprise'])
    .withMessage('Invalid recipients')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: errors.array()
      });
    }

    const { subject, message, recipients } = req.body;

    // Get recipient emails
    let whereClause = '';
    if (recipients !== 'all') {
      whereClause = `WHERE plan = '${recipients}'`;
    }

    const usersResult = await query(`
      SELECT email, full_name FROM users ${whereClause}
    `);

    const emails = usersResult.rows.map(user => user.email);

    // Send broadcast email (implement custom template)
    const result = await sendBulkEmail(emails, 'broadcast', {
      subject,
      message,
      sender: req.user.full_name
    });

    res.json({
      success: true,
      message: 'Broadcast email sent successfully',
      data: {
        total_recipients: emails.length,
        successful: result.successful,
        failed: result.failed
      }
    });

  } catch (error) {
    console.error('Admin broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast email'
    });
  }
});

// GET /api/admin/analytics - Advanced analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

    // User growth analytics
    const userGrowth = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COUNT(CASE WHEN plan != 'free' THEN 1 END) as premium_users
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Revenue analytics
    const revenueAnalytics = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as revenue
      FROM payments 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Project analytics
    const projectAnalytics = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_projects,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_projects
      FROM projects 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      success: true,
      data: {
        user_growth: userGrowth.rows,
        revenue_analytics: revenueAnalytics.rows.map(row => ({
          ...row,
          revenue: (row.revenue || 0) / 100
        })),
        project_analytics: projectAnalytics.rows,
        period
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data'
    });
  }
});

export default router;