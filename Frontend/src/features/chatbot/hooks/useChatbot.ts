import { useMutation, useQuery } from '@tanstack/react-query';
import { chatbotApi } from '../api/chatbot.api';
import type { SendMessageRequest } from '@/shared/lib/schemas/chat.schema';

export function useSendMessage() {
  return useMutation({
    mutationFn: (payload: SendMessageRequest) => chatbotApi.sendMessage(payload),
  });
}

export function useChatSession(sessionId: string) {
  return useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: () => chatbotApi.getSession(sessionId),
    enabled: !!sessionId,
  });
}

export function useCreateChatSession() {
  return useMutation({
    mutationFn: () => chatbotApi.createSession(),
  });
}
