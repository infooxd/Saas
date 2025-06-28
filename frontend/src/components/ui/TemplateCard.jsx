import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Star, Crown, ArrowRight, Heart } from 'lucide-react';
import Button from './Button';

const TemplateCard = ({ template, onUse, onPreview }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleUseTemplate = () => {
    if (onUse) {
      onUse(template);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(template);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="glass-card-white group cursor-pointer overflow-hidden h-full flex flex-col"
    >
      {/* Template Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        
        <img
          src={template.thumbnail_url || template.preview_url}
          alt={template.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400&h=300';
            setImageLoaded(true);
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              icon={Eye}
              onClick={handlePreview}
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
            >
              Preview
            </Button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isLiked 
                  ? 'bg-red-500/80 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Premium Badge */}
        {template.is_premium && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              <Crown className="w-3 h-3" />
              <span>Premium</span>
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            {getCategoryDisplayName(template.category)}
          </span>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:gradient-text transition-all duration-300 line-clamp-2">
              {template.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center space-x-1 ml-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">4.8</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {template.description}
          </p>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="text-gray-400 text-xs px-2 py-1">
                  +{template.tags.length - 3} lagi
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(template.price)}
            </span>
            {template.is_premium && (
              <span className="text-xs text-gray-500">Sekali bayar</span>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={handleUseTemplate}
            className="group-hover:scale-105 transition-transform"
          >
            Gunakan
          </Button>
        </div>
      </div>

      {/* Hover Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

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

export default TemplateCard;