import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onToggleForm }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Nhập tên người dùng';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    }

    if (!formData.password) {
      newErrors.password = 'Nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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

    const result = await login(formData.username.trim(), formData.password);

    if (result.success) {
      toast.success('Đăng nhập thành công');
    } else {
      toast.error(result.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Welcome back
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Đăng nhập</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Truy cập vào tài khoản ChatChit của bạn để tiếp tục trò chuyện.
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
            placeholder="Nhập tên người dùng"
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
              placeholder="Nhập mật khẩu"
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

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base">
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onToggleForm}
          className="font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
}