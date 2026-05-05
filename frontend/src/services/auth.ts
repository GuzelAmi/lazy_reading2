// services/auth.ts
import api from './api';

export interface LoginData { username: string; password: string; }
export interface AuthResponse {
  ///лаб2
  access_token: string;
  refresh_token: string;
  ///лаб2  
  token_type: string;
  user_id: number;
  // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  role: 'user' | 'admin';
  // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
}

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },
  register: async (data: LoginData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
   // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  refresh: async (refreshToken: string): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logoutClient: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('role');//ЛАБ1
  }
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
};