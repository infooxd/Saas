import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AnalyticsCard = ({ 
  title, 
  value, 
  previousValue, 
  icon: Icon, 
  color = 'from-blue-500 to-cyan-500',
  loading = false,
  format = 'number',
  suffix = '',
  className = ''
}) => {
  const formatValue = (val) => {
    if (loading) return '...';
    if (format === 'percentage') return `${val}%`;
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'duration') return `${val}s`;
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return { percentage: 0, trend: 'neutral' };
    
    const change = ((value - previousValue) / previousValue) * 100;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    return { percentage: Math.abs(change), trend };
  };

  const { percentage, trend } = calculateChange();

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`glass-card-white p-6 group cursor-pointer relative overflow-hidden ${className}`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900 group-hover:gradient-text transition-all duration-300">
                {formatValue(value)}{suffix}
              </p>
            )}
          </div>
          
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color} group-hover:shadow-lg transition-shadow duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Trend Indicator */}
        {!loading && previousValue !== undefined && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;