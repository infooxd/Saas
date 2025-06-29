import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  DollarSign, 
  Users, 
  TrendingUp,
  Share2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import StatsCard from '../components/ui/StatsCard';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import axios from 'axios';

const AffiliatePage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [affiliateData, setAffiliateData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchAffiliateData();
    }
  }, [user]);

  const fetchAffiliateData = async () => {
    try {
      const response = await axios.get('/api/affiliate/stats');
      
      if (response.data.success) {
        setAffiliateData(response.data.data);
      } else {
        setAlert({ type: 'error', message: 'Failed to load affiliate data' });
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to load affiliate data' 
      });
    } finally {
      setDataLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (affiliateData?.referral_url) {
      try {
        await navigator.clipboard.writeText(affiliateData.referral_url);
        setCopied(true);
        setAlert({ type: 'success', message: 'Referral link copied to clipboard!' });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to copy link' });
      }
    }
  };

  const shareReferralLink = () => {
    if (navigator.share && affiliateData?.referral_url) {
      navigator.share({
        title: 'Join Oxdel - Build Amazing Websites',
        text: 'Create stunning websites without coding using Oxdel!',
        url: affiliateData.referral_url,
      });
    } else {
      copyReferralLink();
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${affiliateData?.commission_stats?.total_earnings || 0}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Total Referrals',
      value: affiliateData?.commission_stats?.total_referrals || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Link Clicks',
      value: affiliateData?.affiliate_link?.clicks || 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Pending Earnings',
      value: `$${affiliateData?.commission_stats?.pending_earnings || 0}`,
      icon: Calendar,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Alert */}
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert(null)}
              />
            </motion.div>
          )}

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
                Back
              </Button>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Affiliate Program
            </h1>
            <p className="text-gray-600 text-lg">
              Earn money by referring new users to Oxdel
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </motion.div>

          {/* Referral Link Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass-card-white p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Link</h2>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={affiliateData?.referral_url || ''}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
              <Button
                variant="outline"
                icon={copied ? Check : Copy}
                onClick={copyReferralLink}
                className={copied ? 'text-green-600 border-green-300' : ''}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="primary"
                icon={Share2}
                onClick={shareReferralLink}
              >
                Share
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share this link to earn 20% commission on all referral purchases
            </p>
          </motion.div>

          {/* Recent Commissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="glass-card-white p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Commissions</h2>
            
            {affiliateData?.recent_commissions?.length > 0 ? (
              <div className="space-y-4">
                {affiliateData.recent_commissions.map((commission, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{commission.referred_user_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(commission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +${commission.commission_amount}
                      </p>
                      <p className={`text-xs ${
                        commission.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {commission.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No commissions yet</p>
                <p className="text-sm text-gray-400">Start sharing your referral link to earn commissions</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePage;