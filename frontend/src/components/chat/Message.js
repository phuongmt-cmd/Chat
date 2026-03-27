import React, { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import Message from "./Message";

export default function MessageList() {
  const { messages, currentChat, isLoading } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            Chọn người dùng từ danh sách bên trái để bắt đầu nhắn tin trong giao
            diện mới.
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

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%)] px-4 py-5 md:px-6">
      {messages.length === 0 ? (
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
      ) : (
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          {messages.map((message, index) => (
            <Message
              key={message.id || message.message_id || `${message.sender_id}-${index}`}
              message={message}
              currentChat={currentChat}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}