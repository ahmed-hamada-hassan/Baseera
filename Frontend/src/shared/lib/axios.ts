/**
 * @file shared/lib/axios.ts
 * @description إعداد Axios المركزي مع:
 *  - Request Interceptor: حقن JWT Token في كل طلب
 *  - Response Interceptor: معالجة 401 وتوجيه لصفحة تسجيل الدخول
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { router } from '@/app/router';
import { useAuthStore } from '@/shared/store/auth.store';
/* ── إعداد النسخة الأساسية ── */
export const apiClient = axios.create({
  baseURL: import.meta.env['VITE_API_BASE_URL'] ?? '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ── Request Interceptor: حقن JWT ── */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('basira_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);


/* ── Response Interceptor: معالجة الأخطاء ── */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 Unauthorized — انتهت الجلسة أو رمز غير صالح
    if (error.response?.status === 401) {
      // Clear Zustand store (which also clears localStorage internally if implemented that way, but let's call it just in case)
      useAuthStore.getState().logout();
      router.navigate('/login');
      return Promise.reject(error);
    }

    // 403 Forbidden — صلاحيات غير كافية
    if (error.response?.status === 403) {
      console.warn('[Basira] Access denied:', error.config?.url);
    }

    // 500+ Server Errors
    if ((error.response?.status ?? 0) >= 500) {
      console.error('[Basira] Server error:', error.response?.status, error.config?.url);
    }

    return Promise.reject(error);
  },
);

/* ── Token Helpers ── */
export const tokenService = {
  get: (): string | null => localStorage.getItem('basira_token'),
  set: (token: string): void => {
    localStorage.setItem('basira_token', token);
  },
  remove: (): void => {
    localStorage.removeItem('basira_token');
    localStorage.removeItem('basira_user');
  },
  isAuthenticated: (): boolean => !!localStorage.getItem('basira_token'),
};

export default apiClient;
