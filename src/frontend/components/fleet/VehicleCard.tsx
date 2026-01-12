import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, MapPin, Fuel, Thermometer, Gauge, 
  AlertTriangle, ChevronRight, Clock, Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Vehicle, VehicleStatus } from '@/hooks/useFleetManagement';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<VehicleStatus, { label: string; color: string; bgColor: string }> = {
  operational: { label: 'Operacional', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  maintenance: { label: 'Em Manutenção', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  inactive: { label: 'Inativo', color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
  critical: { label: 'Crítico', color: 'text-red-500', bgColor: 'bg-red-500/10' }
};

export const VehicleCard = ({ vehicle, onPress }: VehicleCardProps) => {
  const statusConfig = STATUS_CONFIG[vehicle.status];
  
  const lastUpdate = formatDistanceToNow(new Date(vehicle.telemetry.lastUpdate), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        vehicle.status === 'critical' && 'border-red-500/50 bg-red-500/5'
      )}
      onClick={onPress}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', statusConfig.bgColor)}>
              <Truck className={cn('h-5 w-5', statusConfig.color)} />
            </div>
            <div>
              <h4 className="font-medium">{vehicle.name}</h4>
              <p className="text-sm text-muted-foreground">{vehicle.plate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={vehicle.status === 'critical' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {statusConfig.label}
            </Badge>
            {vehicle.activeAlerts > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center">
                {vehicle.activeAlerts}
              </Badge>
            )}
          </div>
        </div>

        {/* Telemetry Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">{vehicle.telemetry.speed} km/h</span>
          </div>
          
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
            <Fuel className={cn(
              'h-3.5 w-3.5',
              vehicle.telemetry.fuelLevel < 20 ? 'text-red-500' : 'text-muted-foreground'
            )} />
            <span className={cn(
              'text-xs font-medium',
              vehicle.telemetry.fuelLevel < 20 && 'text-red-500'
            )}>
              {vehicle.telemetry.fuelLevel}%
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
            <Thermometer className={cn(
              'h-3.5 w-3.5',
              vehicle.telemetry.engineTemp > 90 ? 'text-red-500' : 'text-muted-foreground'
            )} />
            <span className={cn(
              'text-xs font-medium',
              vehicle.telemetry.engineTemp > 90 && 'text-red-500'
            )}>
              {vehicle.telemetry.engineTemp}°C
            </span>
          </div>
        </div>

        {/* Fuel Progress */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Combustível</span>
            <span className={cn(
              'font-medium',
              vehicle.telemetry.fuelLevel < 20 ? 'text-red-500' : ''
            )}>
              {vehicle.telemetry.fuelLevel}%
            </span>
          </div>
          <Progress 
            value={vehicle.telemetry.fuelLevel}
            className={cn(
              'h-1.5',
              vehicle.telemetry.fuelLevel < 20 && '[&>div]:bg-red-500',
              vehicle.telemetry.fuelLevel < 40 && vehicle.telemetry.fuelLevel >= 20 && '[&>div]:bg-amber-500'
            )}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{vehicle.operatingHours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{lastUpdate}</span>
            </div>
          </div>
          
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};
