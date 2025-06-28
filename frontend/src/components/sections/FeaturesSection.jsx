import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from '../ui/FeatureCard.jsx';
import { Palette, Eye, Smartphone, MousePointer } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Palette,
      title: 'Pilih Template',
      description: 'Pilih dari ratusan template premium yang dirancang khusus untuk berbagai industri dan kebutuhan bisnis.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Eye,
      title: 'Editor Visual',
      description: 'Drag & drop editor yang intuitif. Edit langsung di halaman tanpa perlu coding atau technical skill.',
      gradient: 'from-blue-500 to-teal-500'
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Semua template otomatis responsif dan teroptimasi untuk desktop, tablet, dan mobile device.',
      gradient: 'from-teal-500 to-green-500'
    },
    {
      icon: MousePointer,
      title: 'Publikasi Sekali Klik',
      description: 'Deploy website Anda ke internet dengan satu klik. Custom domain dan SSL certificate included.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Fitur <span className="gradient-text">Powerful</span> untuk Semua Kebutuhan
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Platform lengkap dengan semua tools yang Anda butuhkan untuk membuat website professional dalam hitungan menit.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12 sm:mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-base sm:text-lg"
          >
            Mulai Sekarang - Gratis
          </motion.button>
          <p className="text-gray-500 mt-4 text-sm sm:text-base">Tidak perlu kartu kredit • Setup dalam 2 menit</p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;