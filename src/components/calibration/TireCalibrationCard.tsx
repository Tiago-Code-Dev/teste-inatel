import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CircleDot, Gauge, Thermometer, ChevronRight, 
  RefreshCw, CheckCircle, AlertTriangle, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TireCalibrationData, CalibrationStatus } from '@/hooks/useTireCalibration';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TireCalibrationCardProps {
  tire: TireCalibrationData;
  onPress?: () => void;
  onCalibrate?: () => void;
  isCalibrating?: boolean;
}

const STATUS_CONFIG: Record<CalibrationStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: typeof CheckCircle;
}> = {
  optimal: { 
    label: 'Calibrado', 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10',
    icon: CheckCircle
  },
  adjusting: { 
    label: 'Ajustando', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    icon: RefreshCw
  },
  warning: { 
    label: 'Atenção', 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10',
    icon: AlertTriangle
  },
  critical: { 
    label: 'Crítico', 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    icon: AlertTriangle
  },
  pending: { 
    label: 'Pendente', 
    color: 'text-gray-500', 
    bgColor: 'bg-gray-500/10',
    icon: CircleDot
  }
};

export const TireCalibrationCard = ({ 
  tire, 
  onPress, 
  onCalibrate,
  isCalibrating 
}: TireCalibrationCardProps) => {
  const config = STATUS_CONFIG[tire.status];
  const StatusIcon = config.icon;
  
  const pressureDeviation = tire.currentPressure - tire.recommendedPressure;
  const pressurePercent = (tire.currentPressure / tire.recommendedPressure) * 100;
  
  const lastCalibration = formatDistanceToNow(new Date(tire.lastCalibration), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        tire.status === 'critical' && 'border-red-500/50 bg-red-500/5',
        tire.status === 'warning' && 'border-amber-500/50 bg-amber-500/5'
      )}
      onClick={onPress}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <CircleDot className={cn('h-5 w-5', config.color)} />
            </div>
            <div>
              <h4 className="font-medium">{tire.serial}</h4>
              <p className="text-xs text-muted-foreground">
                {tire.machineName} • Posição {tire.position}
              </p>
            </div>
          </div>
          
          <Badge 
            variant={tire.status === 'critical' ? 'destructive' : 'secondary'}
            className={cn('text-xs gap-1', config.color)}
          >
            <StatusIcon className={cn(
              'h-3 w-3',
              tire.status === 'adjusting' && 'animate-spin'
            )} />
            {config.label}
          </Badge>
        </div>

        {/* Pressure & Temperature */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Gauge className={cn(
                'h-3.5 w-3.5',
                tire.status === 'critical' || tire.status === 'warning' 
                  ? config.color 
                  : 'text-muted-foreground'
              )} />
              <span className="text-xs text-muted-foreground">Pressão</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                'text-lg font-bold',
                tire.status === 'critical' && 'text-red-500',
                tire.status === 'warning' && 'text-amber-500'
              )}>
                {tire.currentPressure}
              </span>
              <span className="text-xs text-muted-foreground">psi</span>
            </div>
            <span className={cn(
              'text-xs',
              pressureDeviation > 0 ? 'text-amber-500' : 
              pressureDeviation < 0 ? 'text-blue-500' : 'text-emerald-500'
            )}>
              {pressureDeviation > 0 ? '+' : ''}{pressureDeviation.toFixed(1)} do ideal
            </span>
          </div>
          
          <div className="p-2.5 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Thermometer className={cn(
                'h-3.5 w-3.5',
                tire.temperature > 70 ? 'text-red-500' : 'text-muted-foreground'
              )} />
              <span className="text-xs text-muted-foreground">Temperatura</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                'text-lg font-bold',
                tire.temperature > 70 && 'text-red-500'
              )}>
                {tire.temperature}
              </span>
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {tire.temperature < 40 ? 'Normal' : tire.temperature < 70 ? 'Elevada' : 'Crítica'}
            </span>
          </div>
        </div>

        {/* Pressure Progress */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              Calibração ({tire.recommendedPressure} psi ideal)
            </span>
            <span className={cn(
              'font-medium',
              tire.status === 'optimal' ? 'text-emerald-500' :
              tire.status === 'critical' ? 'text-red-500' : 'text-amber-500'
            )}>
              {Math.round(pressurePercent)}%
            </span>
          </div>
          <Progress 
            value={Math.min(pressurePercent, 120)}
            className={cn(
              'h-2',
              tire.status === 'optimal' && '[&>div]:bg-emerald-500',
              tire.status === 'warning' && '[&>div]:bg-amber-500',
              tire.status === 'critical' && '[&>div]:bg-red-500',
              tire.status === 'adjusting' && '[&>div]:bg-blue-500'
            )}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            Última calibração {lastCalibration}
          </span>
          
          <div className="flex items-center gap-2">
            {tire.status !== 'optimal' && onCalibrate && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onCalibrate();
                }}
                disabled={isCalibrating}
              >
                {isCalibrating ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Calibrar
                  </>
                )}
              </Button>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
