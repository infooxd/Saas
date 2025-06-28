import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/projects - Get user's projects with search and filter
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, limit = 12, offset = 0, sort_by = 'updated_at', sort_order = 'desc' } = req.query;
    const userId = req.user.id;

    let sqlQuery = `
      SELECT id, title, description, template_id, status, slug, 
             custom_domain, published_at, created_at, updated_at,
             COALESCE(is_favorite, false) as is_favorite,
             COALESCE(views, 0) as views
      FROM projects 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    // Add status filter
    if (status && status !== 'all') {
      sqlQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      sqlQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting
    const validSortColumns = ['updated_at', 'created_at', 'title', 'status'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'updated_at';
    const sortDirection = validSortOrders.includes(sort_order) ? sort_order : 'desc';
    
    sqlQuery += ` ORDER BY ${sortColumn} ${sortDirection.toUpperCase()}`;
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(sqlQuery, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM projects WHERE user_id = $1';
    const countParams = [userId];
    let countParamIndex = 2;

    if (status && status !== 'all') {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        projects: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil proyek'
    });
  }
});

// GET /api/projects/:id - Get project detail
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: { project: result.rows[0] }
    });

  } catch (error) {
    console.error('Get project detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail proyek'
    });
  }
});

// GET /api/projects/:id/analytics - Get project analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;
    const userId = req.user.id;

    // Verify project ownership
    const projectResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan'
      });
    }

    const project = projectResult.rows[0];

    // Calculate date range based on period
    const getDaysFromPeriod = (period) => {
      switch (period) {
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        case '1y': return 365;
        default: return 30;
      }
    };

    const days = getDaysFromPeriod(period);

    // Generate mock analytics data (in real implementation, this would come from actual tracking)
    const analytics = generateProjectAnalytics(project, days);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get project analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil analytics proyek'
    });
  }
});

// Helper function to generate comprehensive project analytics
function generateProjectAnalytics(project, days) {
  const baseViews = project.views || 0;
  const dailyAverage = Math.max(Math.floor(baseViews / 30), 1);
  
  // Generate time series data
  const viewsData = [];
  const clicksData = [];
  const conversionsData = [];
  
  let totalViews = 0;
  let totalClicks = 0;
  let totalConversions = 0;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic daily values
    const dayViews = Math.floor(dailyAverage * (Math.random() * 0.6 + 0.7));
    const dayClicks = Math.floor(dayViews * (Math.random() * 0.15 + 0.05));
    const dayConversions = Math.floor(dayClicks * (Math.random() * 0.1 + 0.02));
    
    totalViews += dayViews;
    totalClicks += dayClicks;
    totalConversions += dayConversions;
    
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    viewsData.push({ label, value: dayViews, date: date.toISOString() });
    clicksData.push({ label, value: dayClicks, date: date.toISOString() });
    conversionsData.push({ label, value: dayConversions, date: date.toISOString() });
  }

  // Calculate previous period for comparison
  const previousViews = Math.floor(totalViews * (Math.random() * 0.3 + 0.7));
  const previousClicks = Math.floor(totalClicks * (Math.random() * 0.3 + 0.7));
  const previousShares = Math.floor(totalViews * 0.03);
  const previousConversions = Math.floor(totalConversions * (Math.random() * 0.3 + 0.7));

  // Traffic sources
  const trafficSources = [
    { label: 'Direct', value: Math.floor(totalViews * 0.4) },
    { label: 'Social Media', value: Math.floor(totalViews * 0.25) },
    { label: 'Search Engines', value: Math.floor(totalViews * 0.2) },
    { label: 'Referrals', value: Math.floor(totalViews * 0.15) }
  ];

  // Device types
  const deviceTypes = [
    { label: 'Desktop', value: Math.floor(totalViews * 0.55) },
    { label: 'Mobile', value: Math.floor(totalViews * 0.35) },
    { label: 'Tablet', value: Math.floor(totalViews * 0.1) }
  ];

  // Top pages (based on project content)
  const topPages = [
    { path: '/', views: Math.floor(totalViews * 0.5), title: 'Home Page' },
    { path: '/about', views: Math.floor(totalViews * 0.2), title: 'About' },
    { path: '/services', views: Math.floor(totalViews * 0.15), title: 'Services' },
    { path: '/contact', views: Math.floor(totalViews * 0.1), title: 'Contact' },
    { path: '/portfolio', views: Math.floor(totalViews * 0.05), title: 'Portfolio' }
  ];

  return {
    overview: {
      totalViews,
      previousViews,
      totalClicks,
      previousClicks,
      totalShares: Math.floor(totalViews * 0.04),
      previousShares,
      conversionRate: totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(2) : 0,
      previousConversionRate: totalViews > 0 ? ((previousConversions / previousViews) * 100).toFixed(2) : 0,
      avgSessionDuration: `${Math.floor(Math.random() * 3 + 1)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      bounceRate: `${(Math.random() * 30 + 35).toFixed(1)}%`,
      uniqueVisitors: Math.floor(totalViews * 0.75),
      returningVisitors: Math.floor(totalViews * 0.25),
      pageLoadTime: `${(Math.random() * 2 + 1).toFixed(2)}s`,
      mobileTraffic: `${(Math.random() * 20 + 30).toFixed(1)}%`
    },
    charts: {
      views: viewsData,
      clicks: clicksData,
      conversions: conversionsData,
      trafficSources,
      deviceTypes
    },
    topPages
  };
}

// POST /api/projects - Create new project
router.post('/', [
  authenticateToken,
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Judul proyek wajib diisi dan maksimal 255 karakter'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Deskripsi maksimal 1000 karakter'),
  body('template_id')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Template ID tidak valid')
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

    const { title, description, template_id, content } = req.body;
    const userId = req.user.id;

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

    // Create project
    const result = await query(`
      INSERT INTO projects (user_id, title, description, template_id, content, slug)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userId,
      title,
      description || null,
      template_id || null,
      content || {},
      slug
    ]);

    res.status(201).json({
      success: true,
      message: 'Proyek berhasil dibuat',
      data: { project: result.rows[0] }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat proyek'
    });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', [
  authenticateToken,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Judul proyek maksimal 255 karakter'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Deskripsi maksimal 1000 karakter'),
  body('content')
    .optional()
    .isObject()
    .withMessage('Content harus berupa object JSON'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status tidak valid')
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

    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, content, status } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      values.push(JSON.stringify(content));
      paramIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
      
      // Set published_at if status is published
      if (status === 'published') {
        updates.push(`published_at = NOW()`);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, userId);

    const updateQuery = `
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    res.json({
      success: true,
      message: 'Proyek berhasil diperbarui',
      data: { project: result.rows[0] }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui proyek'
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Proyek berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus proyek'
    });
  }
});

// POST /api/projects/:id/clone - Clone project
router.post('/:id/clone', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get original project
    const originalProject = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (originalProject.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan'
      });
    }

    const project = originalProject.rows[0];

    // Generate unique title and slug for clone
    const baseTitle = `${project.title} - Copy`;
    let cloneTitle = baseTitle;
    let counter = 1;

    while (true) {
      const existingTitle = await query(
        'SELECT id FROM projects WHERE title = $1 AND user_id = $2',
        [cloneTitle, userId]
      );
      
      if (existingTitle.rows.length === 0) break;
      
      cloneTitle = `${baseTitle} ${counter}`;
      counter++;
    }

    // Generate unique slug
    const baseSlug = cloneTitle.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    let slug = baseSlug;
    counter = 1;
    
    while (true) {
      const existingProject = await query(
        'SELECT id FROM projects WHERE slug = $1',
        [slug]
      );
      
      if (existingProject.rows.length === 0) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create cloned project
    const result = await query(`
      INSERT INTO projects (user_id, title, description, template_id, content, slug, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      userId,
      cloneTitle,
      project.description,
      project.template_id,
      project.content,
      slug,
      'draft' // Always create clones as draft
    ]);

    res.status(201).json({
      success: true,
      message: 'Proyek berhasil di-clone',
      data: { project: result.rows[0] }
    });

  } catch (error) {
    console.error('Clone project error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat meng-clone proyek'
    });
  }
});

// PATCH /api/projects/:id/favorite - Toggle favorite status
router.patch('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if project exists and belongs to user
    const existingProject = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan'
      });
    }

    // Toggle favorite status
    const currentFavorite = existingProject.rows[0].is_favorite || false;
    const newFavorite = !currentFavorite;

    const result = await query(`
      UPDATE projects 
      SET is_favorite = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [newFavorite, id, userId]);

    res.json({
      success: true,
      message: newFavorite ? 'Proyek ditambahkan ke favorit' : 'Proyek dihapus dari favorit',
      data: { project: result.rows[0] }
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah status favorit'
    });
  }
});

// GET /api/projects/:id/preview - Get project preview (no auth required for published projects)
router.get('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT title, description, content, published_at, status FROM projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan'
      });
    }

    const project = result.rows[0];

    // For preview, allow both published and draft projects
    // This is used for editor preview functionality
    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Get project preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil preview proyek'
    });
  }
});

// GET /api/projects/slug/:slug - Get public project by slug (no auth required)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      'SELECT title, description, content, published_at FROM projects WHERE slug = $1 AND status = $2',
      [slug, 'published']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan atau belum dipublikasi'
      });
    }

    // Increment view count
    await query(
      'UPDATE projects SET views = COALESCE(views, 0) + 1 WHERE slug = $1',
      [slug]
    );

    res.json({
      success: true,
      data: { project: result.rows[0] }
    });

  } catch (error) {
    console.error('Get public project error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil proyek publik'
    });
  }
});

// GET /api/projects/slug/:slug/preview - Get public project preview by slug (no auth required)
router.get('/slug/:slug/preview', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      'SELECT title, description, content, published_at FROM projects WHERE slug = $1 AND status = $2',
      [slug, 'published']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan atau belum dipublikasi'
      });
    }

    res.json({
      success: true,
      data: { project: result.rows[0] }
    });

  } catch (error) {
    console.error('Get public project preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil preview proyek publik'
    });
  }
});

export default router;