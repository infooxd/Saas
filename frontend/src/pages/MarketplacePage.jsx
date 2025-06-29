import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Star, 
  Download, 
  Crown,
  Grid,
  List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import TemplateCard from '../components/ui/TemplateCard';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import axios from 'axios';

const MarketplacePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState('grid');
  const [alert, setAlert] = useState(null);

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'business', name: 'Business' },
    { id: 'portfolio', name: 'Portfolio' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'event', name: 'Event' },
    { id: 'service', name: 'Service' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Newest' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price', label: 'Price: Low to High' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sort_by', sortBy);

      const response = await axios.get(`/api/marketplace/templates?${params.toString()}`);
      
      if (response.data.success) {
        setTemplates(response.data.data.templates);
      } else {
        setAlert({ type: 'error', message: 'Failed to load templates' });
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to load templates' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTemplate = async (template) => {
    if (!isAuthenticated) {
      setAlert({ 
        type: 'warning', 
        message: 'Please login to purchase templates' 
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      const response = await axios.post(`/api/marketplace/templates/${template.id}/purchase`);
      
      if (response.data.success) {
        setAlert({ 
          type: 'success', 
          message: 'Template purchased successfully!' 
        });
        
        // Create project from purchased template
        setTimeout(() => {
          navigate(`/editor/new?template=${template.id}`);
        }, 1500);
      } else {
        setAlert({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      console.error('Error purchasing template:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to purchase template' 
      });
    }
  };

  const handlePreviewTemplate = (template) => {
    if (template.preview_url) {
      window.open(template.preview_url, '_blank');
    } else {
      setAlert({ type: 'info', message: 'Preview not available for this template' });
    }
  };

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
          {/* Alert */}
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert(null)}
              />
            </motion.div>
          )}

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
                Back
              </Button>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Template <span className="gradient-text">Marketplace</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover premium templates created by our community
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card-white p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Sort & View */}
              <div className="flex items-center space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

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
          ) : templates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Crown className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters
              </p>
            </motion.div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 lg:grid-cols-2'
            }`}>
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="glass-card-white group cursor-pointer overflow-hidden h-full flex flex-col">
                    {/* Template Preview */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={template.thumbnail_url || template.preview_url}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewTemplate(template)}
                            className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                          >
                            Preview
                          </Button>
                          <div className="flex items-center space-x-1 text-white text-sm">
                            <Download className="w-4 h-4" />
                            <span>{template.downloads}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:gradient-text transition-all duration-300">
                          {template.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{template.rating || '5.0'}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-gray-900">
                            ${template.price}
                          </span>
                          <span className="text-xs text-gray-500">by {template.creator_name}</span>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePurchaseTemplate(template)}
                        >
                          Purchase
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;