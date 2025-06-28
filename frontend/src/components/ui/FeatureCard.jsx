import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, gradient }) => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="glass-card-white p-6 sm:p-8 h-full group cursor-pointer bg-white/80 backdrop-blur-sm"
    >
      {/* Icon */}
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${gradient} p-3 sm:p-4 mb-4 sm:mb-6 group-hover:shadow-lg`}
      >
        <Icon className="w-full h-full text-white" />
      </motion.div>

      {/* Content */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:gradient-text transition-all duration-300">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-sm sm:text-base">
          {description}
        </p>
      </div>

      {/* Hover Effect Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
    </motion.div>
  );
};

export default FeatureCard;