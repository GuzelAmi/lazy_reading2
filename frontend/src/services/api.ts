import axios from 'axios';
import { authService } from './auth';///ЛАБ1

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
// ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        authService.logoutClient();
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        const response = await authService.refresh(refreshToken);
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        processQueue(null, response.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authService.logoutClient();
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
// ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

export default api;