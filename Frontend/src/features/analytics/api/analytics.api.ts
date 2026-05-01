/**
 * @file features/analytics/api/analytics.api.ts
 */

import apiClient from '@/shared/lib/axios';
import { AnalyticsSummarySchema, type AnalyticsSummary } from '@/shared/lib/schemas/analytics.schema';

type Period = '7d' | '30d' | '90d' | '1y';

export const analyticsApi = {
  getSummary: async (period: Period = '30d'): Promise<AnalyticsSummary> => {
    const { data } = await apiClient.get('/analytics/summary', { params: { period } });
    const result = AnalyticsSummarySchema.safeParse(data);
    if (!result.success) {
      console.warn('[AnalyticsAPI] Schema mismatch:', result.error.flatten());
      return data as AnalyticsSummary;
    }
    return result.data;
  },

  getRevenue: async (period: Period = '30d') => {
    const { data } = await apiClient.get('/analytics/revenue', { params: { period } });
    const result = AnalyticsSummarySchema.shape.revenue.safeParse(data);
    if (!result.success) return data;
    return result.data;
  },
};
