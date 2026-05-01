/**
 * @file shared/ui/Notification/Notification.tsx
 * @description شريط الإشعارات العالمي — يقرأ من ui.store
 * يُوضع مرة واحدة في AppLayout وليس في كل صفحة
 */

import { useEffect } from 'react';
import { useUIStore } from '@/shared/store/ui.store';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const CONFIG = {
  success: {
    icon: CheckCircle,
    bg:   'rgba(16,185,129,0.12)',
    border:'rgba(16,185,129,0.3)',
    color: '#10b981',
  },
  error: {
    icon: XCircle,
    bg:   'rgba(244,63,94,0.12)',
    border:'rgba(244,63,94,0.3)',
    color: '#f43f5e',
  },
  info: {
    icon: Info,
    bg:   'rgba(99,102,241,0.12)',
    border:'rgba(99,102,241,0.3)',
    color: '#6366f1',
  },
} as const;

const AUTO_DISMISS_MS = 4000;

export function Notification() {
  const notification    = useUIStore((s) => s.notification);
  const clearNotification = useUIStore((s) => s.clearNotification);

  /* تلاشي تلقائي بعد 4 ثوانٍ */
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(clearNotification, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  if (!notification) return null;

  const cfg = CONFIG[notification.type];
  const Icon = cfg.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-slide-in"
      style={{ minWidth: '320px', maxWidth: '480px' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-card"
        style={{
          background:   cfg.bg,
          border:       `1px solid ${cfg.border}`,
          color:        '#e2e8f0',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Icon size={18} style={{ color: cfg.color, flexShrink: 0 }} />
        <span className="flex-1">{notification.message}</span>
        <button
          onClick={clearNotification}
          aria-label="إغلاق الإشعار"
          className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
