import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/overview - Get user's overall analytics
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.user.id;

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
    
    // Get user's projects analytics summary
    const projectsResult = await query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_projects,
        SUM(COALESCE(views, 0)) as total_views,
        AVG(COALESCE(views, 0)) as avg_views_per_project
      FROM projects 
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
    `, [userId]);

    // Get views trend (mock data for now)
    const viewsTrend = generateMockTrendData(days, 'views');
    const clicksTrend = generateMockTrendData(days, 'clicks');
    
    // Get top performing projects
    const topProjectsResult = await query(`
      SELECT id, title, slug, views, status, updated_at
      FROM projects 
      WHERE user_id = $1 AND status = 'published'
      ORDER BY views DESC 
      LIMIT 5
    `, [userId]);

    const analytics = {
      overview: {
        totalProjects: parseInt(projectsResult.rows[0].total_projects) || 0,
        publishedProjects: parseInt(projectsResult.rows[0].published_projects) || 0,
        totalViews: parseInt(projectsResult.rows[0].total_views) || 0,
        avgViewsPerProject: parseFloat(projectsResult.rows[0].avg_views_per_project) || 0,
        period: period
      },
      trends: {
        views: viewsTrend,
        clicks: clicksTrend
      },
      topProjects: topProjectsResult.rows
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil analytics overview'
    });
  }
});

// GET /api/projects/:id/analytics - Get specific project analytics
router.get('/projects/:id', authenticateToken, async (req, res) => {
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

// Helper function to generate mock trend data
function generateMockTrendData(days, type = 'views') {
  const data = [];
  const baseValue = type === 'views' ? 100 : 20;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic trend with some randomness
    const trend = Math.sin((days - i) / days * Math.PI) * 0.5 + 0.5;
    const randomFactor = Math.random() * 0.4 + 0.8;
    const value = Math.floor(baseValue * trend * randomFactor);
    
    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(value, 0)
    });
  }
  
  return data;
}

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

  // Geographic data
  const geographicData = [
    { label: 'Indonesia', value: Math.floor(totalViews * 0.6) },
    { label: 'United States', value: Math.floor(totalViews * 0.15) },
    { label: 'Singapore', value: Math.floor(totalViews * 0.1) },
    { label: 'Malaysia', value: Math.floor(totalViews * 0.08) },
    { label: 'Others', value: Math.floor(totalViews * 0.07) }
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
      deviceTypes,
      geographic: geographicData
    },
    topPages,
    realTimeData: {
      activeUsers: Math.floor(Math.random() * 20 + 5),
      currentPageViews: Math.floor(Math.random() * 10 + 2),
      topActivePages: topPages.slice(0, 3)
    },
    socialMetrics: {
      shares: Math.floor(totalViews * 0.04),
      likes: Math.floor(totalViews * 0.06),
      comments: Math.floor(totalViews * 0.02),
      socialTraffic: Math.floor(totalViews * 0.25)
    }
  };
}

export default router;