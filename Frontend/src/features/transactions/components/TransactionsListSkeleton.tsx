import { Skeleton } from '@/shared/ui/Skeleton';

export function TransactionsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ 
            background: 'var(--color-surface)',
            border: '1px solid var(--color-surface-border)',
          }}
        >
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
