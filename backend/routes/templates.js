import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/templates - Get all templates with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category, search, is_premium } = req.query;
    
    let sqlQuery = `
      SELECT id, name, description, category, preview_url, thumbnail_url, 
             is_premium, price, tags, created_at
      FROM templates 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Add category filter
    if (category && category !== 'all') {
      sqlQuery += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      sqlQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR $${paramIndex} = ANY(tags))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add premium filter
    if (is_premium !== undefined) {
      sqlQuery += ` AND is_premium = $${paramIndex}`;
      params.push(is_premium === 'true');
      paramIndex++;
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const result = await query(sqlQuery, params);

    res.json({
      success: true,
      data: {
        templates: result.rows,
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil template'
    });
  }
});

// GET /api/templates/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT category, COUNT(*) as template_count
      FROM templates 
      GROUP BY category 
      ORDER BY category
    `);

    const categories = [
      { id: 'all', name: 'Semua Template', count: 0 },
      ...result.rows.map(row => ({
        id: row.category,
        name: getCategoryDisplayName(row.category),
        count: parseInt(row.template_count)
      }))
    ];

    // Calculate total count for "Semua Template"
    categories[0].count = categories.slice(1).reduce((sum, cat) => sum + cat.count, 0);

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil kategori'
    });
  }
});

// GET /api/templates/:id - Get template detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM templates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: { template: result.rows[0] }
    });

  } catch (error) {
    console.error('Get template detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail template'
    });
  }
});

// POST /api/templates/:id/use - Use template (create project from template)
router.post('/:id/use', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    // Get template
    const templateResult = await query(
      'SELECT * FROM templates WHERE id = $1',
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template tidak ditemukan'
      });
    }

    const template = templateResult.rows[0];

    // Check if user can use premium template
    if (template.is_premium && req.user.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Template premium hanya tersedia untuk pengguna Pro dan Enterprise'
      });
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingProject = await query(
        'SELECT id FROM projects WHERE slug = $1',
        [slug]
      );
      
      if (existingProject.rows.length === 0) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create project from template
    const projectResult = await query(`
      INSERT INTO projects (user_id, title, description, template_id, content, slug)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userId,
      title || template.name,
      description || template.description,
      template.id,
      template.content,
      slug
    ]);

    res.status(201).json({
      success: true,
      message: 'Proyek berhasil dibuat dari template',
      data: { project: projectResult.rows[0] }
    });

  } catch (error) {
    console.error('Use template error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat proyek dari template'
    });
  }
});

// Helper function to get display name for categories
function getCategoryDisplayName(category) {
  const categoryNames = {
    'portfolio': 'Portfolio',
    'business': 'Bisnis',
    'ecommerce': 'E-commerce',
    'event': 'Event',
    'wedding': 'Undangan',
    'service': 'Jasa',
    'restaurant': 'Restoran',
    'blog': 'Blog',
    'landing': 'Landing Page',
    'corporate': 'Korporat'
  };
  
  return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

export default router;