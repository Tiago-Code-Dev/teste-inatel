import { Card, CardContent } from '@/components/ui/card';
import { Weight, AlertTriangle, CheckCircle, TrendingDown, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadStatsCardProps {
  stats: {
    totalTires: number;
    normal: number;
    warning: number;
    overload: number;
    avgLoadPercent: number;
    avgEfficiency: number;
    totalWearImpact: number;
    machinesWithOverload: number;
  };
}

export function LoadStatsCard({ stats }: LoadStatsCardProps) {
  const metrics = [
    {
      label: 'Total de Pneus',
      value: stats.totalTires,
      icon: Weight,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Carga Normal',
      value: stats.normal,
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
      label: 'Sobrecarga',
      value: stats.overload,
      icon: AlertTriangle,
      color: 'text-status-critical',
      bgColor: 'bg-status-critical/10',
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Resumo de Carga</h3>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Carga Média: <span className={cn(
                'font-medium',
                stats.avgLoadPercent >= 100 ? 'text-status-critical' :
                stats.avgLoadPercent >= 80 ? 'text-status-warning' : 'text-foreground'
              )}>{stats.avgLoadPercent.toFixed(0)}%</span>
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

        {stats.overload > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-status-critical/10 border border-status-critical/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-critical" />
              <span className="text-sm font-medium text-status-critical">
                {stats.overload} pneu(s) com sobrecarga - {stats.machinesWithOverload} máquina(s) afetadas
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Eficiência Média</p>
            <p className={cn(
              'text-lg font-semibold',
              stats.avgEfficiency >= 90 ? 'text-status-normal' : 
              stats.avgEfficiency >= 75 ? 'text-status-warning' : 'text-status-critical'
            )}>
              {stats.avgEfficiency.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Impacto Total Desgaste</p>
            <p className="text-lg font-semibold text-status-warning">
              +{stats.totalWearImpact.toFixed(0)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
