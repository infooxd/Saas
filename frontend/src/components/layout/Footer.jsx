import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center space-x-2"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Oxdel</span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base"
          >
            Platform terdepan untuk membuat website professional tanpa coding. 
            Mulai dari portfolio hingga toko online, semua bisa dibuat dalam hitungan menit.
          </motion.p>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-gray-500"
          >
            <a href="#" className="hover:text-gray-900 transition-colors">Tentang Kami</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Fitur</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Harga</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Template</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Bantuan</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Kontak</a>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-8 border-t border-gray-200 text-gray-500 text-sm flex items-center justify-center space-x-1"
          >
            <span>© 2024 Oxdel. Dibuat dengan</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>di Indonesia</span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;