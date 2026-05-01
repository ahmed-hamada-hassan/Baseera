/**
 * @file shared/lib/queryClient.ts
 * @description إعداد TanStack Query المركزي
 */

import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { handleGlobalError } from '@/shared/hooks/useGlobalError';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 دقائق قبل اعتبار البيانات قديمة
      gcTime: 1000 * 60 * 10,         // 10 دقائق في الكاش بعد إلغاء الاشتراك
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError;
        // لا إعادة محاولة على أخطاء 4xx (ما عدا 429 Too Many Requests)
        if (axiosError.response?.status !== undefined) {
          const status = axiosError.response.status;
          if (status >= 400 && status < 500 && status !== 429) return false;
        }
        return failureCount < 2;      // أقصى محاولتين فقط
      },
      refetchOnWindowFocus: false,    // تجنب الطلبات العشوائية
      throwOnError: false,            // تجنب تكسير الواجهة بالكامل
    },
    mutations: {
      retry: false,
      onError: handleGlobalError,
    },
  },
});
