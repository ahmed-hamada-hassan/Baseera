import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions.api';

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsApi.getSubscriptions,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Stub — kept for backward compatibility with CreateSubscriptionModal.
 * The backend /api/Subscriptions has no POST endpoint in the OpenAPI spec,
 * so this is intentionally a no-op placeholder.
 */
export function useCreateSubscription() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('إضافة اشتراك يدوياً غير مدعوم في هذه النسخة');
    },
  });
}
