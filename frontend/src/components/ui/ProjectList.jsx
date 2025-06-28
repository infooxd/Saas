import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Plus, SortAsc, SortDesc } from 'lucide-react';
import ProjectCard from './ProjectCard';
import Button from './Button';
import Alert from './Alert';

const ProjectList = ({ 
  projects = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onClone, 
  onToggleFavorite,
  onView,
  onCreateNew,
  onLoadMore,
  hasMore = false,
  total = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchQuery, statusFilter, sortBy, sortOrder]);

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'updated_at' || sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const statusOptions = [
    { value: 'all', label: 'All Projects', count: projects.length },
    { value: 'published', label: 'Published', count: projects.filter(p => p.status === 'published').length },
    { value: 'draft', label: 'Draft', count: projects.filter(p => p.status === 'draft').length },
    { value: 'archived', label: 'Archived', count: projects.filter(p => p.status === 'archived').length }
  ];

  const sortOptions = [
    { value: 'updated_at', label: 'Last Modified' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
          <p className="text-gray-600">
            {total > 0 ? `${total} project${total !== 1 ? 's' : ''} total` : 'No projects yet'}
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={Plus}
          onClick={onCreateNew}
        >
          New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="glass-card-white p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  statusFilter === option.value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{option.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === option.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>

          {/* View and Sort Controls */}
          <div className="flex items-center space-x-3">
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4 text-gray-600" />
                ) : (
                  <SortDesc className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {statusFilter !== 'all' && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs flex items-center space-x-1">
                <span>Status: {statusOptions.find(o => o.value === statusFilter)?.label}</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className="hover:text-purple-900"
                >
                  ✕
                </button>
              </span>
            )}
            
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs flex items-center space-x-1">
                <span>Search: "{searchQuery}"</span>
                <button
                  onClick={clearSearch}
                  className="hover:text-blue-900"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Projects Grid/List */}
      {loading ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {[...Array(8)].map((_, index) => (
            <div key={index} className="glass-card-white p-6 animate-pulse">
              <div className="aspect-[16/10] bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Grid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first project to get started'
            }
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={onCreateNew}
            >
              Create First Project
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProjectCard
                    project={project}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClone={onClone}
                    onToggleFavorite={onToggleFavorite}
                    onView={onView}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-8">
              <Button
                variant="outline"
                onClick={onLoadMore}
                loading={loading}
              >
                Load More Projects
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectList;