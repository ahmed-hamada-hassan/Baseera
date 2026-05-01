import apiClient from '@/shared/lib/axios';
import { z } from 'zod';
import { 
  AccountSchema, 
  type Account,
  SyncResponseSchema,
  type SyncResponse
} from '@/shared/lib/schemas/openapi.schema';

const AccountArraySchema = z.array(AccountSchema);

export const accountsApi = {
  getAccounts: async (): Promise<Account[]> => {
    const { data } = await apiClient.get('/Accounts');

    const raw: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.items) ? data.items
      : Array.isArray(data?.data)  ? data.data
      : [];

    const result = AccountArraySchema.safeParse(raw);
    if (!result.success) {
      console.warn('[AccountsAPI] Schema mismatch:', result.error.flatten());
      return raw as Account[];
    }
    return result.data;
  },

  syncAccounts: async (accountId: string): Promise<SyncResponse> => {
    const { data } = await apiClient.post('/Accounts/sync', { accountId });
    const result = SyncResponseSchema.safeParse(data);
    if (!result.success) return data as SyncResponse;
    return result.data;
  },
};
