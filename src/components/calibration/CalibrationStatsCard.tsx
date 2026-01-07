import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CircleDot, CheckCircle, RefreshCw, AlertTriangle, 
  Gauge, Thermometer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalibrationStats } from '@/hooks/useTireCalibration';

interface CalibrationStatsCardProps {
  stats: CalibrationStats;
}

export const CalibrationStatsCard = ({ stats }: CalibrationStatsCardProps) => {
  const statusItems = [
    { 
      label: 'Calibrados', 
      value: stats.optimal, 
      icon: CheckCircle, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Ajustando', 
      value: stats.adjusting, 
      icon: RefreshCw, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Atenção', 
      value: stats.warning, 
      icon: AlertTriangle, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
    { 
      label: 'Críticos', 
      value: stats.critical, 
      icon: AlertTriangle, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CircleDot className="h-5 w-5" />
          Status de Calibração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
          <span className="font-medium">Total de Pneus</span>
          <span className="text-2xl font-bold text-primary">{stats.totalTires}</span>
        </div>
        
        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-2">
          {statusItems.map(item => (
            <div 
              key={item.label}
              className={cn('p-3 rounded-lg', item.bgColor)}
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className={cn('h-4 w-4', item.color)} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className={cn('text-xl font-bold', item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
        
        {/* Averages */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="text-center p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gauge className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">{stats.avgPressure} psi</p>
            <p className="text-xs text-muted-foreground">Pressão Média</p>
          </div>
          
          <div className="text-center p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Thermometer className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className={cn(
              'text-lg font-bold',
              stats.avgTemperature > 60 && 'text-amber-500'
            )}>
              {stats.avgTemperature}°C
            </p>
            <p className="text-xs text-muted-foreground">Temp. Média</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
