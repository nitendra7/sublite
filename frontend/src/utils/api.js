import axios from 'axios';

// Get API base URL based on environment
const getApiBaseUrl = () => {
  // In development, use Vite proxy (relative URL)
  if (import.meta.env.DEV) {
    return '/api/v1';
  }

  // In production, use the deployed backend URL from environment
  return import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
};

export const API_BASE = getApiBaseUrl();

let onSessionExpired = null;
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

// Create axios instance with credentials enabled
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  responseType: 'json',
  withCredentials: true, // Ensure cookies are sent for CORS
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
  try {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    return accessToken;
  } catch (error) {
    localStorage.clear();
    if (onSessionExpired) onSessionExpired();
    window.location.href = '/login';
    throw error;
  }
}

// Response Interceptor: Handle 401/403 + token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      [401, 403].includes(error.response.status) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
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
