import React from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Calendar, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanInfo = (plan) => {
    const plans = {
      free: { 
        color: 'text-gray-600 bg-gray-100', 
        label: 'Free Plan',
        description: 'Fitur dasar untuk memulai'
      },
      pro: { 
        color: 'text-purple-600 bg-purple-100', 
        label: 'Pro Plan',
        description: 'Fitur lengkap untuk profesional'
      },
      enterprise: { 
        color: 'text-gold-600 bg-gold-100', 
        label: 'Enterprise Plan',
        description: 'Solusi untuk bisnis besar'
      }
    };
    return plans[plan] || plans.free;
  };

  const getTrialStatus = () => {
    if (!user?.trial_expiry) return null;
    
    const now = new Date();
    const trialExpiry = new Date(user.trial_expiry);
    const daysLeft = Math.ceil((trialExpiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft > 0) {
      return {
        active: true,
        daysLeft,
        message: `${daysLeft} hari tersisa`
      };
    }
    
    return {
      active: false,
      message: 'Trial berakhir'
    };
  };

  const planInfo = getPlanInfo(user?.plan);
  const trialStatus = getTrialStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card-white p-6 space-y-6"
    >
      {/* Avatar & Basic Info */}
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user?.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          
          {/* Online Status Indicator */}
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {user?.full_name}
        </h3>
        <p className="text-gray-600 mb-4 flex items-center justify-center space-x-1">
          <Mail className="w-4 h-4" />
          <span className="text-sm">{user?.email}</span>
        </p>
      </div>

      {/* Plan Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Plan Saat Ini</span>
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${planInfo.color}`}>
              {planInfo.label}
            </span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">{planInfo.description}</p>
        
        {/* Trial Status */}
        {trialStatus && user?.plan === 'free' && (
          <div className={`p-3 rounded-lg border ${
            trialStatus.active 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Calendar className={`w-4 h-4 ${
                trialStatus.active ? 'text-blue-600' : 'text-red-600'
              }`} />
              <span className={`text-sm font-medium ${
                trialStatus.active ? 'text-blue-800' : 'text-red-800'
              }`}>
                Trial {trialStatus.active ? 'Aktif' : 'Berakhir'}
              </span>
            </div>
            <p className={`text-xs mt-1 ${
              trialStatus.active ? 'text-blue-600' : 'text-red-600'
            }`}>
              {trialStatus.message}
            </p>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Role</span>
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Bergabung</span>
          <span className="font-medium text-gray-900">
            {formatDate(user?.created_at)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status Email</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            user?.email_verified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user?.email_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => navigate('/profile')}
        >
          Edit Profil
        </Button>
        
        {user?.plan === 'free' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            icon={Crown}
            onClick={() => navigate('/upgrade')}
          >
            Upgrade Plan
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default UserCard;