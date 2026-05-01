/**
 * @file features/chatbot/api/chatbot.api.ts
 */

import apiClient, { tokenService } from '@/shared/lib/axios';
import {
  type SendMessageRequest,
  type ChatSession,
  ChatSessionSchema,
} from '@/shared/lib/schemas/chat.schema';

export const chatbotApi = {
  /** إرسال رسالة للـ AI */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage: async (payload: SendMessageRequest): Promise<any> => {
    const jwtToken = tokenService.get();
    const response = await fetch("http://localhost:8000/api/chatbot/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ message: payload.content }),
    });

    if (!response.ok) {
      let errorDetail = 'Chatbot API Error';
      try {
        const error = await response.json();
        errorDetail = error.detail || errorDetail;
      } catch {
        // Ignore json parse error
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return data;
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
