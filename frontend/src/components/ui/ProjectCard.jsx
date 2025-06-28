import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Heart, 
  Globe, 
  Calendar, 
  MoreVertical,
  ExternalLink,
  Star,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete, 
  onClone, 
  onToggleFavorite,
  onView,
  className = '' 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    const icons = {
      published: Globe,
      draft: Edit,
      archived: Eye
    };
    const Icon = icons[status] || Edit;
    return <Icon className="w-3 h-3" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getThumbnailUrl = () => {
    // Try to get thumbnail from project content
    if (project.content?.blocks) {
      const heroBlock = project.content.blocks.find(block => block.type === 'hero');
      if (heroBlock?.content?.backgroundImage) {
        return heroBlock.content.backgroundImage;
      }
    }
    
    // Fallback to default thumbnail
    return 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400&h=300';
  };

  const handleAction = (action, event) => {
    event.stopPropagation();
    setShowMenu(false);
    
    switch (action) {
      case 'edit':
        onEdit && onEdit(project);
        break;
      case 'delete':
        onDelete && onDelete(project);
        break;
      case 'clone':
        onClone && onClone(project);
        break;
      case 'favorite':
        onToggleFavorite && onToggleFavorite(project);
        break;
      case 'view':
        onView && onView(project);
        break;
      case 'analytics':
        navigate(`/analytics/${project.id}`);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`glass-card-white group cursor-pointer overflow-hidden h-full flex flex-col ${className}`}
      onClick={() => onEdit && onEdit(project)}
    >
      {/* Project Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        
        <img
          src={getThumbnailUrl()}
          alt={project.title}
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
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              icon={Eye}
              onClick={(e) => handleAction('view', e)}
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
            >
              Preview
            </Button>
            
            {project.status === 'published' && (
              <Button
                variant="ghost"
                size="sm"
                icon={ExternalLink}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/p/${project.slug}`, '_blank');
                }}
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
              >
                Live
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span className="capitalize">{project.status}</span>
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => handleAction('favorite', e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
            project.is_favorite 
              ? 'bg-red-500/80 text-white' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {project.is_favorite ? (
            <Heart className="w-4 h-4 fill-current" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
        </button>

        {/* Menu Button */}
        <div className="absolute top-3 right-12">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]"
            >
              <button
                onClick={(e) => handleAction('edit', e)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Edit</span>
              </button>
              
              <button
                onClick={(e) => handleAction('analytics', e)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Analytics</span>
              </button>
              
              <button
                onClick={(e) => handleAction('clone', e)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Clone</span>
              </button>
              
              <button
                onClick={(e) => handleAction('favorite', e)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Star className={`w-4 h-4 ${project.is_favorite ? 'text-yellow-500' : 'text-gray-500'}`} />
                <span className="text-sm text-gray-700">
                  {project.is_favorite ? 'Unfavorite' : 'Favorite'}
                </span>
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={(e) => handleAction('delete', e)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:gradient-text transition-all duration-300 line-clamp-2 mb-2">
            {project.title}
          </h3>
          
          {project.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{project.views || 0} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(project.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {project.template_id && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
                Template
              </span>
            )}
            {project.custom_domain && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                Custom Domain
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              icon={BarChart3}
              onClick={(e) => handleAction('analytics', e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="View Analytics"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={(e) => handleAction('edit', e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
};

export default ProjectCard;