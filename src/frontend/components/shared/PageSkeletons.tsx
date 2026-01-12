import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Base shimmer skeleton with animated gradient effect
 */
export function Shimmer({ className, rounded = 'md' }: ShimmerProps) {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted/50',
        roundedClasses[rounded],
        className
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ['calc(-100%)', 'calc(100%)'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 0.5,
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--muted-foreground) / 0.08), transparent)',
        }}
      />
    </div>
  );
}

/**
 * Device/Machine card skeleton
 */
export function DeviceCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
      <Shimmer className="w-12 h-12" rounded="xl" />
      <div className="flex-1 space-y-2">
        <Shimmer className="w-32 h-5" />
        <Shimmer className="w-20 h-4" />
      </div>
      <Shimmer className="w-20 h-6" rounded="full" />
    </div>
  );
}

/**
 * Tire card skeleton with pressure gauge
 */
export function TireCardSkeleton() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shimmer className="w-12 h-12" rounded="xl" />
          <div>
            <Shimmer className="h-5 w-24 mb-1" />
            <Shimmer className="h-4 w-16" />
          </div>
        </div>
        <Shimmer className="h-6 w-16" rounded="full" />
      </div>
      <Shimmer className="h-20 w-full mb-4" rounded="lg" />
      <Shimmer className="h-4 w-32" />
    </div>
  );
}

/**
 * Alert card skeleton
 */
export function AlertCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border-b border-border last:border-0">
        <Shimmer className="w-8 h-8" rounded="full" />
        <div className="flex-1 min-w-0 space-y-1">
          <Shimmer className="w-3/4 h-4" />
          <Shimmer className="w-24 h-3" />
        </div>
        <Shimmer className="w-16 h-5" rounded="full" />
      </div>
    );
  }

  return (
    <div className="card-elevated p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shimmer className="w-16 h-6" rounded="full" />
          <Shimmer className="w-20 h-6" rounded="full" />
        </div>
        <Shimmer className="w-20 h-4" />
      </div>
      <Shimmer className="w-full h-5" />
      <Shimmer className="w-3/4 h-4" />
      <div className="flex gap-2 pt-3 border-t border-border">
        <Shimmer className="flex-1 h-10" rounded="lg" />
        <Shimmer className="w-24 h-10" rounded="lg" />
      </div>
    </div>
  );
}

/**
 * Stats card skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <Shimmer className="w-8 h-8 mb-3" rounded="lg" />
      <Shimmer className="w-16 h-8 mb-1" />
      <Shimmer className="w-24 h-4" />
    </div>
  );
}

/**
 * Quick stats row skeleton (3 columns)
 */
export function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border">
          <Shimmer className="w-12 h-7 mb-1" />
          <Shimmer className="w-16 h-3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Shimmer 
          key={i} 
          className={cn(
            'h-4',
            i === 0 ? 'w-32' : 'flex-1'
          )} 
        />
      ))}
    </div>
  );
}

/**
 * Full page list skeleton
 */
export function ListPageSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Shimmer className="w-full h-10" rounded="lg" />
      
      {/* Quick stats */}
      <QuickStatsSkeleton />
      
      {/* List items */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <DeviceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Grid page skeleton (for cards grid layout)
 */
export function GridPageSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: 2 | 3 }) {
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Shimmer className="w-full h-10" rounded="lg" />
      
      {/* Quick stats */}
      <QuickStatsSkeleton />
      
      {/* Grid items */}
      <div className={cn(
        'grid gap-4',
        columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
      )}>
        {Array.from({ length: count }).map((_, i) => (
          <TireCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Command center skeleton
 */
export function CommandCenterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-4">
        <Shimmer className="w-24 h-10" rounded="lg" />
        <Shimmer className="w-24 h-10" rounded="lg" />
        <Shimmer className="w-24 h-10" rounded="lg" />
      </div>
      
      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <AlertCardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <AlertCardSkeleton key={i} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Detail page skeleton (for machine/tire details)
 */
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="card-elevated p-6">
        <div className="flex items-start gap-4 mb-6">
          <Shimmer className="w-16 h-16" rounded="xl" />
          <div className="flex-1 space-y-2">
            <Shimmer className="w-48 h-7" />
            <Shimmer className="w-32 h-5" />
          </div>
          <Shimmer className="w-24 h-8" rounded="full" />
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/30">
              <Shimmer className="w-12 h-4 mb-2" />
              <Shimmer className="w-20 h-6" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Chart placeholder */}
      <div className="card-elevated p-6">
        <Shimmer className="w-40 h-6 mb-4" />
        <Shimmer className="w-full h-64" rounded="lg" />
      </div>
      
      {/* Recent activity */}
      <div className="card-elevated p-6">
        <Shimmer className="w-32 h-6 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <AlertCardSkeleton key={i} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Analytics page skeleton
 */
export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPIs row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-elevated p-5">
            <div className="flex items-start justify-between mb-4">
              <Shimmer className="w-12 h-12" rounded="xl" />
              <Shimmer className="w-12 h-5" />
            </div>
            <Shimmer className="w-20 h-3 mb-2" />
            <Shimmer className="w-16 h-8 mb-1" />
            <Shimmer className="w-24 h-4" />
          </div>
        ))}
      </div>
      
      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-elevated p-6">
          <Shimmer className="w-40 h-6 mb-4" />
          <Shimmer className="w-full h-80" rounded="lg" />
        </div>
        <div className="card-elevated p-6">
          <Shimmer className="w-40 h-6 mb-4" />
          <Shimmer className="w-full h-80" rounded="lg" />
        </div>
      </div>
      
      {/* Table */}
      <div className="card-elevated">
        <div className="p-4 border-b border-border">
          <Shimmer className="w-48 h-6" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
