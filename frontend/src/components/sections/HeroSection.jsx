import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-0">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-white"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-50/30 via-purple-50/20 to-blue-50/30"></div>
      
      {/* Floating Aurora Orbs */}
      <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-pink-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-purple-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-gradient-to-r from-pink-100/10 to-purple-100/10 rounded-full blur-3xl animate-float"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
          >
            <span className="text-gray-900">Buat </span>
            <span className="gradient-text animate-gradient bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              Landing Page
            </span>
            <br />
            <span className="text-gray-900">dalam </span>
            <span className="gradient-text">Hitungan Menit</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-2"
          >
            Platform all-in-one untuk membuat website stunning untuk bisnis apapun.
            Dari portfolio hingga toko online, tanpa coding, tanpa ribet.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-6 sm:pt-8 px-4"
          >
            <Link to="/templates">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center space-x-2 text-base sm:text-lg w-full sm:w-auto justify-center"
              >
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Lihat Template</span>
              </motion.button>
            </Link>
            
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center space-x-2 text-base sm:text-lg w-full sm:w-auto justify-center"
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Mulai Gratis</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-12 sm:pt-16 max-w-2xl mx-auto"
          >
            {[
              { number: '50+', label: 'Template Premium' },
              { number: '99%', label: 'Uptime Guarantee' },
              { number: '24/7', label: 'Support Ready' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{stat.number}</div>
                <div className="text-gray-500 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Hidden when scrolled */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollY < 100 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-gray-400/50 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-gray-500/60 rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;