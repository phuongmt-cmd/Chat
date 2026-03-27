import React, { useEffect, useMemo, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";

export default function ChatSidebar() {
  const {
    chats,
    currentChat,
    setCurrentChat,
    loadChats,
    notifications,
    deleteConversation,
    dispatch,
    CHAT_ACTIONS,
  } = useChat();

  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user, loadChats]);

  const handleSearch = async (term) => {
    setSearchTerm(term);

    if (term.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await userAPI.searchUser(term);
      const users = response?.data?.data || [];
      const filteredUsers = users.filter((u) => u.id !== user?.id);
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (selectedUser) => {
    const existingChat = chats.find((chat) => chat.user_id === selectedUser.id);

    if (existingChat) {
      setCurrentChat(existingChat);
      setSearchTerm("");
      setSearchResults([]);
      return;
    }

    const newChat = {
      user_id: selectedUser.id,
      username: selectedUser.username,
      conversation_id: null,
      last_message: "",
      last_message_timestamp: 0,
      updated_at: new Date().toISOString(),
    };

    dispatch({
      type: CHAT_ACTIONS.SET_CHATS,
      payload: [newChat, ...chats],
    });

    setCurrentChat(newChat);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleDeleteChat = async (e, chat) => {
    e.stopPropagation();

    if (!chat.conversation_id) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa cuộc trò chuyện với ${chat.username}?`
    );
    if (!confirmed) return;

    setDeletingUserId(chat.user_id);

    const result = await deleteConversation(chat.conversation_id);

    if (result.success) {
      dispatch({
        type: CHAT_ACTIONS.SET_CHATS,
        payload: chats.filter((c) => c.conversation_id !== chat.conversation_id),
      });

      if (currentChat?.conversation_id === chat.conversation_id) {
        setCurrentChat(null);
      }
    } else {
      alert("Xóa cuộc trò chuyện thất bại: " + result.error);
    }

    setDeletingUserId(null);
  };

  const getNotificationCount = (chatUserId) => {
    return notifications.filter((n) => n.senderID === chatUserId).length;
  };

  const conversationCount = useMemo(() => chats.length, [chats]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-sm">
            C
          </div>

          <div className="min-w-0">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              ChatChit
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span>Modern secure messaging</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                E2EE
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Workspace
            </div>
            <div className="mt-1 text-4xl font-bold leading-none tracking-tight text-slate-900">
              Tin nhắn
            </div>
          </div>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            title="Cuộc trò chuyện mới"
          >
            ✎
          </button>
        </div>

        <div className="relative">
          <input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm kiếm người dùng..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {searchTerm ? (
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="mb-3 text-sm font-semibold text-slate-700">
              Kết quả tìm kiếm
            </div>

            {isSearching ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Đang tìm kiếm...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((foundUser) => (
                  <button
                    key={foundUser.id}
                    onClick={() => handleUserSelect(foundUser)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white">
                      {(foundUser.username?.charAt(0) || "U").toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">
                        {foundUser.username}
                      </div>
                      <div className="truncate text-sm text-slate-500">
                        Nhấn để bắt đầu trò chuyện
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Không tìm thấy người dùng
              </div>
            )}
          </div>
        ) : null}

        <div className="px-3 py-4">
          <div className="mb-3 flex items-center justify-between px-2">
            <div className="text-sm font-semibold text-slate-700">
              Cuộc trò chuyện gần đây
            </div>
            <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              {conversationCount}
            </div>
          </div>

          {chats.length === 0 ? (
            <div className="mx-2 mt-4 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                💬
              </div>
              <div className="text-lg font-semibold text-slate-900">
                Chưa có cuộc trò chuyện
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-500">
                Hãy tìm kiếm người dùng ở phía trên để bắt đầu nhắn tin.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => {
                const notificationCount = getNotificationCount(chat.user_id);
                const isActive = currentChat?.user_id === chat.user_id;
                const isDeleting = deletingUserId === chat.user_id;
                const name =
                  chat.username || `Người dùng ${String(chat.user_id).slice(0, 8)}`;
                const preview = isDeleting
                  ? "Đang xóa..."
                  : chat.last_message || "Chưa có tin nhắn";

                return (
                  <div
                    key={chat.user_id}
                    onClick={() => !isDeleting && setCurrentChat(chat)}
                    className={`group relative cursor-pointer rounded-[24px] border px-3 py-3 transition ${
                      isActive
                        ? "border-blue-200 bg-blue-50 shadow-sm"
                        : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                    } ${isDeleting ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-semibold text-white shadow-sm">
                          {(name?.charAt(0) || "U").toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate font-semibold text-slate-900">
                            {name}
                          </div>

                          {notificationCount > 0 ? (
                            <div className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                              {notificationCount}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-1 truncate text-sm text-slate-500">
                          {preview}
                        </div>
                      </div>
                    </div>

                    {chat.conversation_id ? (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteChat(e, chat)}
                        disabled={isDeleting}
                        className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100"
                        title="Xóa cuộc trò chuyện"
                      >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm hover:text-red-500">
                          🗑
                        </span>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}