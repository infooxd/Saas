# Oxdel - SaaS Builder Platform

Modern, scalable SaaS platform for building beautiful landing pages and websites without coding. Built with React, Express.js, and PostgreSQL/Supabase in a monorepo structure with complete authentication and user management system.

![Oxdel Preview](https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features Completed (Day 3)

### 🔐 Complete Authentication System
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Forgot password with email reset
- ✅ Password reset with token validation
- ✅ Protected routes and middleware

### 👤 User Dashboard & Profile Management
- ✅ Beautiful dashboard with user stats
- ✅ Profile editing with real-time validation
- ✅ Avatar upload with drag & drop
- ✅ Password change with strength indicator
- ✅ Responsive design with glassmorphism effects

### 🗄️ Database Migration to Supabase/PostgreSQL
- ✅ Complete schema migration from MySQL to PostgreSQL
- ✅ Row Level Security (RLS) policies
- ✅ Optimized indexes and triggers
- ✅ Sample data for templates

## 🏗️ Project Structure

```
oxdel-saas-builder/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Base UI components
│   │   │   └── layout/     # Layout components
│   │   ├── contexts/       # React contexts (AuthContext)
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   └── styles/         # CSS and styling
├── backend/                 # Express.js API server
│   ├── config/             # Database configuration
│   │   └── database.js     # PostgreSQL connection
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication endpoints
│   │   └── user.js         # User management endpoints
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # JWT authentication middleware
│   └── server.js           # Main server file
├── database/               # Database migrations and schemas
│   └── migrations/         # PostgreSQL migration files
│       ├── 001_create_users_table.sql
│       ├── 002_create_projects_table.sql
│       └── 003_create_templates_table.sql
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+ or Supabase account
- npm or yarn

### 1. Setup Supabase Database

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Database Migrations:**
   ```sql
   -- Copy and paste each migration file content into Supabase SQL Editor
   -- Run in order: 001, 002, 003
   ```

### 2. Installation & Configuration

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd oxdel-saas-builder
npm run install:all
```

2. **Configure backend environment:**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
# Supabase Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=7d

# Other configurations...
```

3. **Configure frontend environment:**
```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run frontend:dev  # Frontend on http://localhost:3000
npm run backend:dev   # Backend on http://localhost:5000
```

## 🧪 Testing Day 3 Features

### 1. Authentication Testing

**Register New User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com", 
    "password": "Password123"
  }'
```

**Login User:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 2. Dashboard & Profile Testing

1. **Access Dashboard:**
   - Register/login at http://localhost:3000
   - Should redirect to dashboard automatically
   - Check user stats, profile card, quick actions

2. **Test Profile Management:**
   - Click "Edit Profil" or navigate to `/profile`
   - Update name and email
   - Upload avatar (drag & drop or click to select)
   - Verify real-time validation

3. **Test Password Change:**
   - Go to "Ubah Password" tab in profile
   - Enter current password and new password
   - Check password strength indicator
   - Verify success/error messages

### 3. Database Connection Testing

**Check Health Endpoint:**
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123.456,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🗄️ Database Schema (PostgreSQL/Supabase)

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  plan VARCHAR(50) DEFAULT 'free',
  trial_expiry TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_expiry TIMESTAMP NULL,
  email_verified BOOLEAN DEFAULT false,
  avatar_url VARCHAR(500) NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Projects Table (Ready for Template System)
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  template_id VARCHAR(100),
  content JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  slug VARCHAR(255) UNIQUE NOT NULL,
  custom_domain VARCHAR(255) NULL,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Templates Table (Ready for Template System)
```sql
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  preview_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  content JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0.00,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 UI/UX Features Completed

### Dashboard Components
- **UserCard** - Elegant user info with plan status and trial countdown
- **StatsCard** - Animated statistics with gradient icons
- **Quick Actions** - Interactive buttons with hover effects
- **Responsive Grid** - Perfect layout on all devices

### Profile Management
- **Tabbed Interface** - Clean navigation between profile and password
- **Avatar Upload** - Drag & drop with preview and validation
- **Real-time Validation** - Instant feedback on all inputs
- **Password Strength** - Visual indicator with security tips
- **Loading States** - Beautiful animations throughout

### Design System
- **Glassmorphism** - Modern glass effect cards
- **Aurora Gradients** - Subtle animated backgrounds
- **Smooth Animations** - Framer Motion transitions
- **Mobile-First** - Responsive design for all devices

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with 12 salt rounds
- **Input Validation** - Server-side validation with express-validator
- **File Upload Security** - Type and size validation
- **Row Level Security** - Database-level access control
- **CORS Protection** - Configured for allowed origins

## ✅ Day 3 Checklist - COMPLETED

### ✅ Dashboard User
- [x] Halaman dashboard tampil data user, profil, status plan/trial/premium, avatar
- [x] Komponen UserCard, StatsCard, loading state, responsive, desain glassmorphism

### ✅ Profile Management
- [x] Edit profil: form nama/email, upload avatar (drag & drop, preview), validasi
- [x] Ganti password: form ubah password dengan validasi kuat/lemah, feedback sukses/gagal
- [x] Proteksi: hanya user login yang bisa akses/edit profil, middleware JWT di backend

### ✅ Integrasi State
- [x] State user diambil dari AuthContext, update otomatis setelah edit profil
- [x] Notifikasi animasi sukses/gagal di UI

### ✅ Database Supabase
- [x] Konversi/migrasi schema DB (users table, dsb) agar 100% kompatibel dengan Supabase/Postgres
- [x] Ubah sintaks: gunakan SERIAL untuk id, VARCHAR, TIMESTAMP, ENUM diganti tipe string
- [x] Contoh cara koneksi ke Supabase/Postgres dari backend Express
- [x] Contoh migrasi Supabase/Postgres SQL untuk tabel users, projects, templates

## 🐛 Known Issues & Fixes

### Fixed Issues:
- ✅ Database connection migrated from MySQL to PostgreSQL
- ✅ All SQL syntax updated for PostgreSQL compatibility
- ✅ File upload validation and error handling improved
- ✅ Avatar upload with proper file type checking
- ✅ Password validation with strength indicator
- ✅ Responsive design fixes for mobile devices

### No Current Bugs Found
All Day 3 features are working correctly and ready for production.

## 🎯 Ready for Next Phase

The system is now complete for Day 3 and ready for the template system implementation. All components are:

- ✅ **Modular** - Clean separation of concerns
- ✅ **Scalable** - Ready for additional features
- ✅ **Secure** - Production-ready security measures
- ✅ **Responsive** - Works on all devices
- ✅ **Database Ready** - PostgreSQL/Supabase integration complete

## 📞 Support

- 📧 Email: support@oxdel.com
- 💬 Discord: [Join our community](https://discord.gg/oxdel)
- 📚 Docs: [documentation.oxdel.com](https://documentation.oxdel.com)

---

**Day 3 Complete! Ready for Template System Implementation** 🚀

*All features tested and working perfectly with Supabase/PostgreSQL integration.*