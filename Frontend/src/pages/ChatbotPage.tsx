/**
 * @file pages/ChatbotPage.tsx
 */

import { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card }   from '@/shared/ui/Card/Card';
import { Button } from '@/shared/ui/Button/Button';
import { useChatStore } from '@/features/chatbot/store/chat.store';
import { SendMessageRequestSchema, type SendMessageRequest } from '@/shared/lib/schemas/chat.schema';
import { chatbotApi } from '@/features/chatbot/api/chatbot.api';
import { MessageSquare, Send, Trash2, Sparkles, Bot } from 'lucide-react';

const QUICK_PROMPTS = [
  'ما هو أداء الإيرادات هذا الشهر؟',
  'أعطني تحليلاً لمعدل إلغاء الاشتراكات',
  'من هم أكثر المشتركين قيمةً؟',
  'ما توقعات الإيراد للربع القادم؟',
];

export function ChatbotPage() {
  const { messages, isTyping, addMessage, setTyping, clearChat, sessionId, setSessionId } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SendMessageRequest>({
    resolver: zodResolver(SendMessageRequestSchema),
  });

  // تمرير للأسفل عند كل رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const onSubmit = async (data: SendMessageRequest) => {
    addMessage('user', data.content);
    reset();
    setTyping(true);

    try {
      const response = await chatbotApi.sendMessage({
        content: data.content,
        sessionId: sessionId || undefined,
      });

      setTyping(false);
      addMessage('assistant', response.content);

      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }
    } catch (error) {
      console.error('[Chatbot Error]', error);
      setTyping(false);
      addMessage('assistant', 'عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    void onSubmit({ content: prompt });
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-4rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare size={28} style={{ color: 'var(--color-accent-violet)' }} />
            المساعد الذكي
          </h1>
          <p className="text-slate-400 mt-1 text-sm">اسأل بصيرة أي سؤال عن بياناتك</p>
        </div>
        <Button variant="ghost" size="sm" iconLeft={<Trash2 size={14} />} onClick={clearChat}>
          مسح المحادثة
        </Button>
      </div>

      {/* Chat Window */}
      <Card padding="none" hoverable={false} className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={['flex gap-3 animate-bubble', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'].join(' ')}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--color-brand-600), var(--color-accent-violet))'
                    : 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-emerald))',
                }}
              >
                {msg.role === 'user'
                  ? <span className="text-xs text-white font-bold">أ</span>
                  : <Bot size={14} className="text-white" />}
              </div>

              {/* Bubble */}
              <div
                className="max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={msg.role === 'user'
                  ? { background: 'var(--color-brand-600)', color: 'white', borderRadius: '18px 18px 4px 18px' }
                  : { background: 'var(--color-surface-hover)', color: '#e2e8f0', border: '1px solid var(--color-surface-border)', borderRadius: '18px 18px 18px 4px' }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center animate-fade-in">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-emerald))' }}
              >
                <Sparkles size={14} className="text-white" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex gap-1.5 items-center"
                style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-surface-border)' }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--color-brand-400)', animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div
            className="px-6 pb-3 flex flex-wrap gap-2 border-t pt-4"
            style={{ borderColor: 'var(--color-surface-border)' }}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors hover:text-white"
                style={{
                  borderColor: 'var(--color-brand-600)',
                  color: 'var(--color-brand-400)',
                  background: 'rgba(99,102,241,0.08)',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="p-4 border-t"
          style={{ borderColor: 'var(--color-surface-border)' }}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-3"
          >
            <div className="flex-1 relative">
              <input
                {...register('content')}
                placeholder="اكتب سؤالك هنا..."
                aria-label="رسالة للمساعد الذكي"
                autoComplete="off"
                className="w-full h-11 px-4 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
                style={{
                  background: 'var(--color-surface)',
                  border: errors.content
                    ? '1px solid var(--color-accent-rose)'
                    : '1px solid var(--color-surface-border)',
                }}
              />
            </div>
            <Button
              type="submit"
              loading={isTyping}
              icon={<Send size={16} />}
              aria-label="إرسال"
            >
              إرسال
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
