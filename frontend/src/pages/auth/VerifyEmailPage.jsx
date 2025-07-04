import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import axios from 'axios';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/verify-email', {
        token
      });

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Gagal memverifikasi email');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!user?.email) {
      setMessage('Email tidak ditemukan. Silakan login kembali.');
      return;
    }

    try {
      setResendLoading(true);
      const response = await axios.post('/api/auth/resend-verification', {
        email: user.email
      });

      if (response.data.success) {
        setMessage('Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(error.response?.data?.message || 'Gagal mengirim ulang email verifikasi');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Oxdel</span>
          </Link>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card-white p-8"
        >
          {status === 'verifying' && (
            <div className="text-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
              >
                <Mail className="w-8 h-8 text-blue-600" />
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Memverifikasi Email...
                </h2>
                <p className="text-gray-600">
                  Mohon tunggu sebentar
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Email Terverifikasi! 🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  {message}
                </p>
                <p className="text-sm text-gray-500">
                  Anda akan diarahkan ke dashboard dalam beberapa detik...
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  icon={ArrowRight}
                  onClick={() => navigate('/dashboard')}
                >
                  Lanjut ke Dashboard
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"
              >
                <XCircle className="w-8 h-8 text-red-600" />
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifikasi Gagal
                </h2>
                <p className="text-gray-600 mb-4">
                  {message}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Kemungkinan penyebab:</strong><br />
                  • Link sudah kedaluwarsa (berlaku 24 jam)<br />
                  • Link sudah pernah digunakan<br />
                  • Token tidak valid
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  icon={RefreshCw}
                  loading={resendLoading}
                  onClick={resendVerification}
                >
                  Kirim Ulang Email Verifikasi
                </Button>
                
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            Butuh bantuan? Hubungi{' '}
            <a href="mailto:support@oxdel.com" className="text-purple-600 hover:text-purple-500">
              support@oxdel.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;