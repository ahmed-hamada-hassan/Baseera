/**
 * @file shared/ui/Form/FormSelect.tsx
 */

import type { SelectHTMLAttributes } from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label:        string;
  id:           string;
  registration: UseFormRegisterReturn;
  options:      SelectOption[];
  error?:       FieldError | undefined;
  placeholder?: string;
}

export function FormSelect({
  label,
  id,
  registration,
  options,
  error,
  placeholder,
  ...rest
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
        {rest.required && (
          <span className="text-accent-rose mr-1" aria-hidden="true">*</span>
        )}
      </label>

      <select
        id={id}
        aria-invalid={!!error}
        className={[
          'w-full h-10 px-3 rounded-btn text-sm',
          'bg-surface-card border text-slate-200',
          'transition-colors duration-150 cursor-pointer',
          'focus-ring focus:outline-none',
          'appearance-none',
          error
            ? 'border-accent-rose/60 focus:border-accent-rose'
            : 'border-surface-border focus:border-brand-500',
        ].join(' ')}
        {...registration}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-card">
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p role="alert" className="text-xs text-accent-rose flex items-center gap-1">
          <span>⚠</span>
          {error.message}
        </p>
      )}
    </div>
  );
}
