import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ShimmerSkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function ShimmerSkeleton({ className, rounded = 'md' }: ShimmerSkeletonProps) {
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
        'relative overflow-hidden bg-muted/40',
        roundedClasses[rounded],
        className
      )}
    >
      {/* Shimmer effect */}
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

export function MetricCardShimmer() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <ShimmerSkeleton className="w-12 h-12" rounded="xl" />
        <ShimmerSkeleton className="w-12 h-5" />
      </div>
      <div>
        <ShimmerSkeleton className="w-20 h-3 mb-2" />
        <ShimmerSkeleton className="w-16 h-8 mb-1" />
        <ShimmerSkeleton className="w-24 h-4" />
      </div>
    </div>
  );
}

export function StatusCardShimmer() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-border/50">
      <ShimmerSkeleton className="w-5 h-5" rounded="full" />
      <div className="flex-1">
        <ShimmerSkeleton className="w-8 h-7 mb-1" />
        <ShimmerSkeleton className="w-16 h-3" />
      </div>
    </div>
  );
}

export function MachineCardShimmer() {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <ShimmerSkeleton className="w-12 h-12" rounded="xl" />
          <div>
            <ShimmerSkeleton className="w-32 h-5 mb-1" />
            <ShimmerSkeleton className="w-20 h-4" />
          </div>
        </div>
        <ShimmerSkeleton className="w-3 h-3" rounded="full" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="px-3 py-2 rounded-xl bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <ShimmerSkeleton className="w-12 h-3" />
            <ShimmerSkeleton className="w-16 h-4" />
          </div>
          <ShimmerSkeleton className="w-full h-6" />
        </div>
        <div className="px-3 py-2 rounded-xl bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <ShimmerSkeleton className="w-12 h-3" />
            <ShimmerSkeleton className="w-16 h-4" />
          </div>
          <ShimmerSkeleton className="w-full h-6" />
        </div>
      </div>
      <div className="pt-3 border-t border-white/5">
        <ShimmerSkeleton className="w-28 h-4" />
      </div>
    </div>
  );
}

export function AlertCardShimmer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3">
        <ShimmerSkeleton className="w-6 h-6" rounded="full" />
        <div className="flex-1 min-w-0">
          <ShimmerSkeleton className="w-full h-4 mb-1" />
          <ShimmerSkeleton className="w-24 h-3" />
        </div>
        <ShimmerSkeleton className="w-16 h-3" />
      </div>
    );
  }

  return (
    <div className="card-elevated p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="w-16 h-5" rounded="full" />
          <ShimmerSkeleton className="w-20 h-5" rounded="full" />
        </div>
        <ShimmerSkeleton className="w-20 h-4" />
      </div>
      <ShimmerSkeleton className="w-full h-5 mb-2" />
      <ShimmerSkeleton className="w-3/4 h-4 mb-4" />
      <div className="flex gap-3 pt-3 border-t border-border">
        <ShimmerSkeleton className="w-24 h-4" />
        <ShimmerSkeleton className="w-32 h-4" />
      </div>
      <div className="flex gap-2 mt-4">
        <ShimmerSkeleton className="flex-1 h-10" rounded="lg" />
        <ShimmerSkeleton className="w-24 h-10" rounded="lg" />
      </div>
    </div>
  );
}

export function HeroShimmer() {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent backdrop-blur-xl border border-white/10">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Gauge shimmer */}
        <ShimmerSkeleton className="w-48 h-48 shrink-0" rounded="full" />
        
        {/* Stats grid shimmer */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <ShimmerSkeleton className="w-10 h-10" rounded="lg" />
              <div>
                <ShimmerSkeleton className="w-12 h-7 mb-1" />
                <ShimmerSkeleton className="w-16 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardShimmer() {
  return (
    <div className="space-y-6">
      {/* Alert ticker shimmer */}
      <ShimmerSkeleton className="w-full h-10" rounded="xl" />
      
      {/* Hero section shimmer */}
      <HeroShimmer />

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatusCardShimmer key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <ShimmerSkeleton className="w-48 h-6" />
            <ShimmerSkeleton className="w-20 h-5" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MachineCardShimmer key={i} />
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <ShimmerSkeleton className="w-36 h-6" />
            <ShimmerSkeleton className="w-20 h-5" />
          </div>
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <AlertCardShimmer key={i} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
