import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../api/accounts.api';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAccounts,
  });
}

export function useSyncAccounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => accountsApi.syncAccounts(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}
