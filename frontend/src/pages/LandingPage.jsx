import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar.jsx';
import HeroSection from '../components/sections/HeroSection.jsx';
import FeaturesSection from '../components/sections/FeaturesSection.jsx';
import Footer from '../components/layout/Footer.jsx';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default LandingPage;