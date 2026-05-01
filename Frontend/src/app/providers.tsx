/**
 * @file app/providers.tsx
 * @description Provider tree — يُغلّف التطبيق بكل الـ Providers المطلوبة
 */

import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/queryClient';
import { ToastProvider } from '@/shared/ui/ToastProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastProvider />
    </QueryClientProvider>
  );
}
