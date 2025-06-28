import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Grid, List, ArrowLeft, Sparkles, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import TemplateCard from '../components/ui/TemplateCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import axios from 'axios';

const TemplatesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [alert, setAlert] = useState(null);

  // Fetch templates and categories
  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [activeCategory, searchQuery, showPremiumOnly]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (showPremiumOnly) {
        params.append('is_premium', 'true');
      }

      console.log('Fetching templates from:', `/api/templates?${params.toString()}`);
      const response = await axios.get(`/api/templates?${params.toString()}`);
      
      if (response.data.success) {
        setTemplates(response.data.data.templates);
      } else {
        setAlert({ type: 'error', message: 'Gagal memuat template' });
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      
      // More detailed error handling
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        setAlert({ 
          type: 'error', 
          message: 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000' 
        });
      } else if (error.response) {
        setAlert({ 
          type: 'error', 
          message: `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}` 
        });
      } else {
        setAlert({ 
          type: 'error', 
          message: `Terjadi kesalahan: ${error.message}` 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from:', '/api/templates/categories');
      const response = await axios.get('/api/templates/categories');
      
      if (response.data.success) {
        setCategories(response.data.data.categories);
      } else {
        console.error('Failed to fetch categories:', response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // More detailed error handling for categories
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error('Network error - backend may not be running');
        setAlert({ 
          type: 'warning', 
          message: 'Tidak dapat memuat kategori. Pastikan backend berjalan di http://localhost:5000' 
        });
      } else {
        console.error('Categories fetch error:', error.response?.data || error.message);
      }
      
      // Set default categories if fetch fails
      setCategories([
        { id: 'all', name: 'Semua Template', count: 0 },
        { id: 'portfolio', name: 'Portfolio', count: 0 },
        { id: 'business', name: 'Bisnis', count: 0 },
        { id: 'ecommerce', name: 'E-commerce', count: 0 },
        { id: 'event', name: 'Event', count: 0 }
      ]);
    }
  };

  const handleUseTemplate = async (template) => {
    if (!isAuthenticated) {
      setAlert({ 
        type: 'warning', 
        message: 'Silakan login terlebih dahulu untuk menggunakan template' 
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Check premium access
    if (template.is_premium && user?.plan === 'free') {
      setAlert({ 
        type: 'warning', 
        message: 'Template premium hanya tersedia untuk pengguna Pro dan Enterprise. Upgrade akun Anda!' 
      });
      return;
    }

    try {
      const response = await axios.post(`/api/templates/${template.id}/use`, {
        title: `${template.name} - Copy`,
        description: template.description
      });

      if (response.data.success) {
        setAlert({ 
          type: 'success', 
          message: 'Template berhasil digunakan! Mengarahkan ke editor...' 
        });
        
        // Redirect to editor (will be implemented later)
        setTimeout(() => {
          navigate(`/editor/${response.data.data.project.id}`);
        }, 1500);
      } else {
        setAlert({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      console.error('Error using template:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Gagal menggunakan template' 
      });
    }
  };

  const handlePreviewTemplate = (template) => {
    // Open preview in new tab
    if (template.preview_url) {
      window.open(template.preview_url, '_blank');
    } else {
      setAlert({ type: 'info', message: 'Preview tidak tersedia untuk template ini' });
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => navigate(-1)}
                className="p-2"
              >
                Kembali
              </Button>
            </div>
            
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center space-x-2 mb-4"
              >
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Galeri <span className="gradient-text">Template</span>
                </h1>
              </motion.div>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Pilih dari koleksi template premium kami untuk memulai proyek Anda
              </p>
            </div>
          </motion.div>

          {/* Alert */}
          {alert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Alert 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert(null)}
              />
            </motion.div>
          )}

          {/* Connection Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card-white p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {loading ? 'Menghubungkan ke server...' : 'Terhubung ke server'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                API: {import.meta.env.VITE_API_URL || 'http://localhost:5000'}
              </span>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card-white p-6 mb-8"
          >
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              showPremiumOnly={showPremiumOnly}
              onPremiumToggle={setShowPremiumOnly}
            />
          </motion.div>

          {/* View Mode Toggle & Results Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
          >
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="text-gray-600">
                {loading ? 'Memuat...' : `${filteredTemplates.length} template ditemukan`}
              </span>
              
              {user?.plan === 'free' && (
                <div className="flex items-center space-x-2 text-sm">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">
                    Upgrade ke Pro untuk akses template premium
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Tampilan:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Templates Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="glass-card-white p-6 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tidak ada template ditemukan
              </h3>
              <p className="text-gray-600 mb-6">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  setShowPremiumOnly(false);
                }}
              >
                Reset Filter
              </Button>
            </motion.div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 lg:grid-cols-2'
            }`}>
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TemplateCard
                    template={template}
                    onUse={handleUseTemplate}
                    onPreview={handlePreviewTemplate}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;