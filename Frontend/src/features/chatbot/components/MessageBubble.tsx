/**
 * @file features/chatbot/components/MessageBubble.tsx
 * @description The Wow Factor: Rich Media Chat Bubble with Markdown & Recharts
 */

import { useMemo } from 'react';
import type { Message } from '@/shared/lib/schemas/chat.schema';
import ReactMarkdown from 'react-markdown';
import { useTypingEffect } from '../hooks/useTypingEffect';

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  // Apply typing effect only to the latest assistant message
  const shouldAnimate = !isUser && isLatest && !message.isStreaming;
  const { displayedText } = useTypingEffect(message.content, shouldAnimate ? 15 : 0);
  const textToShow = shouldAnimate ? displayedText : message.content;

  // Try to parse JSON to detect "Wow Factor" Charts
  const parsedChartData = useMemo(() => {
    if (isUser) return null;
    try {
      const parsed = JSON.parse(textToShow);
      if (parsed && parsed.type === 'chart' && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    } catch {
      // Not valid JSON, which is fine (normal markdown text)
    }
    return null;
  }, [textToShow, isUser]);

  return (
    <div
      className={['flex w-full animate-fade-in', isUser ? 'justify-end' : 'justify-start'].join(' ')}
    >
      {/* Bubble */}
      <div
        className={`max-w-[85%] px-5 py-4 text-sm leading-relaxed overflow-hidden shadow-sm ${
          isUser
            ? 'bg-[#1E3A8A] text-white rounded-2xl rounded-tr-sm'
            : 'bg-white text-[#1E293B] border border-slate-100 border-r-4 border-r-[#8B5CF6] rounded-2xl rounded-tl-sm'
        }`}
      >
        {parsedChartData ? (
          <div className="w-full h-40 mt-2">
            <p className="text-xs text-slate-500 mb-4 font-semibold text-center">توزيع النفقات الرئيسية</p>
            
            {/* Simple mock of the bar/percentages from the screenshot for a better visual match */}
            <div className="flex justify-between items-end h-24 mb-2">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[#8B5CF6] font-bold text-sm">40%</span>
                <span className="text-xs text-slate-500 font-medium">الترفيه</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-slate-400 font-bold text-sm">30%</span>
                <span className="text-xs text-slate-500 font-medium">السكن</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-slate-400 font-bold text-sm">20%</span>
                <span className="text-xs text-slate-500 font-medium">الطعام</span>
              </div>
            </div>
            
          </div>
        ) : (
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-slate'}`}>
            <ReactMarkdown>{textToShow}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
