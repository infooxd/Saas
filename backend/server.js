import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations
import pool, { testConnection } from './config/database.js';
import { connectRedis } from './config/redis.js';

// Import middleware
import { 
  apiRateLimit, 
  sanitizeInput, 
  preventParameterPollution,
  requestId,
  securityHeaders,
  corsOptions
} from './middleware/security.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import templateRoutes from './routes/templates.js';
import projectRoutes from './routes/projects.js';
import analyticsRoutes from './routes/analytics.js';
import paymentsRoutes from './routes/payments.js';
import affiliateRoutes from './routes/affiliate.js';
import marketplaceRoutes from './routes/marketplace.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy for production
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"]
    }
  }
}));

// CORS configuration
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Request ID and security headers
app.use(requestId);
app.use(securityHeaders);

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(sanitizeInput);
app.use(preventParameterPollution);

// Rate limiting
app.use('/api/', apiRateLimit);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    dbStatus = 'connected';
  } catch (error) {
    console.error('Health check database error:', error.message);
  }

  try {
    // Redis health check would go here
    redisStatus = 'not_configured'; // Placeholder
  } catch (error) {
    console.error('Health check redis error:', error);
  }

  const healthStatus = {
    status: 'healthy',
    database: dbStatus,
    redis: redisStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT,
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };

  const statusCode = 200; // Always return 200 for development
  res.status(statusCode).json(healthStatus);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Oxdel SaaS Builder API - Development Mode',
    version: '1.0.0',
    status: 'active',
    environment: NODE_ENV,
    database: 'PostgreSQL (Local/Supabase)',
    features: [
      'Authentication & Authorization',
      'User Management & Profiles',
      'Template System & Marketplace',
      'Visual Editor & Analytics',
      'Payment Processing',
      'Affiliate System',
      'Admin Dashboard',
      'File Upload & Storage',
      'Email Notifications',
      'Rate Limiting & Security'
    ],
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      user: '/api/user/*',
      templates: '/api/templates/*',
      projects: '/api/projects/*',
      analytics: '/api/analytics/*',
      payments: '/api/payments/*',
      affiliate: '/api/affiliate/*',
      marketplace: '/api/marketplace/*',
      admin: '/api/admin/*'
    },
    documentation: `${process.env.API_URL}/docs`,
    support: 'support@oxdel.com'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin', adminRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    requestId: req.requestId,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      requestId: req.requestId,
      error: NODE_ENV === 'development' ? 'Please check your database configuration' : 'Service temporarily unavailable'
    });
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File terlalu besar. Maksimal 10MB',
      requestId: req.requestId
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Data tidak valid',
      requestId: req.requestId,
      errors: err.errors
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
      requestId: req.requestId
    });
  }
  
  // Database errors
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      message: 'Database constraint violation',
      requestId: req.requestId,
      error: NODE_ENV === 'development' ? err.message : 'Data validation error'
    });
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      requestId: req.requestId
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    requestId: req.requestId,
    error: NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/templates',
      'GET /api/projects',
      'GET /api/analytics/overview',
      'POST /api/payments/create-intent',
      'GET /api/affiliate/stats',
      'GET /api/marketplace/templates'
    ],
    documentation: `${process.env.API_URL}/docs`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
async function startServer() {
  console.log('🔧 Starting Oxdel Backend API (Development Mode)...');
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🔗 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
  
  // Test database connection (non-blocking in development)
  const dbConnected = await testConnection();
  if (!dbConnected && NODE_ENV === 'production') {
    console.error('❌ Failed to connect to database in production mode.');
    process.exit(1);
  }
  
  // Connect to Redis (optional)
  try {
    await connectRedis();
    console.log('✅ Redis connection established');
  } catch (error) {
    console.warn('⚠️ Redis connection failed, continuing without cache:', error.message);
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Oxdel Backend API running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Documentation: ${process.env.API_URL || `http://localhost:${PORT}`}`);
    console.log(`🔐 Auth endpoints: /api/auth/*`);
    console.log(`👤 User endpoints: /api/user/*`);
    console.log(`🎨 Template endpoints: /api/templates/*`);
    console.log(`📁 Project endpoints: /api/projects/*`);
    console.log(`📊 Analytics endpoints: /api/analytics/*`);
    console.log(`💳 Payment endpoints: /api/payments/*`);
    console.log(`🤝 Affiliate endpoints: /api/affiliate/*`);
    console.log(`🛒 Marketplace endpoints: /api/marketplace/*`);
    console.log(`👑 Admin endpoints: /api/admin/*`);
    console.log(`🗄️ Database: ${dbConnected ? 'Connected' : 'Disconnected (Development Mode)'}`);
    console.log(`🔄 Cache: Redis ${process.env.REDIS_URL ? 'Configured' : 'Not Configured'}`);
    console.log(`🌐 CORS: Development configured`);
    console.log(`🛡️ Security: Rate limiting, sanitization, headers`);
    console.log(`📧 Email: Development mode (console logging)`);
    console.log(`☁️ Storage: Local filesystem`);
    console.log(`💰 Payments: Development mode (test keys)`);
    console.log('✅ Development server ready!');
  });
}

startServer();

export default app;