import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, DollarSign, Fuel, Wrench, Package, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostOverviewCardProps {
  title: string;
  value: number;
  previousValue?: number;
  type: 'fuel' | 'maintenance' | 'parts' | 'labor' | 'total' | 'perHour';
  threshold?: number;
  className?: string;
}

const TYPE_CONFIG = {
  fuel: { icon: Fuel, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  maintenance: { icon: Wrench, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  parts: { icon: Package, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  labor: { icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  total: { icon: DollarSign, color: 'text-foreground', bgColor: 'bg-muted' },
  perHour: { icon: Clock, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' }
};

export const CostOverviewCard = ({
  title,
  value,
  previousValue,
  type,
  threshold,
  className
}: CostOverviewCardProps) => {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  
  const percentChange = previousValue 
    ? Math.round(((value - previousValue) / previousValue) * 100) 
    : 0;
  
  const isOverThreshold = threshold ? value > threshold : false;
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={cn(
              'text-2xl font-bold',
              isOverThreshold && 'text-destructive'
            )}>
              {type === 'perHour' ? `${formatCurrency(value)}/h` : formatCurrency(value)}
            </div>
            
            {previousValue !== undefined && percentChange !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {percentChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                ) : percentChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={cn(
                  'text-xs',
                  percentChange > 0 ? 'text-destructive' : 'text-emerald-500'
                )}>
                  {Math.abs(percentChange)}% vs período anterior
                </span>
              </div>
            )}
          </div>
          
          {isOverThreshold && (
            <Badge variant="destructive" className="text-xs">
              Acima do limite
            </Badge>
          )}
        </div>
        
        {threshold && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Limite: {formatCurrency(threshold)}</span>
              <span className={cn(
                value > threshold ? 'text-destructive' : 'text-emerald-500'
              )}>
                {value > threshold 
                  ? `+${formatCurrency(value - threshold)}`
                  : `-${formatCurrency(threshold - value)}`
                }
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all',
                  value > threshold ? 'bg-destructive' : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min((value / threshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
