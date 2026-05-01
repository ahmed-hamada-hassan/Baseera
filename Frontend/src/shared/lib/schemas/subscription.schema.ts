/**
 * @file shared/lib/schemas/subscription.schema.ts
 * @description Zod schemas للتحقق من بيانات الاشتراكات في وقت التشغيل
 */

import { z } from 'zod';

export const SubscriptionPlanSchema = z.enum(['free', 'starter', 'growth', 'enterprise']);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

export const SubscriptionStatusSchema = z.enum(['active', 'cancelled', 'past_due', 'trialing', 'expired']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const SubscriberSchema = z.object({
  id:           z.string().uuid(),
  name:         z.string().min(1).max(150),
  email:        z.string().email(),
  plan:         SubscriptionPlanSchema,
  status:       SubscriptionStatusSchema,
  amount:       z.number().nonnegative(),
  currency:     z.string().length(3).default('SAR'),
  startDate:    z.string().datetime({ offset: true }),
  nextBilling:  z.string().datetime({ offset: true }).optional(),
  cancelledAt:  z.string().datetime({ offset: true }).nullable().optional(),
  createdAt:    z.string().datetime({ offset: true }),
});
export type Subscriber = z.infer<typeof SubscriberSchema>;

export const SubscriptionListSchema = z.object({
  data:       z.array(SubscriberSchema),
  total:      z.number().int().nonnegative(),
  page:       z.number().int().positive(),
  pageSize:   z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type SubscriptionList = z.infer<typeof SubscriptionListSchema>;

/* نموذج الاشتراك — للتحقق من مدخلات المستخدم */
export const CreateSubscriptionFormSchema = z.object({
  name:     z.string().min(2, 'الاسم مطلوب').max(150),
  email:    z.string().email('البريد الإلكتروني غير صالح'),
  plan:     SubscriptionPlanSchema,
  currency: z.string().length(3).default('SAR'),
});
export type CreateSubscriptionForm = z.infer<typeof CreateSubscriptionFormSchema>;
