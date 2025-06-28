import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API URL configured:', API_URL); // Debug log

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Set default axios configuration
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 10000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('oxdel_token'));

  // Set axios default authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          console.log('Checking auth with token:', token.substring(0, 20) + '...');
          const response = await apiClient.get('/api/auth/me');
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            // Invalid token, remove it
            localStorage.removeItem('oxdel_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error.message);
          localStorage.removeItem('oxdel_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_URL}/api/auth/login`);
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('oxdel_token', token);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan saat login';
      return { success: false, message };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      console.log('Attempting register to:', `${API_URL}/api/auth/register`);
      const response = await apiClient.post('/api/auth/register', {
        fullName,
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('oxdel_token', token);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan saat mendaftar';
      return { success: false, message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', {
        email
      });

      return { 
        success: response.data.success, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      return { success: false, message };
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await apiClient.post('/api/auth/reset-password', {
        token,
        password,
        confirmPassword
      });

      return { 
        success: response.data.success, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      return { success: false, message };
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshUserProfile = async () => {
    try {
      const response = await apiClient.get('/api/user/profile');
      if (response.data.success) {
        setUser(response.data.data.user);
        return { success: true, user: response.data.data.user };
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return { success: false, message: 'Gagal memuat profil user' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('oxdel_token');
    delete axios.defaults.headers.common['Authorization'];
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    updateUserProfile,
    refreshUserProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};