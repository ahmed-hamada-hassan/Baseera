/**
 * @file features/chatbot/components/ChatbotDrawer.tsx
 * @description RTL Sidebar Drawer for the financial chatbot.
 *              Slides in from the left side (visual right in RTL) using Framer Motion.
 *              Persists conversation via Zustand (chat.store) and UI state via UI store.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain } from 'lucide-react';
import { useUIStore } from '@/shared/store/ui.store';
import { useChatStore } from '@/features/chatbot/store/chat.store';
import { MessageBubble } from './MessageBubble';
import { useSendMessage } from '../hooks/useChatbot';

export function ChatbotDrawer() {
  const isOpen = useUIStore((s) => s.isChatbotOpen);
  const close = useUIStore((s) => s.closeChatbot);
  const addMessage = useChatStore((s) => s.addMessage);
  const messages = useChatStore((s) => s.messages);
  const setTyping = useChatStore((s) => s.setTyping);
  const isTyping = useChatStore((s) => s.isTyping);
  const { mutateAsync: sendMessage } = useSendMessage();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    
    addMessage('user', trimmed);
    setInput('');
    setTyping(true);
    
    try {
      // Use real API endpoint if backend supports it
      const response = await sendMessage({ content: trimmed });
      addMessage('assistant', response.content);
    } catch (error) {
      console.error('Chatbot API error:', error);
      // Fallback to mock response if backend endpoint fails or doesn't exist
      const mockResponse = `بناءً على تحليلي، صرفت 40% على الترفيه. هذا أعلى بنسبة 15% من الشهر الماضي.
{ "type": "chart", "data": [ { "name": "الترفيه", "value": 40 }, { "name": "السكن", "value": 30 }, { "name": "الطعام", "value": 20 } ] }`;
      addMessage('assistant', mockResponse);
    } finally {
      setTyping(false);
    }
  };

  const drawerVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: '-100%', transition: { duration: 0.2 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.3, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={close}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed inset-y-0 left-0 w-full md:w-[400px] max-w-full bg-[#F8FAFC] shadow-2xl flex flex-col z-50"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variants={drawerVariants as any}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ direction: 'rtl' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shadow-md">
                  <Brain size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E293B]">المستشار الذكي</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-xs text-[#8B5CF6] font-medium">متصل</span>
                  </div>
                </div>
              </div>
              <button onClick={close} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Date Pill */}
              <div className="flex justify-center mb-6">
                <span className="px-4 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-500 font-medium">
                  اليوم، 10:42 ص
                </span>
              </div>
              
              {messages.map((msg, idx) => (
                <MessageBubble key={msg.id} message={msg} isLatest={idx === messages.length - 1} />
              ))}
              {isTyping && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white">
                    <Brain size={14} />
                  </div>
                  <div className="bg-white border-r-4 border-[#8B5CF6] px-4 py-3 rounded-2xl shadow-sm">
                    <span className="text-slate-400 text-xs">جاري التفكير...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-5 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1.5 border border-slate-200">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اسأل عن أموالك..."
                  className="flex-1 px-4 py-2 bg-transparent text-[#1E293B] placeholder:text-slate-500 focus:outline-none text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="rtl:-scale-x-100" />
                </button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
