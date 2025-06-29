import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/marketplace/templates - Get marketplace templates
router.get('/templates', async (req, res) => {
  try {
    const { category, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    let sqlQuery = `
      SELECT mt.*, u.full_name as creator_name
      FROM marketplace_templates mt
      JOIN users u ON mt.creator_id = u.id
      WHERE mt.status = 'approved'
    `;
    const params = [];
    let paramIndex = 1;

    // Add category filter
    if (category && category !== 'all') {
      sqlQuery += ` AND mt.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      sqlQuery += ` AND (mt.name ILIKE $${paramIndex} OR mt.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting
    const validSortColumns = ['created_at', 'name', 'price', 'downloads', 'rating'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = validSortOrders.includes(sort_order) ? sort_order : 'desc';
    
    sqlQuery += ` ORDER BY mt.${sortColumn} ${sortDirection.toUpperCase()}`;

    const result = await query(sqlQuery, params);

    res.json({
      success: true,
      data: {
        templates: result.rows,
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get marketplace templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get marketplace templates'
    });
  }
});

// POST /api/marketplace/templates/:id/purchase - Purchase template
router.post('/templates/:id/purchase', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get template details
    const templateResult = await query(
      'SELECT * FROM marketplace_templates WHERE id = $1 AND status = $2',
      [id, 'approved']
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const template = templateResult.rows[0];

    // Check if already purchased
    const existingPurchase = await query(
      'SELECT * FROM template_purchases WHERE user_id = $1 AND template_id = $2',
      [userId, id]
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Template already purchased'
      });
    }

    // Create purchase record
    await query(
      'INSERT INTO template_purchases (user_id, template_id, amount) VALUES ($1, $2, $3)',
      [userId, id, template.price]
    );

    // Update download count
    await query(
      'UPDATE marketplace_templates SET downloads = downloads + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Template purchased successfully',
      data: { template }
    });

  } catch (error) {
    console.error('Purchase template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase template'
    });
  }
});

export default router;