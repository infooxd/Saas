import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Crown, 
  Calendar, 
  BarChart3, 
  FileText, 
  Eye, 
  HardDrive,
  Plus,
  Palette,
  Trash2,
  Copy,
  Star
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import UserCard from '../components/ui/UserCard';
import StatsCard from '../components/ui/StatsCard';
import ProjectList from '../components/ui/ProjectList';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import axios from 'axios';

const DashboardPage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchUserStats();
    }
  }, [user]);

  const fetchProjects = async (loadMore = false) => {
    try {
      setProjectsLoading(true);
      
      const offset = loadMore ? pagination.offset + pagination.limit : 0;
      const response = await axios.get(`/api/projects?limit=${pagination.limit}&offset=${offset}`);
      
      if (response.data.success) {
        const newProjects = response.data.data.projects;
        
        setProjects(prev => loadMore ? [...prev, ...newProjects] : newProjects);
        setPagination({
          ...pagination,
          total: response.data.data.total,
          offset: offset,
          hasMore: offset + newProjects.length < response.data.data.total
        });
      } else {
        setAlert({ type: 'error', message: 'Failed to load projects' });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to load projects' 
      });
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/user/stats');
      
      if (response.data.success) {
        setUserStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock stats if API fails
      setUserStats({
        total_projects: projects.length,
        published_projects: projects.filter(p => p.status === 'published').length,
        total_views: 1247,
        storage_used: '45 MB',
        storage_limit: user?.plan === 'free' ? '100 MB' : user?.plan === 'pro' ? '1 GB' : '10 GB'
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/templates');
  };

  const handleEditProject = (project) => {
    navigate(`/editor/${project.id}`);
  };

  const handleDeleteProject = async (project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/projects/${project.id}`);
      
      if (response.data.success) {
        setProjects(prev => prev.filter(p => p.id !== project.id));
        setAlert({ type: 'success', message: 'Project deleted successfully' });
        
        // Update stats
        fetchUserStats();
      } else {
        setAlert({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to delete project' 
      });
    }
  };

  const handleCloneProject = async (project) => {
    try {
      const response = await axios.post(`/api/projects/${project.id}/clone`);
      
      if (response.data.success) {
        const clonedProject = response.data.data.project;
        setProjects(prev => [clonedProject, ...prev]);
        setAlert({ type: 'success', message: `"${project.title}" cloned successfully` });
        
        // Update stats
        fetchUserStats();
      } else {
        setAlert({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      console.error('Error cloning project:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to clone project' 
      });
    }
  };

  const handleToggleFavorite = async (project) => {
    try {
      const response = await axios.patch(`/api/projects/${project.id}/favorite`);
      
      if (response.data.success) {
        setProjects(prev => prev.map(p => 
          p.id === project.id 
            ? { ...p, is_favorite: !p.is_favorite }
            : p
        ));
        
        const message = project.is_favorite 
          ? 'Removed from favorites' 
          : 'Added to favorites';
        setAlert({ type: 'success', message });
      } else {
        setAlert({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update favorite' 
      });
    }
  };

  const handleViewProject = (project) => {
    if (project.status === 'published' && project.slug) {
      window.open(`/p/${project.slug}`, '_blank');
    } else {
      // Open preview for draft projects
      const previewUrl = `/preview/${project.id}`;
      window.open(previewUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    }
  };

  const handleLoadMore = () => {
    fetchProjects(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: 'Total Projects',
      value: userStats?.total_projects || projects.length,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      loading: statsLoading
    },
    {
      title: 'Published',
      value: userStats?.published_projects || projects.filter(p => p.status === 'published').length,
      icon: Eye,
      color: 'from-green-500 to-emerald-500',
      loading: statsLoading
    },
    {
      title: 'Total Views',
      value: userStats?.total_views || 0,
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
      loading: statsLoading
    },
    {
      title: 'Storage',
      value: `${userStats?.storage_used || '0 MB'} / ${userStats?.storage_limit || '100 MB'}`,
      icon: HardDrive,
      color: 'from-orange-500 to-red-500',
      loading: statsLoading
    }
  ];

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.full_name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your projects and build amazing websites
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 sm:mt-0"
              >
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={handleCreateProject}
                  className="w-full sm:w-auto"
                >
                  New Project
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Left Column - User Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <UserCard user={user} />
            </motion.div>

            {/* Right Column - Stats and Projects */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3 space-y-6 sm:space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <StatsCard {...stat} />
                  </motion.div>
                ))}
              </div>

              {/* Projects List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <ProjectList
                  projects={projects}
                  loading={projectsLoading}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onClone={handleCloneProject}
                  onToggleFavorite={handleToggleFavorite}
                  onView={handleViewProject}
                  onCreateNew={handleCreateProject}
                  onLoadMore={handleLoadMore}
                  hasMore={pagination.hasMore}
                  total={pagination.total}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;