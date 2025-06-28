import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Calendar, Camera } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import EditProfileForm from '../components/ui/EditProfileForm';
import ChangePasswordForm from '../components/ui/ChangePasswordForm';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const ProfilePage = () => {
  const { user, loading, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'profile', label: 'Edit Profil', icon: User },
    { id: 'password', label: 'Ubah Password', icon: Shield }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanColor = (plan) => {
    const colors = {
      free: 'text-gray-600 bg-gray-100',
      pro: 'text-purple-600 bg-purple-100',
      enterprise: 'text-gold-600 bg-gold-100'
    };
    return colors[plan] || colors.free;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => navigate('/dashboard')}
                className="p-2"
              >
                Kembali
              </Button>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Pengaturan Profil
            </h1>
            <p className="text-gray-600 text-lg">
              Kelola informasi akun dan keamanan Anda
            </p>
          </motion.div>

          {/* Alert */}
          {alert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Alert 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert(null)}
              />
            </motion.div>
          )}

          <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Left Sidebar - User Info & Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* User Info Card */}
              <div className="glass-card-white p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-purple-300 transition-colors">
                      <Camera className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{user?.full_name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(user?.plan)}`}>
                      {user?.plan?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Bergabung {formatDate(user?.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="glass-card-white p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="glass-card-white p-6 sm:p-8">
                {activeTab === 'profile' && (
                  <EditProfileForm 
                    user={user} 
                    onSuccess={(message) => setAlert({ type: 'success', message })}
                    onError={(message) => setAlert({ type: 'error', message })}
                  />
                )}
                
                {activeTab === 'password' && (
                  <ChangePasswordForm 
                    onSuccess={(message) => setAlert({ type: 'success', message })}
                    onError={(message) => setAlert({ type: 'error', message })}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;