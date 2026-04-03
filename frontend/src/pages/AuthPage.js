import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import logo from '../assets/images/logo.png';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Mã hóa đầu cuối',
    desc: 'Tin nhắn được mã hóa phía client trước khi gửi đi.',
  },
  {
    icon: BoltIcon,
    title: 'Nhắn tin thời gian thực',
    desc: 'Nhận và gửi tin nhắn nhanh với WebSocket.',
  },
  {
    icon: LockClosedIcon,
    title: 'Đăng nhập an toàn',
    desc: 'Xác thực người dùng và lưu phiên làm việc.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Trải nghiệm hiện đại',
    desc: 'Giao diện gọn gàng, tập trung vào cuộc trò chuyện.',
  },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.22),_transparent_30%)]" />
          <div className="relative z-10">
            <div className="mb-10 flex items-center gap-3">
              <img src={logo} alt="ChatChit" className="h-12 w-12 rounded-2xl bg-white/10 p-2" />
              <div>
                <p className="text-xl font-bold tracking-tight">ChatChit</p>
                <p className="text-sm text-slate-300">Secure messaging workspace</p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                E2EE • Real-time • Private
              </div>

              <h1 className="text-4xl font-bold leading-tight">
                Trò chuyện hiện đại, gọn gàng và an toàn hơn.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Đăng nhập vào không gian trò chuyện của bạn với giao diện mới rõ ràng hơn,
                dễ dùng hơn và sẵn sàng để mở rộng cho chuyên đề 2 sau đó.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-4 md:grid-cols-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center bg-white p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <div className="mb-4 flex items-center justify-center gap-3">
                <img src={logo} alt="ChatChit" className="h-12 w-12 rounded-2xl bg-slate-100 p-2" />
                <div className="text-left">
                  <p className="text-xl font-bold tracking-tight text-slate-900">ChatChit</p>
                  <p className="text-sm text-slate-500">Secure messaging workspace</p>
                </div>
              </div>
            </div>

            {isLogin ? (
              <LoginForm onToggleForm={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleForm={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}