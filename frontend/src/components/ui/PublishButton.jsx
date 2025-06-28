import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Copy, Check, Share2, ExternalLink, Settings } from 'lucide-react';
import Button from './Button';
import Alert from './Alert';

const PublishButton = ({ 
  project, 
  onPublish, 
  onUnpublish, 
  loading = false,
  className = '' 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alert, setAlert] = useState(null);

  const isPublished = project?.status === 'published';
  const publicUrl = project?.slug ? `${window.location.origin}/p/${project.slug}` : null;

  const handlePublish = async () => {
    try {
      const result = await onPublish();
      if (result.success) {
        setAlert({ type: 'success', message: 'Project published successfully!' });
        setShowModal(true);
      } else {
        setAlert({ type: 'error', message: result.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to publish project' });
    }
  };

  const handleUnpublish = async () => {
    try {
      const result = await onUnpublish();
      if (result.success) {
        setAlert({ type: 'success', message: 'Project unpublished successfully!' });
        setShowModal(false);
      } else {
        setAlert({ type: 'error', message: result.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to unpublish project' });
    }
  };

  const copyToClipboard = async () => {
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const shareProject = () => {
    if (navigator.share && publicUrl) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: publicUrl,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      {/* Alert */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)}
          />
        </motion.div>
      )}

      {/* Publish Button */}
      <div className={`flex items-center space-x-2 ${className}`}>
        {isPublished ? (
          <>
            <Button
              variant="outline"
              size="sm"
              icon={Globe}
              onClick={() => setShowModal(true)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Published
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={ExternalLink}
              onClick={() => window.open(publicUrl, '_blank')}
              title="Open in new tab"
            />
          </>
        ) : (
          <Button
            variant="primary"
            size="sm"
            icon={Globe}
            loading={loading}
            onClick={handlePublish}
          >
            Publish
          </Button>
        )}
      </div>

      {/* Publish Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🎉 Project Published!
                </h3>
                <p className="text-gray-600">
                  Your project is now live and accessible to everyone
                </p>
              </div>

              {/* Public URL */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={publicUrl || ''}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={copied ? Check : Copy}
                      onClick={copyToClipboard}
                      className={copied ? 'text-green-600 border-green-300' : ''}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    icon={ExternalLink}
                    onClick={() => window.open(publicUrl, '_blank')}
                    className="flex-1"
                  >
                    View Live
                  </Button>
                  <Button
                    variant="outline"
                    icon={Share2}
                    onClick={shareProject}
                    className="flex-1"
                  >
                    Share
                  </Button>
                </div>

                {/* Settings */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Publication Settings</h4>
                      <p className="text-sm text-gray-500">Manage your project visibility</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Settings}
                    >
                      Settings
                    </Button>
                  </div>
                </div>

                {/* Unpublish */}
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnpublish}
                    className="w-full text-red-600 hover:bg-red-50"
                  >
                    Unpublish Project
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublishButton;