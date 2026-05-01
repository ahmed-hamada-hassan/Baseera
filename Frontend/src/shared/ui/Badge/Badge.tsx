/**
 * @file shared/ui/Badge/Badge.tsx
 */

import type { ReactNode } from 'react';

type BadgeVariant = 'active' | 'cancelled' | 'pending' | 'trialing' | 'expired' | 'info' | 'warning' | 'critical';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?:     boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  active:    'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30',
  cancelled: 'bg-accent-rose/15    text-accent-rose    border-accent-rose/30',
  pending:   'bg-accent-amber/15   text-accent-amber   border-accent-amber/30',
  trialing:  'bg-accent-cyan/15    text-accent-cyan    border-accent-cyan/30',
  expired:   'bg-slate-500/15      text-slate-400      border-slate-500/30',
  info:      'bg-brand-500/15      text-brand-400      border-brand-500/30',
  warning:   'bg-accent-amber/15   text-accent-amber   border-accent-amber/30',
  critical:  'bg-accent-rose/20    text-accent-rose    border-accent-rose/40',
};

const dotColors: Record<BadgeVariant, string> = {
  active:    'bg-accent-emerald',
  cancelled: 'bg-accent-rose',
  pending:   'bg-accent-amber',
  trialing:  'bg-accent-cyan',
  expired:   'bg-slate-500',
  info:      'bg-brand-400',
  warning:   'bg-accent-amber',
  critical:  'bg-accent-rose',
};

export function Badge({ variant = 'info', children, dot = false, className = '' }: BadgeProps) {
  return (
    <span className={[
      'inline-flex items-center gap-1.5',
      'px-2.5 py-0.5 rounded-full text-xs font-medium',
      'border',
      variantStyles[variant],
      className
    ].join(' ').trim()}>
      {dot && (
        <span className={['w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant]].join(' ')} />
      )}
      {children}
    </span>
  );
}
