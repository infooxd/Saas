import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Save, Check } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import axios from 'axios';

const ChangePasswordForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini wajib diisi';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password baru wajib diisi';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password baru minimal 6 karakter';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password baru harus mengandung huruf besar, kecil, dan angka';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Password baru harus berbeda dari password saat ini';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.put('/api/user/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        onSuccess('Password berhasil diubah');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        onError(response.data.message);
      }
    } catch (error) {
      console.error('Change password error:', error);
      onError(error.response?.data?.message || 'Terjadi kesalahan saat mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.newPassword;
    const checks = [
      { label: 'Minimal 6 karakter', valid: password.length >= 6 },
      { label: 'Mengandung huruf kecil', valid: /[a-z]/.test(password) },
      { label: 'Mengandung huruf besar', valid: /[A-Z]/.test(password) },
      { label: 'Mengandung angka', valid: /\d/.test(password) }
    ];
    
    return checks;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubah Password</h2>
        <p className="text-gray-600">Pastikan password baru Anda aman dan mudah diingat</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="password"
          name="currentPassword"
          label="Password Saat Ini"
          placeholder="Masukkan password saat ini"
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          icon={Lock}
          required
        />

        <div className="space-y-2">
          <Input
            type="password"
            name="newPassword"
            label="Password Baru"
            placeholder="Masukkan password baru"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            icon={Lock}
            required
          />
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-lg p-3 space-y-2"
            >
              <p className="text-xs font-medium text-gray-700">Kekuatan Password:</p>
              {passwordStrength().map((check, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    check.valid ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {check.valid && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={`text-xs ${
                    check.valid ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <Input
          type="password"
          name="confirmPassword"
          label="Konfirmasi Password Baru"
          placeholder="Ulangi password baru"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={Lock}
          required
        />

        {/* Security Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Tips Keamanan:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
            <li>• Jangan gunakan informasi pribadi seperti nama atau tanggal lahir</li>
            <li>• Gunakan password yang berbeda untuk setiap akun</li>
            <li>• Pertimbangkan menggunakan password manager</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              setErrors({});
            }}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Save}
            className="min-w-[120px]"
          >
            Ubah Password
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChangePasswordForm;