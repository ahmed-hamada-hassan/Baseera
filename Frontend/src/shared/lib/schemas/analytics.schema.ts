/**
 * @file shared/lib/schemas/analytics.schema.ts
 * @description Zod schemas للتحقق من بيانات التحليلات في وقت التشغيل
 */

import { z } from 'zod';

export const KpiCardSchema = z.object({
  id:           z.string(),
  label:        z.string(),
  value:        z.union([z.string(), z.number()]),
  change:       z.number(),                  // نسبة التغيير %
  changeType:   z.enum(['positive', 'negative', 'neutral']),
  icon:         z.string(),
  prefix:       z.string().optional(),       // مثل: "ر.س"
  suffix:       z.string().optional(),       // مثل: "%"
});
export type KpiCard = z.infer<typeof KpiCardSchema>;

export const RevenueDataPointSchema = z.object({
  date:    z.string(),
  revenue: z.number().nonnegative(),
  mrr:     z.number().nonnegative(),
  arr:     z.number().nonnegative(),
});
export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;

export const UserGrowthDataPointSchema = z.object({
  date:       z.string(),
  newUsers:   z.number().int().nonnegative(),
  churned:    z.number().int().nonnegative(),
  netGrowth:  z.number().int(),
});
export type UserGrowthDataPoint = z.infer<typeof UserGrowthDataPointSchema>;

export const AnalyticsSummarySchema = z.object({
  kpis:        z.array(KpiCardSchema),
  revenue:     z.array(RevenueDataPointSchema),
  userGrowth:  z.array(UserGrowthDataPointSchema),
  period:      z.enum(['7d', '30d', '90d', '1y']),
  generatedAt: z.string().datetime({ offset: true }),
});
export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;
