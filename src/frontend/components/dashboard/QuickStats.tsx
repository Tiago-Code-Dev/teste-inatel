import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickStatProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  default: 'bg-muted border-border text-foreground',
  success: 'bg-status-ok/10 border-status-ok/20 text-status-ok',
  warning: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
  danger: 'bg-status-critical/10 border-status-critical/20 text-status-critical',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
};

export function QuickStat({ label, value, icon: Icon, variant = 'default', onClick, className }: QuickStatProps) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <div className="flex-1 min-w-0 text-left">
        <p className={cn(
          'text-2xl font-bold tabular-nums',
          variant === 'default' ? 'text-foreground' : ''
        )}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </Component>
  );
}

interface QuickStatsGridProps {
  stats: QuickStatProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickStatsGrid({ stats, columns = 4, className }: QuickStatsGridProps) {
  return (
    <div className={cn(
      'grid gap-3',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-2 sm:grid-cols-3',
      columns === 4 && 'grid-cols-2 sm:grid-cols-4',
      className
    )}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <QuickStat {...stat} />
        </motion.div>
      ))}
    </div>
  );
}
