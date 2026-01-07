import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  trendInverse?: boolean; // For metrics where decrease is good (e.g., MTTR)
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    bg: 'bg-card',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  success: {
    bg: 'bg-status-ok/5',
    iconBg: 'bg-status-ok/15',
    iconColor: 'text-status-ok',
  },
  warning: {
    bg: 'bg-status-warning/5',
    iconBg: 'bg-status-warning/15',
    iconColor: 'text-status-warning',
  },
  danger: {
    bg: 'bg-status-critical/5',
    iconBg: 'bg-status-critical/15',
    iconColor: 'text-status-critical',
  },
  info: {
    bg: 'bg-blue-500/5',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-500',
  },
};

export function AnalyticsKPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  trendInverse = false,
  variant = 'default',
  className,
  onClick,
}: AnalyticsKPICardProps) {
  const styles = variantStyles[variant];
  
  const getTrendDisplay = () => {
    if (trend === undefined || trend === 0) {
      return { icon: Minus, color: 'text-muted-foreground', label: 'Sem variação' };
    }
    
    const isPositive = trendInverse ? trend < 0 : trend > 0;
    const isNegative = trendInverse ? trend > 0 : trend < 0;
    
    if (isPositive) {
      return { 
        icon: trendInverse ? TrendingDown : TrendingUp, 
        color: 'text-status-ok', 
        label: `${Math.abs(trend)}% ${trendLabel || ''}` 
      };
    }
    if (isNegative) {
      return { 
        icon: trendInverse ? TrendingUp : TrendingDown, 
        color: 'text-status-critical', 
        label: `${Math.abs(trend)}% ${trendLabel || ''}` 
      };
    }
    return { icon: Minus, color: 'text-muted-foreground', label: 'Sem variação' };
  };

  const trendDisplay = getTrendDisplay();
  const TrendIcon = trendDisplay.icon;

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
    >
      <Card 
        className={cn(
          'border transition-all duration-200',
          styles.bg,
          onClick && 'cursor-pointer hover:shadow-md',
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Icon */}
            {icon && (
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                styles.iconBg
              )}>
                <div className={styles.iconColor}>{icon}</div>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {title}
              </p>
              <motion.p 
                className="text-2xl font-bold text-foreground"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                key={String(value)}
              >
                {value}
              </motion.p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>

            {/* Trend */}
            {trend !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium shrink-0',
                trendDisplay.color
              )}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
