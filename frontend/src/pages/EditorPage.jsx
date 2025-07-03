import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Settings, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ElementorEditor from '../components/ui/ElementorEditor';
import PublishButton from '../components/ui/PublishButton';
import PreviewButton from '../components/ui/PreviewButton';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import axios from 'axios';

const EditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  
  const [project, setProject] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (projectId && isAuthenticated) {
      loadProject();
    }
  }, [projectId, isAuthenticated]);

  const loadProject = async () => {
    try {
      setProjectLoading(true);
      const response = await axios.get(`/api/projects/${projectId}`);
      
      if (response.data.success) {
        const projectData = response.data.data.project;
        setProject(projectData);
        
        // Load blocks from project content
        if (projectData.content && projectData.content.blocks) {
          setBlocks(projectData.content.blocks);
        }
      } else {
        setAlert({ type: 'error', message: 'Project not found' });
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to load project' 
      });
    } finally {
      setProjectLoading(false);
    }
  };

  const saveProject = async () => {
    try {
      setSaving(true);
      
      const projectContent = {
        blocks,
        lastModified: new Date().toISOString()
      };

      const response = await axios.put(`/api/projects/${projectId}`, {
        content: projectContent
      });

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Project saved successfully!' });
        setProject(response.data.data.project);
      } else {
        setAlert({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to save project' 
      });
    } finally {
      setSaving(false);
    }
  };

  const publishProject = async () => {
    try {
      setPublishing(true);
      
      // Save current content first
      await saveProject();
      
      // Publish project
      const response = await axios.put(`/api/projects/${projectId}`, {
        status: 'published'
      });

      if (response.data.success) {
        setProject(response.data.data.project);
        return { success: true, message: 'Project published successfully!' };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Error publishing project:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to publish project' 
      };
    } finally {
      setPublishing(false);
    }
  };

  const unpublishProject = async () => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, {
        status: 'draft'
      });

      if (response.data.success) {
        setProject(response.data.data.project);
        return { success: true, message: 'Project unpublished successfully!' };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Error unpublishing project:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to unpublish project' 
      };
    }
  };

  const handlePreview = (device = 'desktop') => {
    const previewUrl = `/preview/${projectId}`;
    const deviceWidths = {
      desktop: 1200,
      tablet: 768,
      mobile: 375
    };
    const width = deviceWidths[device] || 1200;
    const windowFeatures = `width=${width + 100},height=800,scrollbars=yes,resizable=yes`;
    window.open(previewUrl, '_blank', windowFeatures);
  };

  if (loading || projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              Back
            </Button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {project?.title || 'Untitled Project'}
              </h1>
              <p className="text-sm text-gray-500">
                Elementor-style Editor • Last saved: {project?.updated_at ? new Date(project.updated_at).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <PreviewButton 
              project={project}
              onPreview={handlePreview}
            />
            
            <PublishButton
              project={project}
              onPublish={publishProject}
              onUnpublish={unpublishProject}
              loading={publishing}
            />
            
            <Button variant="ghost" icon={Settings} size="sm">
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2"
        >
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)}
          />
        </motion.div>
      )}

      {/* Elementor Editor */}
      <div className="flex-1 overflow-hidden">
        <ElementorEditor
          blocks={blocks}
          onUpdateBlocks={setBlocks}
          onSave={saveProject}
          saving={saving}
          projectId={projectId}
        />
      </div>
    </div>
  );
};

export default EditorPage;