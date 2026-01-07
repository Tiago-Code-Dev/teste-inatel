import { Card, CardContent } from '@/components/ui/card';
import { CircleDot, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeformationStatsCardProps {
  stats: {
    total: number;
    optimal: number;
    warning: number;
    critical: number;
    avgDeformation: number;
    maxDeformation: number;
  };
}

export function DeformationStatsCard({ stats }: DeformationStatsCardProps) {
  const metrics = [
    {
      label: 'Total de Pneus',
      value: stats.total,
      icon: CircleDot,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Normais',
      value: stats.optimal,
      icon: CheckCircle,
      color: 'text-status-normal',
      bgColor: 'bg-status-normal/10',
    },
    {
      label: 'Em Atenção',
      value: stats.warning,
      icon: AlertTriangle,
      color: 'text-status-warning',
      bgColor: 'bg-status-warning/10',
    },
    {
      label: 'Críticos',
      value: stats.critical,
      icon: AlertTriangle,
      color: 'text-status-critical',
      bgColor: 'bg-status-critical/10',
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Resumo de Amassamento</h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Média: <span className="font-medium text-foreground">{stats.avgDeformation.toFixed(1)}%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className={cn('rounded-lg p-3', metric.bgColor)}
            >
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className={cn('w-4 h-4', metric.color)} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <p className={cn('text-2xl font-bold', metric.color)}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {stats.critical > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-status-critical/10 border border-status-critical/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-critical" />
              <span className="text-sm font-medium text-status-critical">
                {stats.critical} pneu(s) com deformação crítica requerem atenção imediata
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Deformação Máxima</p>
            <p className={cn(
              'text-lg font-semibold',
              stats.maxDeformation > 10 ? 'text-status-critical' : 
              stats.maxDeformation > 5 ? 'text-status-warning' : 'text-status-normal'
            )}>
              {stats.maxDeformation.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Taxa de Conformidade</p>
            <p className="text-lg font-semibold text-status-normal">
              {stats.total > 0 ? ((stats.optimal / stats.total) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
