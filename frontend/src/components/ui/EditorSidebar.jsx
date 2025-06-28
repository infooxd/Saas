import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Layers, 
  Settings, 
  Palette, 
  Type, 
  Image, 
  ChevronDown,
  ChevronRight,
  Search
} from 'lucide-react';
import Button from './Button';

const EditorSidebar = ({ 
  activeTab = 'blocks', 
  onTabChange, 
  onAddBlock, 
  selectedBlock, 
  onUpdateBlock,
  availableBlocks = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['basic', 'content']);

  const tabs = [
    { id: 'blocks', label: 'Blocks', icon: Layers },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const blockCategories = {
    basic: {
      name: 'Basic Sections',
      blocks: [
        { type: 'hero', name: 'Hero Section', description: 'Main banner with title and CTA', icon: '🎯' },
        { type: 'about', name: 'About', description: 'About us section', icon: '👤' },
        { type: 'contact', name: 'Contact', description: 'Contact form and info', icon: '📞' },
        { type: 'footer', name: 'Footer', description: 'Footer with links', icon: '📄' }
      ]
    },
    content: {
      name: 'Content Sections',
      blocks: [
        { type: 'services', name: 'Services', description: 'Services showcase', icon: '⚡' },
        { type: 'gallery', name: 'Gallery', description: 'Image gallery', icon: '🖼️' },
        { type: 'testimonials', name: 'Testimonials', description: 'Customer reviews', icon: '💬' },
        { type: 'products', name: 'Products', description: 'Product showcase', icon: '🛍️' }
      ]
    }
  };

  const filteredBlocks = Object.entries(blockCategories).reduce((acc, [categoryId, category]) => {
    const filtered = category.blocks.filter(block => 
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[categoryId] = { ...category, blocks: filtered };
    }
    return acc;
  }, {});

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddBlock = (blockType) => {
    const newBlock = {
      id: `${blockType}_${Date.now()}`,
      type: blockType,
      name: blockCategories.basic.blocks.find(b => b.type === blockType)?.name || 
             blockCategories.content.blocks.find(b => b.type === blockType)?.name || 
             blockType,
      visible: true,
      content: getDefaultContent(blockType)
    };
    onAddBlock && onAddBlock(newBlock);
  };

  const getDefaultContent = (type) => {
    const defaults = {
      hero: {
        title: 'Welcome to Our Website',
        subtitle: 'Create amazing experiences with our platform',
        buttonText: 'Get Started',
        backgroundImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'
      },
      about: {
        title: 'About Us',
        description: 'We are passionate about creating amazing digital experiences.',
        image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
      },
      services: {
        title: 'Our Services',
        services: [
          { name: 'Web Design', description: 'Beautiful and responsive websites' },
          { name: 'Development', description: 'Custom web applications' },
          { name: 'SEO', description: 'Search engine optimization' }
        ]
      },
      contact: {
        title: 'Contact Us',
        email: 'hello@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345'
      }
    };
    return defaults[type] || {};
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'blocks' && (
            <motion.div
              key="blocks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 space-y-4"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>

              {/* Block Categories */}
              <div className="space-y-3">
                {Object.entries(filteredBlocks).map(([categoryId, category]) => (
                  <div key={categoryId} className="space-y-2">
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-900">{category.name}</span>
                      {expandedCategories.includes(categoryId) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedCategories.includes(categoryId) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 pl-2"
                        >
                          {category.blocks.map((block) => (
                            <motion.button
                              key={block.type}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAddBlock(block.type)}
                              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl">{block.icon}</div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 group-hover:text-purple-700">
                                    {block.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {block.description}
                                  </p>
                                </div>
                                <Plus className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                              </div>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'design' && (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 space-y-4"
            >
              {selectedBlock ? (
                <BlockDesignPanel 
                  block={selectedBlock} 
                  onUpdate={onUpdateBlock}
                />
              ) : (
                <div className="text-center py-8">
                  <Palette className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select a block to edit its design</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 space-y-4"
            >
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Page Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      placeholder="Enter page title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      placeholder="Enter meta description"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Block Design Panel Component
const BlockDesignPanel = ({ block, onUpdate }) => {
  const [formData, setFormData] = useState(block.content || {});

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onUpdate && onUpdate(block.id, { ...block, content: newFormData });
  };

  const renderField = (field, value, type = 'text') => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
          />
        );
      case 'color':
        return (
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-lg"
          />
        );
      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder="Enter image URL"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            />
            {value && (
              <img src={value} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
            )}
          </div>
        );
      default:
        return (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
        <Type className="w-4 h-4" />
        <span>Edit {block.name}</span>
      </h3>

      <div className="space-y-4">
        {Object.entries(formData).map(([field, value]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            {field.includes('description') || field.includes('content') 
              ? renderField(field, value, 'textarea')
              : field.includes('color') 
              ? renderField(field, value, 'color')
              : field.includes('image') || field.includes('background')
              ? renderField(field, value, 'image')
              : renderField(field, value)
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebar;