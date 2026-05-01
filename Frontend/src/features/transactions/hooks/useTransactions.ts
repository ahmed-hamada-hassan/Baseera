import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions.api';
import type { TransactionStatus, CreateTransactionRequest } from '@/shared/lib/schemas/openapi.schema';

export function useTransactions(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['transactions', page, pageSize],
    queryFn: () => transactionsApi.getTransactions(page, pageSize),
  });
}

export function useSubmitOcr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => transactionsApi.submitOcrResult(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TransactionStatus }) => 
      transactionsApi.updateTransactionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) => transactionsApi.createTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
