import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

const CategoryFilter = ({ 
  categories = [], 
  activeCategory = 'all', 
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
  showPremiumOnly = false,
  onPremiumToggle
}) => {
  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const clearSearch = () => {
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari template..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        {/* Category Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Kategori:</span>
        </div>

        {/* Premium Toggle */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPremiumOnly}
              onChange={(e) => onPremiumToggle && onPremiumToggle(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Premium saja</span>
          </label>
        </div>
      </motion.div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap gap-2 sm:gap-3"
      >
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2
              ${activeCategory === category.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }
            `}
          >
            <span>{category.name}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs
              ${activeCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {category.count}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Active Filters Summary */}
      {(searchQuery || showPremiumOnly || activeCategory !== 'all') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200"
        >
          <span className="text-sm text-gray-600">Filter aktif:</span>
          
          {activeCategory !== 'all' && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs flex items-center space-x-1">
              <span>Kategori: {categories.find(c => c.id === activeCategory)?.name}</span>
              <button
                onClick={() => handleCategoryClick('all')}
                className="hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {searchQuery && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs flex items-center space-x-1">
              <span>Pencarian: "{searchQuery}"</span>
              <button
                onClick={clearSearch}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {showPremiumOnly && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs flex items-center space-x-1">
              <span>Premium saja</span>
              <button
                onClick={() => onPremiumToggle && onPremiumToggle(false)}
                className="hover:text-yellow-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CategoryFilter;