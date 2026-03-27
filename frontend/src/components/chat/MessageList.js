import React from "react";
import { useChat } from "../../context/ChatContext";

export default function MessageList() {
  const { currentChat, messages, isLoading } = useChat();

  if (!currentChat) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-blue-50 text-4xl text-blue-600">
            💬
          </div>
          <h3 className="text-4xl font-bold tracking-tight text-slate-900">
            Chọn một cuộc trò chuyện
          </h3>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            Chọn người dùng từ danh sách bên trái để bắt đầu nhắn tin.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-500 shadow-sm">
          Đang tải tin nhắn...
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            ✨
          </div>
          <div className="text-2xl font-bold text-slate-900">
            Chưa có tin nhắn
          </div>
          <div className="mt-3 text-sm leading-7 text-slate-500">
            Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện với{" "}
            <span className="font-semibold text-slate-700">
              {currentChat?.username}
            </span>
            .
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%)] px-4 py-5 md:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {messages.map((message, index) => {
          const isMine = message.sender_id !== currentChat?.user_id;

          return (
            <div
              key={message.id || index}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-[24px] px-4 py-3 shadow-sm ${
                  isMine
                    ? "rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                    : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
                }`}
              >
                <div className="whitespace-pre-wrap break-words text-[15px] leading-7">
                  {message.text || "[Tin nhắn trống]"}
                </div>
                <div
                  className={`mt-2 text-xs ${
                    isMine ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {message.created_at
                    ? new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}