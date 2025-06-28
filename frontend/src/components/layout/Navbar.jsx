import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Zap, User, LogOut, Settings, BarChart3, Palette } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const userMenuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Settings, label: 'Pengaturan', path: '/profile' },
    { icon: LogOut, label: 'Keluar', action: handleLogout }
  ];

  const publicMenuItems = [
    { label: 'Template', path: '/templates' },
    { label: 'Fitur', path: '/#features' },
    { label: 'Harga', path: '/#pricing' }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-card-white backdrop-blur-xl bg-white/90 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">Oxdel</span>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            {/* Public Navigation */}
            {!isAuthenticated && (
              <div className="flex items-center space-x-6 mr-6">
                {publicMenuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Template Gallery Link for Authenticated Users */}
            {isAuthenticated && location.pathname !== '/templates' && (
              <Link to="/templates">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors font-medium mr-4"
                >
                  <Palette className="w-4 h-4" />
                  <span>Template</span>
                </motion.button>
              </Link>
            )}

            {isAuthenticated ? (
              /* Authenticated User Menu */
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name?.split(' ')[0]}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.plan}</p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 glass-card-white shadow-lg rounded-xl py-2"
                  >
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else {
                            navigate(item.path);
                            setIsUserMenuOpen(false);
                          }
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              /* Guest Menu */
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary-white"
                  >
                    Masuk
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                  >
                    Daftar Gratis
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900 p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-gray-200/50"
          >
            {isAuthenticated ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                {/* Template Link */}
                <Link to="/templates" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                    <Palette className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Template</span>
                  </button>
                </Link>
                
                {/* Menu Items */}
                {userMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Public Menu Items */}
                {publicMenuItems.map((item, index) => (
                  <Link key={index} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                      {item.label}
                    </button>
                  </Link>
                ))}
                
                {/* Auth Buttons */}
                <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="btn-secondary-white text-center w-full">Masuk</button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="btn-primary text-center w-full">Daftar Gratis</button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;