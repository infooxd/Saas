import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendEmail } from '../config/email.js';

const router = express.Router();

// GET /api/affiliate/stats - Get affiliate statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create affiliate link
    let affiliateResult = await query(
      'SELECT * FROM affiliate_links WHERE user_id = $1',
      [userId]
    );

    if (affiliateResult.rows.length === 0) {
      // Create new affiliate link
      const code = generateAffiliateCode();
      await query(
        'INSERT INTO affiliate_links (user_id, code) VALUES ($1, $2)',
        [userId, code]
      );
      
      affiliateResult = await query(
        'SELECT * FROM affiliate_links WHERE user_id = $1',
        [userId]
      );
    }

    const affiliateLink = affiliateResult.rows[0];

    // Get commission statistics
    const commissionStats = await query(`
      SELECT 
        COUNT(*) as total_referrals,
        SUM(commission_amount) as total_earnings,
        SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END) as paid_earnings,
        SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END) as pending_earnings
      FROM affiliate_commissions 
      WHERE affiliate_id = $1
    `, [userId]);

    // Get recent commissions
    const recentCommissions = await query(`
      SELECT ac.*, u.full_name as referred_user_name
      FROM affiliate_commissions ac
      JOIN users u ON ac.referred_user_id = u.id
      WHERE ac.affiliate_id = $1
      ORDER BY ac.created_at DESC
      LIMIT 10
    `, [userId]);

    const stats = {
      affiliate_link: affiliateLink,
      commission_stats: commissionStats.rows[0],
      recent_commissions: recentCommissions.rows,
      referral_url: `${process.env.FRONTEND_URL}?ref=${affiliateLink.code}`
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get affiliate stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get affiliate statistics'
    });
  }
});

// POST /api/affiliate/track-click - Track affiliate link click
router.post('/track-click', [
  body('code').notEmpty().withMessage('Affiliate code is required')
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

    const { code } = req.body;

    // Update click count
    const result = await query(
      'UPDATE affiliate_links SET clicks = clicks + 1 WHERE code = $1 RETURNING *',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate code not found'
      });
    }

    res.json({
      success: true,
      message: 'Click tracked successfully'
    });

  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
});

// Helper function to generate affiliate code
function generateAffiliateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default router;