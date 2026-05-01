/**
 * @file src/shared/lib/schemas/openapi.schema.ts
 * @description Zod schemas and TypeScript types generated from openapi.yaml
 */

import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  monthlyIncome: z.number().nonnegative(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  expiration: z.string().datetime({ offset: true }),
  userId: z.string(),
  email: z.string().email(),
  fullName: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ── Accounts ──────────────────────────────────────────────────────────

export const AccountSchema = z.object({
  id: z.string().uuid(),
  providerName: z.string(),
  balance: z.number(),
});
export type Account = z.infer<typeof AccountSchema>;

export const SyncRequestSchema = z.object({
  accountId: z.string().uuid(),
});
export type SyncRequest = z.infer<typeof SyncRequestSchema>;

export const SyncResponseSchema = z.object({
  message: z.string(),
  transactionsSynced: z.number().int(),
  subscriptionsDetected: z.number().int(),
});
export type SyncResponse = z.infer<typeof SyncResponseSchema>;

// ── Transactions ──────────────────────────────────────────────────────

export const TransactionStatusSchema = z.enum(['Pending', 'Confirmed', 'Flagged']);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid().nullable().optional(),
  amount: z.number(),
  merchantName: z.string(),
  category: z.string(),
  source: z.string(),
  status: TransactionStatusSchema,
  isSubscription: z.boolean(),
  transactionDate: z.string().datetime({ offset: true }),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const OcrResultSchema = z.object({
  amount: z.number(),
  merchantName: z.string().max(250),
  category: z.string().max(100).optional(),
  transactionDate: z.string().datetime({ offset: true }).optional(),
  rawAiData: z.string().nullable().optional(),
});
export type OcrResult = z.infer<typeof OcrResultSchema>;

export const UpdateTransactionStatusSchema = z.object({
  status: TransactionStatusSchema,
});
export type UpdateTransactionStatus = z.infer<typeof UpdateTransactionStatusSchema>;

// ── Subscriptions ─────────────────────────────────────────────────────

export const SubscriptionStatusSchema = z.enum(['Active', 'AtRisk', 'Cancelled']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  serviceName: z.string(),
  monthlyCost: z.number(),
  lastPaymentDate: z.string().datetime({ offset: true }),
  lastActivityDate: z.string().datetime({ offset: true }).nullable().optional(),
  usageScore: z.number().min(0).max(1),
  status: SubscriptionStatusSchema,
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

// ── Dashboard ─────────────────────────────────────────────────────────

export const SpendByCategorySchema = z.object({
  category: z.string(),
  amount: z.number(),
});
export type SpendByCategory = z.infer<typeof SpendByCategorySchema>;

export const DashboardSchema = z.object({
  monthlyIncome: z.number(),
  totalSpendThisMonth: z.number(),
  remainingBudget: z.number(),
  totalSubscriptionCost: z.number(),
  activeSubscriptions: z.number().int(),
  atRiskSubscriptions: z.number().int(),
  atRiskSubscriptionsList: z.array(SubscriptionSchema),
  spendByCategory: z.array(SpendByCategorySchema),
});
export type Dashboard = z.infer<typeof DashboardSchema>;
