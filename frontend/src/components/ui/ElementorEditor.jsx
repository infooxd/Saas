import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Image, 
  Type, 
  Link, 
  Palette, 
  Eye, 
  Save,
  Upload,
  X,
  Check,
  Settings,
  MessageCircle,
  Phone
} from 'lucide-react';
import Button from './Button';
import axios from 'axios';

const ElementorEditor = ({ 
  blocks = [], 
  onUpdateBlocks, 
  onSave,
  saving = false,
  projectId 
}) => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [floatingContacts, setFloatingContacts] = useState({
    whatsapp: { enabled: false, number: '', message: 'Hello! I\'m interested in your services.' },
    telegram: { enabled: false, username: '' }
  });

  const handleBlockUpdate = (blockId, field, value) => {
    const updatedBlocks = blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          content: {
            ...block.content,
            [field]: value
          }
        };
      }
      return block;
    });
    onUpdateBlocks(updatedBlocks);
  };

  const handleImageUpload = async (blockId, field, file) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/upload/block', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        handleBlockUpdate(blockId, field, response.data.data.url);
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const renderBlockEditor = (block) => {
    const { type, content } = block;

    switch (type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Hero Section</span>
            </h3>
            
            {/* Title Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                placeholder="Enter hero title"
              />
            </div>

            {/* Subtitle Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                value={content.subtitle || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'subtitle', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                placeholder="Enter hero subtitle"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={content.buttonText || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                placeholder="Enter button text"
              />
            </div>

            {/* Button URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button URL</label>
              <input
                type="url"
                value={content.buttonUrl || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'buttonUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                placeholder="https://wa.me/6281234567890 or any URL"
              />
            </div>

            {/* Background Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
              <div className="space-y-2">
                {content.backgroundImage && (
                  <img 
                    src={content.backgroundImage} 
                    alt="Background" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(block.id, 'backgroundImage', e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>About Section</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={content.description || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'description', e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <div className="space-y-2">
                {content.image && (
                  <img 
                    src={content.image} 
                    alt="About" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(block.id, 'image', e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Services Section</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
              {(content.services || []).map((service, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <input
                    type="text"
                    value={service.name || ''}
                    onChange={(e) => {
                      const newServices = [...(content.services || [])];
                      newServices[index] = { ...service, name: e.target.value };
                      handleBlockUpdate(block.id, 'services', newServices);
                    }}
                    placeholder="Service name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                  <textarea
                    value={service.description || ''}
                    onChange={(e) => {
                      const newServices = [...(content.services || [])];
                      newServices[index] = { ...service, description: e.target.value };
                      handleBlockUpdate(block.id, 'services', newServices);
                    }}
                    placeholder="Service description"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newServices = [...(content.services || []), { name: '', description: '' }];
                  handleBlockUpdate(block.id, 'services', newServices);
                }}
              >
                Add Service
              </Button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Contact Section</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={content.email || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={content.phone || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                placeholder="+62 812 3456 7890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={content.address || ''}
                onChange={(e) => handleBlockUpdate(block.id, 'address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Select a block to edit its content</p>
          </div>
        );
    }
  };

  const renderFloatingContactEditor = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
        <MessageCircle className="w-4 h-4" />
        <span>Floating Contact Buttons</span>
      </h3>

      {/* WhatsApp */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="font-medium text-gray-900">WhatsApp</label>
          <input
            type="checkbox"
            checked={floatingContacts.whatsapp.enabled}
            onChange={(e) => setFloatingContacts(prev => ({
              ...prev,
              whatsapp: { ...prev.whatsapp, enabled: e.target.checked }
            }))}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
        </div>
        
        {floatingContacts.whatsapp.enabled && (
          <div className="space-y-3">
            <input
              type="tel"
              value={floatingContacts.whatsapp.number}
              onChange={(e) => setFloatingContacts(prev => ({
                ...prev,
                whatsapp: { ...prev.whatsapp, number: e.target.value }
              }))}
              placeholder="6281234567890 (without +)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              value={floatingContacts.whatsapp.message}
              onChange={(e) => setFloatingContacts(prev => ({
                ...prev,
                whatsapp: { ...prev.whatsapp, message: e.target.value }
              }))}
              placeholder="Default WhatsApp message"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Telegram */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="font-medium text-gray-900">Telegram</label>
          <input
            type="checkbox"
            checked={floatingContacts.telegram.enabled}
            onChange={(e) => setFloatingContacts(prev => ({
              ...prev,
              telegram: { ...prev.telegram, enabled: e.target.checked }
            }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        
        {floatingContacts.telegram.enabled && (
          <input
            type="text"
            value={floatingContacts.telegram.username}
            onChange={(e) => setFloatingContacts(prev => ({
              ...prev,
              telegram: { ...prev.telegram, username: e.target.value }
            }))}
            placeholder="username (without @)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        )}
      </div>
    </div>
  );

  const renderBlockPreview = (block) => {
    const { type, content } = block;
    
    switch (type) {
      case 'hero':
        return (
          <div 
            className="relative h-96 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white cursor-pointer"
            style={{ 
              backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={() => setSelectedBlock(block)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative text-center space-y-4 px-4">
              <h1 className="text-4xl font-bold">{content.title || 'Hero Title'}</h1>
              <p className="text-xl opacity-90">{content.subtitle || 'Hero subtitle'}</p>
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {content.buttonText || 'Get Started'}
              </button>
            </div>
            {selectedBlock?.id === block.id && (
              <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                Editing
              </div>
            )}
          </div>
        );
      
      case 'about':
        return (
          <div 
            className="py-16 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setSelectedBlock(block)}
          >
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.title || 'About Us'}</h2>
                <p className="text-gray-600 leading-relaxed">{content.description || 'About description'}</p>
              </div>
              {content.image && (
                <img src={content.image} alt="About" className="rounded-lg shadow-lg" />
              )}
            </div>
            {selectedBlock?.id === block.id && (
              <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                Editing
              </div>
            )}
          </div>
        );
      
      case 'services':
        return (
          <div 
            className="py-16 px-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setSelectedBlock(block)}
          >
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">{content.title || 'Our Services'}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {(content.services || []).map((service, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
            {selectedBlock?.id === block.id && (
              <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                Editing
              </div>
            )}
          </div>
        );
      
      case 'contact':
        return (
          <div 
            className="py-16 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setSelectedBlock(block)}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{content.title || 'Contact Us'}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-gray-600">{content.email || 'email@example.com'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-gray-600">{content.phone || '+1 (555) 123-4567'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-gray-600">{content.address || '123 Main St, City'}</p>
                </div>
              </div>
            </div>
            {selectedBlock?.id === block.id && (
              <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                Editing
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="py-16 px-4 bg-gray-100 text-center">
            <h3 className="text-xl font-semibold text-gray-700">{block.name}</h3>
            <p className="text-gray-500">Preview for {type} section</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Block Editor */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Page Editor</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={Eye}
                onClick={() => setPreviewMode(!previewMode)}
                className={previewMode ? 'bg-purple-100 text-purple-700' : ''}
              >
                Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Save}
                loading={saving}
                onClick={onSave}
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedBlock ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Edit Block</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => setSelectedBlock(null)}
                />
              </div>
              {renderBlockEditor(selectedBlock)}
            </div>
          ) : (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Page Settings</h3>
              {renderFloatingContactEditor()}
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Click on any section in the preview to edit its content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="min-h-screen bg-white relative">
          {blocks.map((block) => (
            <div key={block.id} className="relative">
              {renderBlockPreview(block)}
            </div>
          ))}

          {/* Floating Contact Buttons */}
          <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
            {floatingContacts.whatsapp.enabled && floatingContacts.whatsapp.number && (
              <a
                href={`https://wa.me/${floatingContacts.whatsapp.number}?text=${encodeURIComponent(floatingContacts.whatsapp.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
            )}
            
            {floatingContacts.telegram.enabled && floatingContacts.telegram.username && (
              <a
                href={`https://t.me/${floatingContacts.telegram.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
              >
                <Phone className="w-6 h-6" />
              </a>
            )}
          </div>

          {blocks.length === 0 && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No blocks yet
                </h3>
                <p className="text-gray-500">
                  This template doesn't have any content blocks
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElementorEditor;