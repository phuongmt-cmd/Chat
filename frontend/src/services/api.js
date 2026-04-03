import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8089',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  checkRegister: (username) => {
    return api.post('/api/auth/check-register', { username });
  },

  register: (userData) => {
    return api.post('/api/auth/register', userData);
  },

  preLogin: (username) => {
    return api.post('/api/auth/pre-login', { username });
  },

  login: (username, password) => {
    return api.post('/api/auth/login', {
      username,
      password,
    });
  },

  logout: () => {
    return api.post('/api/auth/logout');
  },
};

export const userAPI = {
  getPublicKey: (userID) => {
    return api.get(`/api/user/public-key/${userID}`);
  },

  getProfile: () => {
    return api.get('/api/user/profile');
  },

  searchUser: (query) => {
    return api.get(`/api/user/search?q=${encodeURIComponent(query)}`);
  },
};

export const chatAPI = {
  sendMessage: (messageData) => {
    return api.post('/api/chat/send-message', messageData);
  },

  getMessages: (conversationID, page = 1, limit = 50) => {
    return api.get(`/api/chat/messages/${conversationID}?page=${page}&limit=${limit}`);
  },

  getMessagesByUser: (userID) => {
    return api.get(`/api/chat/history/${userID}`);
  },

  getChatList: () => {
    return api.get('/api/chat/history');
  },

  deleteConversation: (conversationID) => {
    return api.delete(`/api/chat/conversation/${conversationID}`);
  },
};

export const securityAPI = {
  getIncidents: () => {
    return api.get('/api/security/incidents');
  },

  reportIncident: (payload) => {
    return api.post('/api/security/report', payload);
  },

  resolveIncident: (id) => {
    return api.put(`/api/security/incident/${id}/resolve`);
  },
};

export default api;