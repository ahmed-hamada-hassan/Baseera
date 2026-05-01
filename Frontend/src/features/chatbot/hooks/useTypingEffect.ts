/**
 * @file features/chatbot/hooks/useTypingEffect.ts
 * @description هوك لمحاكاة تأثير الكتابة (Streaming/Typing Effect)
 */

import { useState, useEffect } from 'react';

export function useTypingEffect(text: string, speed: number = 20) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(() => {
        const nextContent = text.slice(0, i + 1);
        return nextContent;
      });
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isComplete };
}
