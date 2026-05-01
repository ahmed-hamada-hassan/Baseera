/**
 * @file features/chatbot/api/chatbot.api.ts
 */

import apiClient from '@/shared/lib/axios';
import {
  AiResponseSchema,
  type AiResponse,
  type SendMessageRequest,
  type ChatSession,
  ChatSessionSchema,
} from '@/shared/lib/schemas/chat.schema';

export const chatbotApi = {
  /** إرسال رسالة للـ AI */
  sendMessage: async (payload: SendMessageRequest): Promise<AiResponse> => {
    const { data } = await apiClient.post('/chatbot/message', payload);
    const result = AiResponseSchema.safeParse(data);
    if (!result.success) {
      console.warn('[ChatbotAPI] sendMessage schema mismatch:', result.error.flatten());
      return data as AiResponse;
    }
    return result.data;
  },

  /** جلب جلسة محادثة */
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const { data } = await apiClient.get(`/chatbot/sessions/${sessionId}`);
    const result = ChatSessionSchema.safeParse(data);
    if (!result.success) return data as ChatSession;
    return result.data;
  },

  /** إنشاء جلسة جديدة */
  createSession: async (): Promise<ChatSession> => {
    const { data } = await apiClient.post('/chatbot/sessions');
    const result = ChatSessionSchema.safeParse(data);
    if (!result.success) return data as ChatSession;
    return result.data;
  },
};
