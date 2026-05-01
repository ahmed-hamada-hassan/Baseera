/**
 * @file features/analytics/hooks/useAnalytics.ts
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';

type Period = '7d' | '30d' | '90d' | '1y';

export const analyticsKeys = {
  all:     ['analytics'] as const,
  summary: (period: Period) => [...analyticsKeys.all, 'summary', period] as const,
};

export function useAnalyticsSummary(period: Period = '30d') {
  return useQuery({
    queryKey: analyticsKeys.summary(period),
    queryFn:  () => analyticsApi.getSummary(period),
    staleTime: 1000 * 60 * 2,  // 2 دقيقة — بيانات التحليلات تتغير أسرع
  });
}
