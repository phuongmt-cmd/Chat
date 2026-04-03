import React from 'react';
import { BellAlertIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useChat } from '../../context/ChatContext';

export default function NotificationBadge() {
  const { notifications, clearNotifications } = useChat();

  if (!notifications.length) return null;

  const latest = notifications.slice(-3).reverse();

  return (
    <div className="border-b border-slate-200 bg-amber-50/60 px-4 py-3 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
            <BellAlertIcon className="h-5 w-5 text-amber-600" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Thông báo mới</p>
            <div className="mt-1 space-y-1">
              {latest.map((notification, index) => (
                <p key={`${notification.timestamp}-${index}`} className="truncate text-sm text-slate-600">
                  <span className="font-medium text-slate-800">
                    {String(notification.senderID).slice(0, 8)}...
                  </span>{' '}
                  • {notification.message}
                </p>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={clearNotifications}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <XMarkIcon className="h-4 w-4" />
          Đóng
        </button>
      </div>
    </div>
  );
}