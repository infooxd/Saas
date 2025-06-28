import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color, loading = false }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="glass-card-white p-6 group cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 group-hover:gradient-text transition-all duration-300">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} group-hover:shadow-lg transition-shadow duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Hover Effect Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
    </motion.div>
  );
};

export default StatsCard;