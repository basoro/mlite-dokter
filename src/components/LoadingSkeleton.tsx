import { Skeleton } from '@/components/ui/skeleton';

export const CardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-24 rounded-xl" />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full rounded-lg" />
    {[...Array(rows)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full rounded-lg" />
    ))}
  </div>
);
