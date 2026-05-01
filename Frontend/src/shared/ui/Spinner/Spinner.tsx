/**
 * @file shared/ui/Spinner/Spinner.tsx
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export function Spinner({ size = 'md', label = 'جارٍ التحميل...' }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center gap-3">
      <div
        className={[
          'rounded-full',
          'border-surface-border border-t-brand-500',
          'animate-spin',
          sizeMap[size],
        ].join(' ')}
      />
      {label && size === 'lg' && (
        <span className="text-sm text-slate-400">{label}</span>
      )}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
