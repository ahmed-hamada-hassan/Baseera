import apiClient from '@/shared/lib/axios';
import { z } from 'zod';
import { 
  SubscriptionSchema, 
  type Subscription 
} from '@/shared/lib/schemas/openapi.schema';

const SubscriptionArraySchema = z.array(SubscriptionSchema);

export const subscriptionsApi = {
  getSubscriptions: async (): Promise<Subscription[]> => {
    const { data } = await apiClient.get('/Subscriptions');

    const raw: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.items) ? data.items
      : Array.isArray(data?.data)  ? data.data
      : [];

    const result = SubscriptionArraySchema.safeParse(raw);
    if (!result.success) {
      console.warn('[SubscriptionsAPI] Schema mismatch:', result.error.flatten());
      return raw as Subscription[];
    }
    return result.data;
  },

  cancelSubscription: async (id: string): Promise<Subscription> => {
    const { data } = await apiClient.patch(`/Subscriptions/${id}/cancel`);
    const result = SubscriptionSchema.safeParse(data);
    if (!result.success) return data as Subscription;
    return result.data;
  },
};
