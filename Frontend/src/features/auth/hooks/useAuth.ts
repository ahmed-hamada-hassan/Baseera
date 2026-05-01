/**
 * @file features/auth/hooks/useAuth.ts
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { tokenService } from '@/shared/lib/axios';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/shared/store/ui.store';

export function useLogin() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // حفظ التوكن في الخدمة المشتركة
      tokenService.set(data.token);
      showNotification('success', `أهلاً بك مجدداً، ${data.fullName}`);
      navigate('/');
    },
    // We can rely on global error handling from queryClient or handle specific ones here
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      tokenService.set(data.token);
      showNotification('success', `تم إنشاء الحساب بنجاح، ${data.fullName}`);
      navigate('/');
    },
  });
}
