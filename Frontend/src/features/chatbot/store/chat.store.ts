/**
 * @file features/chatbot/store/chat.store.ts
 * @description Zustand store لإدارة حالة المحادثة — أسرع من Context API
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '@/shared/lib/schemas/chat.schema';

const WELCOME_MSG: Message = {
  id: 'welcome-msg',
  role: 'assistant',
  content: 'مرحباً! أنا بصيرة، مساعدك الذكي لتحليل بياناتك المالية. كيف يمكنني مساعدتك اليوم؟',
  timestamp: new Date().toISOString(),
  isStreaming: false,
};

interface ChatState {
  sessionId: string | null;
  messages: Message[];
  isTyping: boolean;
  error: string | null;

  // Actions
  setSessionId: (id: string) => void;
  addMessage: (role: Message['role'], content: string) => Message;
  setTyping: (value: boolean) => void;
  setError: (err: string | null) => void;
  updateLastMessage: (content: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        sessionId: null,
        messages: [WELCOME_MSG],
        isTyping: false,
        error: null,

        setSessionId: (id) => set({ sessionId: id }),

        addMessage: (role, content) => {
          const message: Message = {
            id: uuidv4(),
            role,
            content,
            timestamp: new Date().toISOString(),
            isStreaming: false,
          };
          set((state) => ({ messages: [...state.messages, message] }));
          return message;
        },

        setTyping: (value) => set({ isTyping: value }),

        setError: (err) => set({ error: err }),

        /** تحديث آخر رسالة — مفيد للـ Streaming */
        updateLastMessage: (content) => {
          const msgs = [...get().messages];
          const last = msgs[msgs.length - 1];
          if (last) {
            msgs[msgs.length - 1] = { ...last, content };
            set({ messages: msgs });
          }
        },

        clearChat: () =>
          set({
            messages: [{ ...WELCOME_MSG, id: uuidv4(), timestamp: new Date().toISOString() }],
            sessionId: null,
            error: null,
          }),
      }),
      {
        name: 'basira-chat-storage',
        // Save only needed slices
        partialize: (state) => ({ messages: state.messages, sessionId: state.sessionId }),
      }
    ),
    { name: 'basira-chat' }
  )
);
