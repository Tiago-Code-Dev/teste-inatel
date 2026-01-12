import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    trend: 'text-muted-foreground',
  },
  success: {
    icon: 'bg-status-ok/10 text-status-ok',
    trend: 'text-status-ok',
  },
  warning: {
    icon: 'bg-status-warning/10 text-status-warning',
    trend: 'text-status-warning',
  },
  danger: {
    icon: 'bg-status-critical/10 text-status-critical',
    trend: 'text-status-critical',
  },
};

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: MetricCardProps) {
  const styles = variantStyles[variant];

  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'flex items-center justify-center w-12 h-12 rounded-xl',
          styles.icon
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && TrendIcon && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend.value > 0 ? 'text-status-ok' : trend.value < 0 ? 'text-status-critical' : 'text-muted-foreground'
          )}>
            <TrendIcon className="w-4 h-4" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="metric-label mb-1">{title}</p>
        <p className="metric-value text-foreground">{value}</p>
        {(subtitle || trend?.label) && (
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle || trend?.label}
          </p>
        )}
      </div>
    </div>
  );
}
