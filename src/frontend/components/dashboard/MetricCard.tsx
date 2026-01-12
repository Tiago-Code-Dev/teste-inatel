import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    glow: '',
  },
  success: {
    icon: 'bg-status-ok/10 text-status-ok',
    glow: 'hover:shadow-[0_0_20px_hsl(var(--status-ok)/0.2)]',
  },
  warning: {
    icon: 'bg-status-warning/10 text-status-warning',
    glow: 'hover:shadow-[0_0_20px_hsl(var(--status-warning)/0.2)]',
  },
  danger: {
    icon: 'bg-status-critical/10 text-status-critical',
    glow: 'hover:shadow-[0_0_20px_hsl(var(--status-critical)/0.2)]',
  },
};

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
  delay = 0,
}, ref) => {
  const styles = variantStyles[variant];

  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'card-elevated p-5 transition-all duration-300',
        styles.glow
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div 
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            styles.icon
          )}
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        {trend && TrendIcon && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.value > 0 ? 'text-status-ok' : trend.value < 0 ? 'text-status-critical' : 'text-muted-foreground'
            )}
          >
            <TrendIcon className="w-4 h-4" />
            <span>{Math.abs(trend.value)}%</span>
          </motion.div>
        )}
      </div>
      <div>
        <p className="metric-label mb-1">{title}</p>
        <motion.p 
          className="metric-value text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
        >
          {value}
        </motion.p>
        {(subtitle || trend?.label) && (
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle || trend?.label}
          </p>
        )}
      </div>
    </motion.div>
  );
});

MetricCard.displayName = 'MetricCard';
