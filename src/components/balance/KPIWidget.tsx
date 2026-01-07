import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPIWidgetProps {
  title: string;
  value: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function KPIWidget({
  title,
  value,
  unit = '',
  trend,
  trendValue,
  icon: Icon,
  variant = 'default',
  size = 'md',
  className,
}: KPIWidgetProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = () => {
    // For some KPIs, up is good (efficiency), for others down is good (alerts)
    if (title.toLowerCase().includes('alerta') || title.toLowerCase().includes('crítico')) {
      return trend === 'down' || trend === 'stable' ? 'text-green-500' : 'text-red-500';
    }
    return trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success': return 'border-l-4 border-l-green-500 bg-green-500/5';
      case 'warning': return 'border-l-4 border-l-yellow-500 bg-yellow-500/5';
      case 'danger': return 'border-l-4 border-l-red-500 bg-red-500/5';
      default: return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { value: 'text-xl', title: 'text-xs', padding: 'p-3' };
      case 'lg': return { value: 'text-4xl', title: 'text-sm', padding: 'p-6' };
      default: return { value: 'text-2xl', title: 'text-xs', padding: 'p-4' };
    }
  };

  const TrendIcon = getTrendIcon();
  const sizeStyles = getSizeStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('overflow-hidden', getVariantStyles(), className)}>
        <CardContent className={cn(sizeStyles.padding, 'space-y-2')}>
          <div className="flex items-center justify-between">
            <p className={cn('text-muted-foreground font-medium', sizeStyles.title)}>
              {title}
            </p>
            {Icon && (
              <Icon className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className={cn('font-bold', sizeStyles.value)}>
                {value.toLocaleString('pt-BR')}
              </span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>

            <div className={cn('flex items-center gap-1 text-xs', getTrendColor())}>
              <TrendIcon className="w-3 h-3" />
              {trendValue !== undefined && (
                <span>{trendValue > 0 ? '+' : ''}{trendValue}%</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
