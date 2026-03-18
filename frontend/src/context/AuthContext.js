import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import { decryptPrivateKey } from '../utils/crypto';
import forge from 'node-forge';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  privateKey: null,
  userSalt: null,
  userIV: null
};

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_PRIVATE_KEY: 'SET_PRIVATE_KEY'
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        userSalt: action.payload.salt,
        userIV: action.payload.iv
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        privateKey: null
      };
    case AUTH_ACTIONS.LOGOUT:
      return initialState;
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case AUTH_ACTIONS.SET_PRIVATE_KEY:
      return { ...state, privateKey: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user }
      });
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // ✅ LOGIN
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authAPI.login(username, password);
      const data = response.data?.data;

      if (!data) throw new Error("Invalid response");

      const {
        user_id,
        username: returnedUsername,
        privateEncryptedKey,
        iv,
        salt
      } = data;

      const user = {
        id: user_id,
        username: returnedUsername || username,
        salt,
        iv,
        privateEncryptedKey
      };

      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, salt, iv }
      });

      // decrypt private key
      if (privateEncryptedKey) {
        try {
          const binarySalt = forge.util.hexToBytes(salt);
          const binaryIV = forge.util.hexToBytes(iv);

          const decryptedPrivateKey = decryptPrivateKey(
            privateEncryptedKey,
            password,
            binarySalt,
            binaryIV
          );

          sessionStorage.setItem('privateKey', decryptedPrivateKey);

          dispatch({
            type: AUTH_ACTIONS.SET_PRIVATE_KEY,
            payload: decryptedPrivateKey
          });
        } catch (err) {
          console.error("Decrypt lỗi:", err);
        }
      }

      return { success: true };

    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // ✅ CHECK USERNAME
  const checkUsername = async (username) => {
    try {
      const res = await authAPI.checkRegister(username);

      return {
        success: true,
        available: res.data?.available ?? true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Check username failed'
      };
    }
  };

  // ✅ REGISTER
  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);

      return {
        success: true,
        data: res.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Register failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('privateKey');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const value = {
    ...state,
    login,
    logout,
    register,        // 👈 FIX
    checkUsername    // 👈 FIX
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}