import React from "react";
import { useChat } from "../context/ChatContext";
import ChatLayout from "../components/layout/ChatLayout";
import Header from "../components/layout/Header";
import ChatSidebar from "../components/chat/ChatSidebar";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

function RightPanel({ currentChat }) {
  const chatName =
    currentChat?.username ||
    currentChat?.name ||
    "Chưa có người nhận";

  const chatInitial = (chatName?.charAt(0) || "C").toUpperCase();

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">Thông tin</h3>
        <p className="mt-1 text-sm text-slate-500">
          Chi tiết người dùng và cuộc trò chuyện
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-sm">
            {chatInitial}
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">
              {chatName}
            </div>
            <div className="mt-1 text-sm text-emerald-600">
              {currentChat ? "Đang hoạt động" : "Chưa chọn cuộc trò chuyện"}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">
            Trạng thái phiên chat
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
              <span className="text-slate-500">Mã hóa</span>
              <span className="font-medium text-emerald-600">Đang bật</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
              <span className="text-slate-500">Trạng thái</span>
              <span className="font-medium text-slate-900">
                {currentChat ? "Sẵn sàng" : "Chờ chọn chat"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">
            Gợi ý
          </div>
          <div className="space-y-2 text-sm text-slate-500">
            <p>• Chọn một người dùng bên trái để bắt đầu nhắn tin.</p>
            <p>• Dùng ô tìm kiếm để mở cuộc trò chuyện mới.</p>
            <p>• Nhấn Enter để gửi nhanh tin nhắn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { currentChat, error } = useChat();

  return (
    <ChatLayout
      sidebar={<ChatSidebar />}
      header={<Header currentChat={currentChat} />}
      rightPanel={<RightPanel currentChat={currentChat} />}
    >
      <div className="flex h-full min-h-0 flex-col bg-slate-50">
        {error ? (
          <div className="px-5 pt-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1">
          <MessageList />
        </div>

        <MessageInput />
      </div>
    </ChatLayout>
  );
}