import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CircleDot, Weight, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TireLoadData } from '@/hooks/useLoadAnalysis';

interface LoadImpactCardProps {
  tire: TireLoadData;
  onPress?: () => void;
}

export function LoadImpactCard({ tire, onPress }: LoadImpactCardProps) {
  const statusConfig = {
    normal: {
      label: 'Normal',
      color: 'bg-status-normal text-white',
      icon: CircleDot,
    },
    warning: {
      label: 'Atenção',
      color: 'bg-status-warning text-black',
      icon: AlertTriangle,
    },
    overload: {
      label: 'Sobrecarga',
      color: 'bg-status-critical text-white',
      icon: AlertTriangle,
    },
  };

  const config = statusConfig[tire.status];
  const StatusIcon = config.icon;

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        tire.status === 'overload' && 'border-status-critical/50 bg-status-critical/5'
      )}
      onClick={onPress}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              tire.status === 'normal' && 'bg-status-normal/20',
              tire.status === 'warning' && 'bg-status-warning/20',
              tire.status === 'overload' && 'bg-status-critical/20'
            )}>
              <Weight className={cn(
                'w-5 h-5',
                tire.status === 'normal' && 'text-status-normal',
                tire.status === 'warning' && 'text-status-warning',
                tire.status === 'overload' && 'text-status-critical'
              )} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{tire.tireSerial}</p>
              <p className="text-xs text-muted-foreground">{tire.machineName}</p>
            </div>
          </div>
          <Badge className={config.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Carga</span>
              <span className={cn(
                'font-semibold',
                tire.status === 'normal' && 'text-status-normal',
                tire.status === 'warning' && 'text-status-warning',
                tire.status === 'overload' && 'text-status-critical'
              )}>
                {tire.loadPercent.toFixed(0)}% ({tire.currentLoadKg.toFixed(0)}kg)
              </span>
            </div>
            <Progress 
              value={Math.min(100, tire.loadPercent)} 
              className={cn(
                'h-2',
                tire.status === 'warning' && '[&>div]:bg-status-warning',
                tire.status === 'overload' && '[&>div]:bg-status-critical'
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Desgaste:</span>
              <span className="font-medium">+{tire.wearImpact.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CircleDot className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Efic:</span>
              <span className="font-medium">{tire.efficiency.toFixed(0)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Posição: {tire.position}
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Detalhes
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
