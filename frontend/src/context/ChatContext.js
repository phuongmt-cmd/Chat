import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { chatAPI, userAPI } from "../services/api";
import {
  decryptMessage,
  encryptMessage,
  generateIV,
  generateSharedSecret,
  stringToHex,
} from "../utils/crypto";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

const initialState = {
  chats: [],
  messages: [],
  currentChat: null,
  isLoading: false,
  error: null,
  notifications: [],
};

export const CHAT_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_CHATS: "SET_CHATS",
  SET_MESSAGES: "SET_MESSAGES",
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_CURRENT_CHAT: "SET_CURRENT_CHAT",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  CLEAR_NOTIFICATIONS: "CLEAR_NOTIFICATIONS",
};

function chatReducer(state, action) {
  switch (action.type) {
    case CHAT_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case CHAT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case CHAT_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case CHAT_ACTIONS.SET_CHATS:
      return { ...state, chats: action.payload, isLoading: false };

    case CHAT_ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload, isLoading: false };

    case CHAT_ACTIONS.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };

    case CHAT_ACTIONS.SET_CURRENT_CHAT:
      return { ...state, currentChat: action.payload };

    case CHAT_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case CHAT_ACTIONS.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user, privateKey, isAuthenticated } = useAuth();

  const clearError = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_NOTIFICATIONS });
  }, []);

  const loadChats = useCallback(async () => {
    if (!user?.id || !isAuthenticated) return;

    dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });

    try {
      const response = await chatAPI.getChatList();
      const chats = response?.data?.data?.chats || response?.data?.chats || [];

      if (!privateKey) {
        dispatch({ type: CHAT_ACTIONS.SET_CHATS, payload: chats });
        return;
      }

      const parsedChats = await Promise.all(
        chats.map(async (chat) => {
          if (!chat.last_message || !chat.iv) return chat;

          try {
            const publicKeyResponse = await userAPI.getPublicKey(chat.user_id);
            const publicKey = publicKeyResponse?.data?.data?.public_key;

            if (!publicKey) return { ...chat, last_message: "[Không thể giải mã]" };

            const sharedSecret = generateSharedSecret(privateKey, publicKey);
            const lastMessage = decryptMessage(
              chat.last_message,
              sharedSecret,
              chat.iv
            );

            return { ...chat, last_message: lastMessage };
          } catch (error) {
            return { ...chat, last_message: "[Không thể giải mã]" };
          }
        })
      );

      dispatch({ type: CHAT_ACTIONS.SET_CHATS, payload: parsedChats });
    } catch (error) {
      console.error("Load chats error:", error);
      dispatch({
        type: CHAT_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || "Failed to load chats",
      });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [user?.id, isAuthenticated, privateKey]);

  const loadMessages = useCallback(
    async (otherUserId) => {
      if (!user?.id || !otherUserId) {
        dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });
        dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });

      try {
        const response = await chatAPI.getMessagesByUser(otherUserId);
        const messages = response?.data?.data?.messages || [];

        if (!privateKey) {
          dispatch({
            type: CHAT_ACTIONS.SET_MESSAGES,
            payload: messages.map((msg) => ({
              ...msg,
              text: "[Không thể giải mã]",
              isDecrypted: false,
              created_at: new Date(
                (msg.timestamp || Date.now() / 1000) * 1000
              ).toISOString(),
            })),
          });
          return;
        }

        const publicKeyResponse = await userAPI.getPublicKey(otherUserId);
        const publicKey = publicKeyResponse?.data?.data?.public_key;

        if (!publicKey) {
          dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });
          return;
        }

        const sharedSecret = generateSharedSecret(privateKey, publicKey);

        const parsedMessages = messages.map((msg) => {
          try {
            return {
              ...msg,
              text: decryptMessage(msg.cipher_text, sharedSecret, msg.iv),
              isDecrypted: true,
              created_at: new Date(
                (msg.timestamp || Date.now() / 1000) * 1000
              ).toISOString(),
            };
          } catch (error) {
            return {
              ...msg,
              text: "[Không thể giải mã]",
              isDecrypted: false,
              created_at: new Date(
                (msg.timestamp || Date.now() / 1000) * 1000
              ).toISOString(),
            };
          }
        });

        dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: parsedMessages });
      } catch (error) {
        console.error("Load messages error:", error);
        dispatch({
          type: CHAT_ACTIONS.SET_ERROR,
          payload: "Không thể tải tin nhắn",
        });
        dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });
      } finally {
        dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
      }
    },
    [user?.id, privateKey]
  );

  const setCurrentChat = useCallback(
    (chat) => {
      dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
      dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: chat });
      dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });

      if (chat?.user_id) {
        loadMessages(chat.user_id);
      } else {
        dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
      }
    },
    [loadMessages]
  );

  const sendMessage = useCallback(
    async (receiverID, messageText) => {
      if (!user?.id) {
        return {
          success: false,
          error: "Thiếu user ID. Hãy đăng nhập lại.",
        };
      }

      if (!privateKey) {
        return {
          success: false,
          error: "Thiếu private key. Hãy đăng nhập lại.",
        };
      }

      try {
        const response = await userAPI.getPublicKey(receiverID);
        const publicKey = response?.data?.data?.public_key;

        if (!publicKey) {
          return {
            success: false,
            error: "Không lấy được public key của người nhận",
          };
        }

        const sharedSecret = generateSharedSecret(privateKey, publicKey);
        const ivRaw = generateIV();
        const ivHex = stringToHex(ivRaw);
        const cipherText = encryptMessage(messageText, sharedSecret, ivHex);

        const apiResponse = await chatAPI.sendMessage({
          receiver_id: receiverID,
          cipher_text: cipherText,
          iv: ivHex,
        });

        const timestamp =
          apiResponse?.data?.data?.timestamp || Math.floor(Date.now() / 1000);

        dispatch({
          type: CHAT_ACTIONS.ADD_MESSAGE,
          payload: {
            id: `${timestamp}-${Math.random()}`,
            text: messageText,
            sender_id: user.id,
            receiver_id: receiverID,
            created_at: new Date(timestamp * 1000).toISOString(),
            isDecrypted: true,
          },
        });

        const nextChats = state.chats.map((chat) =>
          chat.user_id === receiverID
            ? {
                ...chat,
                last_message: messageText,
                last_message_timestamp: timestamp,
              }
            : chat
        );

        dispatch({ type: CHAT_ACTIONS.SET_CHATS, payload: nextChats });

        return { success: true };
      } catch (error) {
        console.error("Send message error:", error);
        return {
          success: false,
          error:
            error.response?.data?.message ||
            error.message ||
            "Gửi tin nhắn thất bại",
        };
      }
    },
    [user?.id, privateKey, state.chats]
  );

  const deleteConversation = useCallback(
    async (conversationID) => {
      try {
        await chatAPI.deleteConversation(conversationID);

        const nextChats = state.chats.filter(
          (chat) => chat.conversation_id !== conversationID
        );

        dispatch({ type: CHAT_ACTIONS.SET_CHATS, payload: nextChats });

        if (state.currentChat?.conversation_id === conversationID) {
          dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: null });
          dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });
          dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error.response?.data?.message || "Failed to delete conversation",
        };
      }
    },
    [state.chats, state.currentChat]
  );

  useEffect(() => {
    if (user?.id && isAuthenticated) {
      loadChats();
    }
  }, [user?.id, isAuthenticated, loadChats]);

  return (
    <ChatContext.Provider
      value={{
        chats: state.chats,
        messages: state.messages,
        currentChat: state.currentChat,
        isLoading: state.isLoading,
        error: state.error,
        notifications: state.notifications,
        loadChats,
        loadMessages,
        setCurrentChat,
        sendMessage,
        clearError,
        clearNotifications,
        deleteConversation,
        dispatch,
        CHAT_ACTIONS,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }

  return context;
}