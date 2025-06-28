import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Upload, X } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const EditProfileForm = ({ user, onSuccess, onError }) => {
  const { updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        onError('File harus berupa gambar');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        onError('Ukuran file maksimal 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await axios.post('/api/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return response.data.data.avatar_url;
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new Error(error.response?.data?.message || 'Gagal upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    }

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Upload avatar first if there's a new one
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      // Update profile
      const response = await axios.put('/api/user/profile', {
        fullName: formData.fullName,
        email: formData.email
      });

      if (response.data.success) {
        // Update auth context
        if (updateUserProfile) {
          updateUserProfile({
            ...response.data.data.user,
            avatar_url: avatarUrl || user?.avatar_url
          });
        }
        
        onSuccess('Profil berhasil diperbarui');
        setAvatarFile(null);
      } else {
        onError(response.data.message);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      onError(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const removeAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar_url || null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Profil</h2>
        <p className="text-gray-600">Perbarui informasi profil Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Foto Profil
          </label>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              
              {avatarFile && (
                <button
                  type="button"
                  onClick={removeAvatarPreview}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="avatar"
                className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Foto</span>
              </label>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF hingga 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <Input
          type="text"
          name="fullName"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap Anda"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          icon={User}
          required
        />

        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="nama@email.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
        />

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFormData({
                fullName: user?.full_name || '',
                email: user?.email || ''
              });
              setErrors({});
              removeAvatarPreview();
            }}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            loading={loading || uploadingAvatar}
            icon={Save}
            className="min-w-[120px]"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProfileForm;