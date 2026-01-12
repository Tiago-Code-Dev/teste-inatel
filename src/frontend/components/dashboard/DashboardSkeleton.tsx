import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/60',
        className
      )}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-12 h-5" />
      </div>
      <div>
        <Skeleton className="w-20 h-3 mb-2" />
        <Skeleton className="w-16 h-8 mb-1" />
        <Skeleton className="w-24 h-4" />
      </div>
    </div>
  );
}

export function StatusCardSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border">
      <Skeleton className="w-5 h-5 rounded-full" />
      <div className="flex-1">
        <Skeleton className="w-8 h-7 mb-1" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
  );
}

export function MachineCardSkeleton() {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="w-32 h-5 mb-1" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
        <Skeleton className="w-3 h-3 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
      </div>
      <div className="pt-3 border-t border-border">
        <Skeleton className="w-36 h-4" />
      </div>
    </div>
  );
}

export function AlertCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3">
        <Skeleton className="w-6 h-6 rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="w-full h-4 mb-1" />
          <Skeleton className="w-24 h-3" />
        </div>
        <Skeleton className="w-16 h-3" />
      </div>
    );
  }

  return (
    <div className="card-elevated p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-20 h-5 rounded-full" />
        </div>
        <Skeleton className="w-20 h-4" />
      </div>
      <Skeleton className="w-full h-5 mb-2" />
      <Skeleton className="w-3/4 h-4 mb-4" />
      <div className="flex gap-3 pt-3 border-t border-border">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-32 h-4" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="flex-1 h-10 rounded-lg" />
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatusCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-20 h-5" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MachineCardSkeleton key={i} />
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-36 h-6" />
            <Skeleton className="w-20 h-5" />
          </div>
          <div className="card-elevated divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <AlertCardSkeleton key={i} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
