/**
 * @file shared/ui/NudgeCard/NudgeCard.tsx
 * @description مكون تنبيه ذكي قابل لإعادة الاستخدام (Dumb Component). 
 * يُستخدم للاشتراكات، تجاوز الميزانية، أو أي تنبيهات تتطلب انتباهاً لطيفاً.
 */

import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NudgeCardProps {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  variant?: 'info' | 'warning' | 'critical';
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: (id: string) => void;
  isVisible?: boolean;
}

export function NudgeCard({
  id,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  onDismiss,
  isVisible = true,
}: NudgeCardProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative flex flex-col p-5 rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#DDD6FE] shadow-sm"
          role="alert"
        >
          {/* Header Row */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#8B5CF6] font-bold text-sm">{title}</span>
            </div>
            {icon && (
              <div className="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#8B5CF6] flex items-center justify-center">
                {icon}
              </div>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-[#334155] leading-relaxed mb-4 text-right">
            {description}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto justify-end">
            {onDismiss && (
              <button
                onClick={() => onDismiss(id)}
                className="flex-1 py-2 text-sm font-medium text-[#475569] bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50 transition-colors"
              >
                تجاهل
              </button>
            )}
            {actionLabel && (
              <button
                onClick={onAction}
                className="flex-1 py-2 text-sm font-medium text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
