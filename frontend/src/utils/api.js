// api.js - Centralized API utility with token refresh

import axios from 'axios';

// Ensure /api/v1 is included only once
let base = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:5000';
if (!base.endsWith('/api/v1')) {
  base += '/api/v1';
}
export const API_BASE = base;

let onSessionExpired = null;
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  responseType: 'json',
});

// Request Interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper: Refresh token
async function refreshAccessToken() {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) throw new Error('No refresh token available');
  console.log('Attempting to refresh token with refreshToken:', refreshToken ? 'present' : 'null');
  try {
    const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    return accessToken;
  } catch (error) {
    console.log('Refresh token failed:', error.response?.data || error.message);
    localStorage.clear();
    if (onSessionExpired) onSessionExpired();
    window.location.href = '/login';
    throw error;
  }
}

// Response Interceptor: Handle 401/403 + token refresh
let isRefreshing = false;
let failedQueue = [];
console.log('API interceptor initialized');

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    console.log('API Error:', error.response?.status, error.config.url);
    const originalRequest = error.config;
    if (
      error.response &&
      [401, 403].includes(error.response.status) &&
      !originalRequest._retry
    ) {
      console.log('Attempting token refresh for', originalRequest.url);
      if (isRefreshing) {
        console.log('Refresh already in progress, queuing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth helpers
export const isAuthenticated = () => {
  return !!(localStorage.getItem('token') || localStorage.getItem('refreshToken'));
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.error('Logout API failed:', err);
    }
  }
  localStorage.clear();
  window.location.href = '/login';
};

export default api;
