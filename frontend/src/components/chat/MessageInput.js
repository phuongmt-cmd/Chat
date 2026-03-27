import React, { useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";

export default function MessageInput() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { currentChat, sendMessage } = useChat();
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || !currentChat || isSending) return;

    try {
      setIsSending(true);

      const result = await sendMessage(currentChat.user_id, message.trim());

      if (result?.success) {
        setMessage("");
        if (inputRef.current) {
          inputRef.current.style.height = "56px";
        }
      } else {
        alert(result?.error || "Gửi tin nhắn thất bại");
      }
    } catch (error) {
      console.error("Send message error:", error);
      alert(error?.message || "Gửi tin nhắn thất bại");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!currentChat) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-4 md:px-6">
      <form onSubmit={handleSubmit}>
        <div className="mx-auto flex max-w-4xl items-end gap-3">
          <div className="flex-1 rounded-[28px] border border-slate-200 bg-slate-50 p-2 shadow-sm transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                title="Emoji"
              >
                😊
              </button>

              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Nhắn tin cho ${currentChat.username}...`}
                className="max-h-32 min-h-[56px] flex-1 resize-none bg-transparent px-2 py-3 text-[15px] leading-7 text-slate-900 outline-none placeholder:text-slate-400"
                disabled={isSending}
                onInput={(e) => {
                  e.target.style.height = "56px";
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    128
                  )}px`;
                }}
              />

              <button
                type="button"
                className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                title="Đính kèm"
              >
                📎
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm transition hover:scale-[1.02] hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            title="Gửi tin nhắn"
          >
            {isSending ? "..." : "➤"}
          </button>
        </div>
      </form>
    </div>
  );
}