import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  open: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
  slaExpired: number;
  slaWarning: number;
}

interface AlertSummaryCardProps {
  summary: AlertSummary;
  onFilterBySeverity?: (severity: string) => void;
  onFilterByStatus?: (status: string) => void;
  className?: string;
}

export function AlertSummaryCard({
  summary,
  onFilterBySeverity,
  onFilterByStatus,
  className,
}: AlertSummaryCardProps) {
  const severityItems = [
    { key: 'critical', label: 'Crítico', value: summary.critical, color: 'bg-red-500' },
    { key: 'high', label: 'Alto', value: summary.high, color: 'bg-orange-500' },
    { key: 'medium', label: 'Médio', value: summary.medium, color: 'bg-yellow-500' },
    { key: 'low', label: 'Baixo', value: summary.low, color: 'bg-blue-500' },
  ];

  const statusItems = [
    { key: 'open', label: 'Abertos', value: summary.open, icon: AlertCircle, color: 'text-red-500' },
    { key: 'acknowledged', label: 'Reconhecidos', value: summary.acknowledged, icon: Clock, color: 'text-yellow-500' },
    { key: 'in_progress', label: 'Em Andamento', value: summary.inProgress, icon: AlertTriangle, color: 'text-blue-500' },
    { key: 'resolved', label: 'Resolvidos', value: summary.resolved, icon: CheckCircle2, color: 'text-green-500' },
  ];

  const openPercentage = summary.total > 0 ? (summary.open / summary.total) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5" />
            Resumo de Alertas
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {summary.total} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SLA Status */}
        {(summary.slaExpired > 0 || summary.slaWarning > 0) && (
          <div className="flex gap-2">
            {summary.slaExpired > 0 && (
              <div className="flex-1 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-red-500">SLA Vencido</span>
                </div>
                <p className="text-lg font-bold text-red-500 mt-1">{summary.slaExpired}</p>
              </div>
            )}
            {summary.slaWarning > 0 && (
              <div className="flex-1 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-600">SLA Vencendo</span>
                </div>
                <p className="text-lg font-bold text-yellow-600 mt-1">{summary.slaWarning}</p>
              </div>
            )}
          </div>
        )}

        {/* Severity Distribution */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Por Severidade</p>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
            {severityItems.map((item) => (
              <div
                key={item.key}
                className={cn(item.color, 'transition-all cursor-pointer hover:opacity-80')}
                style={{ width: summary.total > 0 ? `${(item.value / summary.total) * 100}%` : '0%' }}
                onClick={() => onFilterBySeverity?.(item.key)}
                title={`${item.label}: ${item.value}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {severityItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onFilterBySeverity?.(item.key)}
                className="text-center p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className={cn('w-2 h-2 rounded-full mx-auto mb-1', item.color)} />
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Por Status</p>
          <div className="grid grid-cols-2 gap-2">
            {statusItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onFilterByStatus?.(item.key)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <item.icon className={cn('w-4 h-4', item.color)} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Open Alerts Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Alertas em Aberto</span>
            <span className="font-medium">{summary.open} de {summary.total}</span>
          </div>
          <Progress 
            value={openPercentage} 
            className={cn(
              'h-2',
              openPercentage > 50 ? '[&>div]:bg-red-500' : openPercentage > 25 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
