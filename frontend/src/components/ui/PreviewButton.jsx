import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import Button from './Button';

const PreviewButton = ({ 
  project, 
  onPreview, 
  className = '',
  variant = 'outline' 
}) => {
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  const devices = [
    { id: 'desktop', name: 'Desktop', icon: Monitor, width: 1200 },
    { id: 'tablet', name: 'Tablet', icon: Tablet, width: 768 },
    { id: 'mobile', name: 'Mobile', icon: Smartphone, width: 375 }
  ];

  const handlePreview = (device = 'desktop') => {
    if (onPreview) {
      onPreview(device);
    } else {
      // Default preview behavior - open in new window
      const previewUrl = `/preview/${project.id}`;
      const deviceWidth = devices.find(d => d.id === device)?.width || 1200;
      const windowFeatures = `width=${deviceWidth + 100},height=800,scrollbars=yes,resizable=yes`;
      window.open(previewUrl, '_blank', windowFeatures);
    }
    setShowDeviceMenu(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <Button
          variant={variant}
          size="sm"
          icon={Eye}
          onClick={() => handlePreview('desktop')}
        >
          Preview
        </Button>
        
        {/* Device Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
            className="ml-1 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Device Menu */}
          {showDeviceMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]"
            >
              {devices.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => handlePreview(device.id)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{device.name}</span>
                  </button>
                );
              })}
              
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    if (project?.slug) {
                      window.open(`/p/${project.slug}`, '_blank');
                    }
                    setShowDeviceMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Open Live</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {showDeviceMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDeviceMenu(false)}
        />
      )}
    </div>
  );
};

export default PreviewButton;