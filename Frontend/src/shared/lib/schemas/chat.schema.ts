/**
 * @file shared/lib/schemas/chat.schema.ts
 * @description Zod schemas للتحقق من بيانات المحادثة في وقت التشغيل
 */

import { z } from 'zod';

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageSchema = z.object({
  id:          z.string().uuid(),
  role:        MessageRoleSchema,
  content:     z.string().min(1),
  timestamp:   z.string().datetime({ offset: true }),
  isStreaming: z.boolean().optional().default(false),
  metadata:    z.record(z.string(), z.unknown()).optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ChatSessionSchema = z.object({
  id:         z.string().uuid(),
  title:      z.string().optional(),
  messages:   z.array(MessageSchema),
  createdAt:  z.string().datetime({ offset: true }),
  updatedAt:  z.string().datetime({ offset: true }),
});
export type ChatSession = z.infer<typeof ChatSessionSchema>;

/* طلب إرسال رسالة */
export const SendMessageRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  content:   z.string().min(1, 'الرسالة لا يمكن أن تكون فارغة').max(4000),
  context:   z.record(z.string(), z.unknown()).optional(),
});
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

/* استجابة الذكاء الاصطناعي */
export const AiResponseSchema = z.object({
  messageId:  z.string().uuid(),
  sessionId:  z.string().uuid(),
  content:    z.string(),
  sources:    z.array(z.string().url()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});
export type AiResponse = z.infer<typeof AiResponseSchema>;
