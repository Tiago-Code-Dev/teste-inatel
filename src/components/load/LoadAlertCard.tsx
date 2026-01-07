import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Weight, TrendingDown, Gauge, Eye, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadAlert } from '@/hooks/useLoadAnalysis';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LoadAlertCardProps {
  alert: LoadAlert;
  onView?: () => void;
  onFix?: () => void;
}

export function LoadAlertCard({ alert, onView, onFix }: LoadAlertCardProps) {
  const severityConfig = {
    low: {
      label: 'Baixo',
      color: 'bg-status-normal text-white',
      borderColor: 'border-l-status-normal',
    },
    medium: {
      label: 'Médio',
      color: 'bg-status-warning text-black',
      borderColor: 'border-l-status-warning',
    },
    high: {
      label: 'Alto',
      color: 'bg-orange-500 text-white',
      borderColor: 'border-l-orange-500',
    },
    critical: {
      label: 'Crítico',
      color: 'bg-status-critical text-white',
      borderColor: 'border-l-status-critical',
    },
  };

  const typeConfig = {
    overload: { label: 'Sobrecarga', icon: Weight },
    wear_impact: { label: 'Impacto Desgaste', icon: TrendingDown },
    efficiency_drop: { label: 'Queda Eficiência', icon: Gauge },
    distribution: { label: 'Distribuição', icon: AlertTriangle },
  };

  const severity = severityConfig[alert.severity];
  const type = typeConfig[alert.type];
  const TypeIcon = type.icon;

  return (
    <Card className={cn('border-l-4', severity.borderColor)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              alert.severity === 'critical' && 'bg-status-critical/20',
              alert.severity === 'high' && 'bg-orange-500/20',
              alert.severity === 'medium' && 'bg-status-warning/20',
              alert.severity === 'low' && 'bg-status-normal/20'
            )}>
              <TypeIcon className={cn(
                'w-4 h-4',
                alert.severity === 'critical' && 'text-status-critical',
                alert.severity === 'high' && 'text-orange-500',
                alert.severity === 'medium' && 'text-status-warning',
                alert.severity === 'low' && 'text-status-normal'
              )} />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{type.label}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          <Badge className={severity.color}>{severity.label}</Badge>
        </div>

        <p className="text-sm text-foreground mb-3">{alert.message}</p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          {alert.tireSerial && (
            <>
              <span className="font-medium text-foreground">{alert.tireSerial}</span>
              <span>•</span>
            </>
          )}
          <span>{alert.machineName}</span>
          <span>•</span>
          <span>{alert.loadPercent.toFixed(0)}% carga</span>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={onView}
          >
            <Eye className="w-3 h-3 mr-1" />
            Ver Detalhes
          </Button>
          {(alert.severity === 'critical' || alert.severity === 'high') && (
            <Button 
              size="sm" 
              className="flex-1 h-8 text-xs"
              onClick={onFix}
            >
              <Wrench className="w-3 h-3 mr-1" />
              Ajustar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
