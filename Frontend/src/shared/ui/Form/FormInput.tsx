/**
 * @file shared/ui/Form/FormInput.tsx
 * @description حقل إدخال متكامل مع react-hook-form بدون re-renders عشوائية
 */

import type { InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label:        string;
  id:           string;
  registration: UseFormRegisterReturn;
  error?:       FieldError | undefined;
  hint?:        string;
  suffix?:      string;   // مثل: "ر.س"
  prefix?:      string;   // مثل: "@"
}

export function FormInput({
  label,
  id,
  registration,
  error,
  hint,
  suffix,
  prefix,
  type = 'text',
  ...rest
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-300"
      >
        {label}
        {rest.required && (
          <span className="text-accent-rose mr-1" aria-hidden="true">*</span>
        )}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
            {prefix}
          </span>
        )}

        <input
          id={id}
          type={type}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={!!error}
          className={[
            'w-full h-10 rounded-btn text-sm',
            'bg-surface-card border text-slate-200',
            'transition-colors duration-150',
            'placeholder:text-slate-600',
            'focus-ring focus:outline-none',
            prefix ? 'pr-8 pl-3' : 'px-3',
            suffix ? 'pl-10' : '',
            error
              ? 'border-accent-rose/60 focus:border-accent-rose'
              : 'border-surface-border focus:border-brand-500',
          ].join(' ')}
          {...registration}
          {...rest}
        />

        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-accent-rose flex items-center gap-1">
          <span>⚠</span>
          {error.message}
        </p>
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}
