import React, { createContext, useContext, useEffect, useReducer } from "react";
import { authAPI } from "../services/api";
import { decryptPrivateKey } from "../utils/crypto";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  privateKey: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        privateKey: action.payload.privateKey,
        isAuthenticated: true,
        isLoading: false,
      };

    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };

    case "STOP_LOADING":
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedPrivateKey = sessionStorage.getItem("privateKey");

      if (savedUser && savedPrivateKey) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: JSON.parse(savedUser),
            privateKey: savedPrivateKey,
          },
        });
      } else {
        dispatch({ type: "STOP_LOADING" });
      }
    } catch (error) {
      console.error("Restore auth error:", error);
      localStorage.removeItem("user");
      sessionStorage.removeItem("privateKey");
      dispatch({ type: "STOP_LOADING" });
    }
  }, []);

  const login = async (username, password) => {
  try {
    const response = await authAPI.login(username, password);
    const data = response?.data?.data;

    if (!data) {
      return { success: false, error: "Không nhận được dữ liệu đăng nhập" };
    }

    const encryptedKey =
      data.privateEncryptedKey || data.private_encrypted_key;

    if (!encryptedKey || !data.salt || !data.iv) {
      return {
        success: false,
        error: "Thiếu dữ liệu private key từ server",
      };
    }

    const privateKey = decryptPrivateKey(
      encryptedKey,
      password,
      data.salt,
      data.iv
    );

    const user = {
      id: data.user_id,
      username: data.username,
    };

    localStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("privateKey", privateKey);

    dispatch({
      type: "LOGIN_SUCCESS",
      payload: {
        user,
        privateKey,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    sessionStorage.removeItem("privateKey");

    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại",
    };
  }
};

  const register = async (payload) => {
    try {
      const response = await authAPI.register(payload);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Đăng ký thất bại",
      };
    }
  };

  const checkUsername = async (username) => {
    try {
      const response = await authAPI.checkRegister(username);
      return {
        success: true,
        available: response.data?.available ?? true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Không kiểm tra được username",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("privateKey");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        privateKey: state.privateKey,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        login,
        logout,
        register,
        checkUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}