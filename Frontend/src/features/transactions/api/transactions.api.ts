import apiClient from '@/shared/lib/axios';
import { z } from 'zod';
import { 
  TransactionSchema, 
  type Transaction, 
  type TransactionStatus 
} from '@/shared/lib/schemas/openapi.schema';

const TransactionArraySchema = z.array(TransactionSchema);

export const transactionsApi = {
  getTransactions: async (page = 1, pageSize = 50): Promise<Transaction[]> => {
    const { data } = await apiClient.get('/Transactions', {
      params: { page, pageSize }
    });

    // Handle both paginated { items: [...] } and plain array responses
    const raw: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : [];

    const result = TransactionArraySchema.safeParse(raw);
    if (!result.success) {
      console.warn(
        '[TransactionsAPI] Schema mismatch — raw data returned. Issues:',
        result.error.flatten(),
      );
      return raw as Transaction[];
    }
    return result.data;
  },

  submitOcrResult: async (file: File): Promise<Transaction> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Artificial delay for UI scanning animation to show
      const minDelay = new Promise(resolve => setTimeout(resolve, 2500));
      const request = apiClient.post('/Transactions/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const [response] = await Promise.all([request, minDelay]);
      const { data } = response;
      
      const result = TransactionSchema.safeParse(data);
      if (!result.success) return data as Transaction;
      return result.data;
    } catch (error: any) {
      console.error('OCR Upload Error Details:', error.response?.data);
      throw error;
    }
  },

  updateTransactionStatus: async (id: string, status: TransactionStatus): Promise<Transaction> => {
    const { data } = await apiClient.patch(`/Transactions/${id}/status`, { status });
    const result = TransactionSchema.safeParse(data);
    if (!result.success) return data as Transaction;
    return result.data;
  },
};
