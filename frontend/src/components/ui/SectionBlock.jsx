import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const SectionBlock = ({ 
  block, 
  isSelected = false, 
  onSelect, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  isDragging = false,
  dragHandleProps = {}
}) => {
  const getSectionIcon = (type) => {
    const icons = {
      hero: '🎯',
      about: '👤',
      services: '⚡',
      gallery: '🖼️',
      products: '🛍️',
      testimonials: '💬',
      contact: '📞',
      footer: '📄'
    };
    return icons[type] || '📄';
  };

  const getSectionColor = (type) => {
    const colors = {
      hero: 'from-purple-500 to-pink-500',
      about: 'from-blue-500 to-cyan-500',
      services: 'from-green-500 to-emerald-500',
      gallery: 'from-yellow-500 to-orange-500',
      products: 'from-red-500 to-pink-500',
      testimonials: 'from-indigo-500 to-purple-500',
      contact: 'from-teal-500 to-blue-500',
      footer: 'from-gray-500 to-slate-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative group cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'ring-2 ring-purple-500 shadow-lg' 
          : 'hover:shadow-md'
        }
        ${isDragging ? 'opacity-50 rotate-2' : ''}
        ${!block.visible ? 'opacity-60' : ''}
      `}
      onClick={() => onSelect && onSelect(block)}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Block Content */}
      <div className="glass-card-white p-4 pl-8 rounded-xl border-l-4 border-transparent hover:border-purple-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Section Icon */}
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getSectionColor(block.type)} flex items-center justify-center text-white text-lg`}>
              {getSectionIcon(block.type)}
            </div>
            
            {/* Section Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 capitalize">
                {block.name || block.type}
              </h4>
              <p className="text-sm text-gray-500">
                {block.description || `${block.type} section`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility && onToggleVisibility(block);
              }}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              title={block.visible ? 'Hide section' : 'Show section'}
            >
              {block.visible ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(block);
              }}
              className="p-1.5 rounded-md hover:bg-blue-100 transition-colors"
              title="Edit section"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(block);
              }}
              className="p-1.5 rounded-md hover:bg-red-100 transition-colors"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Block Preview */}
        {block.content && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md">
            <div className="text-xs text-gray-600 line-clamp-2">
              {typeof block.content === 'string' 
                ? block.content 
                : JSON.stringify(block.content).substring(0, 100) + '...'
              }
            </div>
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          layoutId="selection-indicator"
          className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.div>
  );
};

export default SectionBlock;