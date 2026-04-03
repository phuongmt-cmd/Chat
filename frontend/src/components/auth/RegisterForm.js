import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import {
  generateKeyPair,
  generateSalt,
  generateIV,
  encryptPrivateKey,
  stringToHex,
} from '../../utils/crypto';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm({ onToggleForm }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);

  const { register, checkUsername, login, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Nhập tên người dùng';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Tên người dùng chỉ gồm chữ, số và dấu gạch dưới';
    }

    if (!formData.password) {
      newErrors.password = 'Nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsGeneratingKeys(true);

    try {
      const username = formData.username.trim();

      const checkResult = await checkUsername(username);
      if (!checkResult.success) {
        toast.error(checkResult.error || 'Không kiểm tra được username');
        return;
      }

      if (!checkResult.available) {
        setErrors({ username: 'Tên người dùng đã tồn tại' });
        return;
      }

      const { publicKey, privateKey } = generateKeyPair();
      const salt = generateSalt();
      const iv = generateIV();
      const encryptedPrivateKey = encryptPrivateKey(privateKey, formData.password, salt, iv);

      const registrationData = {
        username,
        password: formData.password,
        public_key: publicKey,
        private_encrypted_key: encryptedPrivateKey,
        iv: stringToHex(iv),
        salt: stringToHex(salt),
      };

      const result = await register(registrationData);

      if (!result.success) {
        toast.error(result.error || 'Đăng ký thất bại');
        return;
      }

      toast.success('Đăng ký thành công, đang đăng nhập...');
      const loginResult = await login(username, formData.password);

      if (!loginResult.success) {
        toast.error(loginResult.error || 'Đăng nhập tự động thất bại');
        onToggleForm();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Lỗi khi tạo tài khoản hoặc khóa mã hóa');
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const isSubmitting = isLoading || isGeneratingKeys;

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Create account
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Đăng ký</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Tạo tài khoản mới để bắt đầu trò chuyện với giao diện hoàn thiện hơn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Tên người dùng
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ví dụ: test123"
            className="input-modern"
          />
          {errors.username && (
            <p className="mt-2 text-sm font-medium text-rose-500">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tạo mật khẩu"
              className="input-modern pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm font-medium text-rose-500">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              className="input-modern pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm font-medium text-rose-500">{errors.confirmPassword}</p>
          )}
        </div>

        {isGeneratingKeys && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Đang tạo khóa mã hóa cho tài khoản...
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
          {isSubmitting
            ? isGeneratingKeys
              ? 'Đang tạo tài khoản...'
              : 'Đang đăng ký...'
            : 'Đăng ký'}
        </button>
      </form>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onToggleForm}
          className="font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}