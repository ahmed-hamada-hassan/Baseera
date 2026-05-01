/**
 * @file features/chatbot/components/MessageBubble.tsx
 * @description The Wow Factor: Rich Media Chat Bubble with Markdown & Recharts
 */

import { useMemo } from 'react';
import type { Message } from '@/shared/lib/schemas/chat.schema';
import ReactMarkdown from 'react-markdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useTypingEffect } from '../hooks/useTypingEffect';

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

interface ChartDataItem {
  name: string;
  value: number;
}

function parseChatMessage(content: string): { pureText: string; chartData: ChartDataItem[] | null } {
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\n]*"type"[\s\n]*:[\s\n]*"chart"[\s\n]*,[\s\S]*\}$/);
  
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && parsed.type === 'chart' && Array.isArray(parsed.data)) {
        return { 
          pureText: content.substring(0, jsonMatch.index).trim(), 
          chartData: parsed.data as ChartDataItem[]
        };
      }
    } catch {
      // Ignore
    }
  }
  return { pureText: content, chartData: null };
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const shouldAnimate = !isUser && isLatest && !message.isStreaming;
  
  // Separate text and JSON to avoid typing out the JSON block
  const { pureText, chartData } = useMemo(() => parseChatMessage(message.content), [message.content]);

  // Apply typing effect ONLY to the pure text part
  const { displayedText } = useTypingEffect(pureText, shouldAnimate ? 15 : 0);
  const textToShow = shouldAnimate ? displayedText : pureText;
  
  // Only show chart after typing is done
  const isTypingDone = !shouldAnimate || displayedText.length >= pureText.length;

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

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
        <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert text-white' : 'prose-slate text-[#1E293B]'}`}>
          <ReactMarkdown>{textToShow}</ReactMarkdown>
        </div>

        {chartData && isTypingDone && (
          <div className="w-full h-56 mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 mb-4 font-bold text-center uppercase tracking-wider">تحليل توزيع النفقات</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                  {chartData.map((_entry: ChartDataItem, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] || '#8B5CF6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
