/**
 * @file shared/ui/Card/Card.tsx
 */

import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  glow?:    boolean;
  hoverable?: boolean;
}

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export function Card({
  children,
  padding    = 'md',
  glow       = false,
  hoverable  = true,
  className  = '',
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        'glass-card',
        paddingMap[padding],
        glow ? 'animate-pulse-glow' : '',
        !hoverable ? '[&]:hover:transform-none [&]:hover:shadow-none' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
