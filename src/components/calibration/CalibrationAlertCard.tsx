import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Gauge, Thermometer, Eye, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalibrationAlert } from '@/hooks/useTireCalibration';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalibrationAlertCardProps {
  alert: CalibrationAlert;
  onViewTire?: () => void;
  onAutoFix?: () => void;
}

const SEVERITY_CONFIG = {
  critical: { 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10', 
    borderColor: 'border-red-500/30',
    label: 'Crítico'
  },
  high: { 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10', 
    borderColor: 'border-orange-500/30',
    label: 'Alto'
  },
  medium: { 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10', 
    borderColor: 'border-amber-500/30',
    label: 'Médio'
  },
  low: { 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10', 
    borderColor: 'border-blue-500/30',
    label: 'Baixo'
  }
};

const TYPE_ICONS = {
  pressure_low: Gauge,
  pressure_high: Gauge,
  temperature_high: Thermometer,
  calibration_needed: AlertTriangle
};

export const CalibrationAlertCard = ({ 
  alert, 
  onViewTire, 
  onAutoFix 
}: CalibrationAlertCardProps) => {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = TYPE_ICONS[alert.type];
  
  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), { 
    addSuffix: true, 
    locale: ptBR 
  });

  const deviation = alert.currentValue - alert.recommendedValue;

  return (
    <Card className={cn('border-l-4', config.borderColor)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', config.bgColor)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
            
            <h4 className="font-medium text-sm">
              {alert.serial} • {alert.machineName}
            </h4>
            
            <p className="text-sm text-muted-foreground mt-1">
              {alert.message}
            </p>
            
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className={cn('font-medium', config.color)}>
                Atual: {alert.currentValue}{alert.type.includes('temp') ? '°C' : ' psi'}
              </span>
              <span className="text-muted-foreground">
                Ideal: {alert.recommendedValue}{alert.type.includes('temp') ? '°C' : ' psi'}
              </span>
              <span className={cn(
                deviation > 0 ? 'text-red-500' : 'text-blue-500'
              )}>
                ({deviation > 0 ? '+' : ''}{deviation.toFixed(1)})
              </span>
            </div>
            
            <div className="flex gap-2 mt-3">
              {onViewTire && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewTire();
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Pneu
                </Button>
              )}
              {onAutoFix && !alert.type.includes('temp') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAutoFix();
                  }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Calibrar Auto
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
