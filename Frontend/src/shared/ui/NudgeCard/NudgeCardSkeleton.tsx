import { Card } from '@/shared/ui/Card/Card';
import { Skeleton } from '@/shared/ui/Skeleton';

export function NudgeCardSkeleton() {
  return (
    <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-10 w-full sm:w-32 rounded-xl" />
    </Card>
  );
}
