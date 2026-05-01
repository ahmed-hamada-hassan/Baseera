/**
 * @file shared/ui/Button/Button.tsx
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     ReactNode;
  iconLeft?: ReactNode;
  children:  ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-brand-600 hover:bg-brand-500 text-white shadow-glow hover:shadow-card-hover',
  secondary: 'bg-surface-card border border-surface-border hover:bg-surface-hover text-slate-200',
  ghost:     'bg-transparent hover:bg-surface-hover text-slate-300 hover:text-white',
  danger:    'bg-accent-rose/10 border border-accent-rose/30 hover:bg-accent-rose/20 text-accent-rose',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8  px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  icon,
  iconLeft,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium rounded-btn',
        'transition-all duration-200 ease-in-out',
        'focus-ring select-none',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : iconLeft}
      <span>{children}</span>
      {!loading && icon}
    </button>
  );
}
