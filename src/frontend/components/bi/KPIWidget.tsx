import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIData } from '@/hooks/useBusinessIntelligence';

interface KPIWidgetProps {
  kpi: KPIData;
  onClick?: () => void;
}

export function KPIWidget({ kpi, onClick }: KPIWidgetProps) {
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  
  const categoryColors = {
    performance: 'bg-primary/10 text-primary',
    cost: 'bg-status-warning/10 text-status-warning',
    efficiency: 'bg-status-normal/10 text-status-normal',
    alerts: 'bg-status-critical/10 text-status-critical',
  };

  const trendColors = {
    up: kpi.category === 'cost' || kpi.category === 'alerts' ? 'text-status-critical' : 'text-status-normal',
    down: kpi.category === 'cost' || kpi.category === 'alerts' ? 'text-status-normal' : 'text-status-critical',
    stable: 'text-muted-foreground',
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$' || unit === 'R$/h') {
      return `${unit} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (unit === '%') {
      return `${value.toFixed(1)}${unit}`;
    }
    if (unit === 'h') {
      return `${value.toFixed(0)}${unit}`;
    }
    return value.toFixed(0);
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {kpi.title}
          </span>
          <div className={cn('px-2 py-0.5 rounded-full text-xs font-medium', categoryColors[kpi.category])}>
            {kpi.category === 'performance' && 'Desempenho'}
            {kpi.category === 'cost' && 'Custo'}
            {kpi.category === 'efficiency' && 'Eficiência'}
            {kpi.category === 'alerts' && 'Alertas'}
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-foreground">
            {formatValue(kpi.value, kpi.unit)}
          </p>
          
          <div className={cn('flex items-center gap-1 text-sm font-medium', trendColors[kpi.trend])}>
            <TrendIcon className="w-4 h-4" />
            <span>{Math.abs(kpi.trendValue).toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
