import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function Header({ currentChat }) {
  const { user } = useAuth();

  const currentName =
    currentChat?.username ||
    currentChat?.name ||
    "Chọn một cuộc trò chuyện";

  const currentInitial = (currentName?.charAt(0) || "C").toUpperCase();
  const myInitial = (user?.username?.charAt(0) || "U").toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });

    window.location.href = "/auth";
  };

  return (
    <div className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white shadow-sm">
            {currentInitial}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">
              {currentName}
            </h2>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {currentChat ? "Đang hoạt động" : "Chưa chọn cuộc trò chuyện"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 md:flex">
            E2EE
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-700 shadow-sm">
              {myInitial}
            </div>
            <div className="hidden text-right md:block">
              <div className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
                {user?.username || "User"}
              </div>
              <div className="text-xs text-emerald-600">Online</div>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = "/security")}
             className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Security
          </button>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}