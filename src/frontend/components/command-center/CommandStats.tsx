import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    isGood?: boolean;
  };
  onClick?: () => void;
}

interface CommandStatsProps {
  stats: StatItem[];
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-muted/50',
    text: 'text-foreground',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  danger: {
    bg: 'bg-status-critical/5',
    text: 'text-status-critical',
    iconBg: 'bg-status-critical/15',
    iconColor: 'text-status-critical',
  },
  warning: {
    bg: 'bg-status-warning/5',
    text: 'text-status-warning',
    iconBg: 'bg-status-warning/15',
    iconColor: 'text-status-warning',
  },
  success: {
    bg: 'bg-status-ok/5',
    text: 'text-status-ok',
    iconBg: 'bg-status-ok/15',
    iconColor: 'text-status-ok',
  },
  info: {
    bg: 'bg-blue-500/5',
    text: 'text-blue-500',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-500',
  },
};

export function CommandStats({ stats, className }: CommandStatsProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2', className)}>
      {stats.map((stat, index) => {
        const variant = variantStyles[stat.variant || 'default'];
        const Icon = stat.icon;
        
        return (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={stat.onClick}
            disabled={!stat.onClick}
            className={cn(
              'relative flex flex-col items-start p-3 rounded-xl border border-border/50',
              'transition-all duration-200',
              stat.onClick && 'cursor-pointer hover:shadow-md',
              variant.bg
            )}
          >
            {/* Icon */}
            <div className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg mb-2',
              variant.iconBg
            )}>
              <Icon className={cn('w-4 h-4', variant.iconColor)} />
            </div>
            
            {/* Value */}
            <motion.span
              key={stat.value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn('text-2xl font-bold', variant.text)}
            >
              {stat.value}
            </motion.span>
            
            {/* Label */}
            <span className="text-xs text-muted-foreground mt-0.5">{stat.label}</span>
            
            {/* Trend */}
            {stat.trend && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'absolute top-2 right-2 flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded',
                  stat.trend.isGood 
                    ? 'bg-status-ok/10 text-status-ok' 
                    : 'bg-status-critical/10 text-status-critical'
                )}
              >
                <span>{stat.trend.direction === 'up' ? '↑' : '↓'}</span>
                <span>{Math.abs(stat.trend.value)}%</span>
              </motion.div>
            )}

            {/* Pulse effect for critical values */}
            {stat.variant === 'danger' && stat.value > 0 && (
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-xl border-2 border-status-critical"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
