import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, MapPin, Fuel, Thermometer, Gauge, Clock, Wrench,
  Navigation, AlertTriangle, Calendar, DollarSign
} from 'lucide-react';
import { Vehicle, VehicleAlert, VehicleStatus } from '@/hooks/useFleetManagement';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VehicleDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  alerts: VehicleAlert[];
}

const STATUS_CONFIG: Record<VehicleStatus, { label: string; color: string; bgColor: string }> = {
  operational: { label: 'Operacional', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  maintenance: { label: 'Em Manutenção', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  inactive: { label: 'Inativo', color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
  critical: { label: 'Crítico', color: 'text-red-500', bgColor: 'bg-red-500/10' }
};

export const VehicleDetailSheet = ({
  isOpen,
  onClose,
  vehicle,
  alerts
}: VehicleDetailSheetProps) => {
  if (!vehicle) return null;
  
  const statusConfig = STATUS_CONFIG[vehicle.status];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', statusConfig.bgColor)}>
              <Truck className={cn('h-6 w-6', statusConfig.color)} />
            </div>
            <div>
              <SheetTitle>{vehicle.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{vehicle.plate}</span>
                <Badge 
                  variant={vehicle.status === 'critical' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>
        
        <div className="space-y-4">
          {/* Telemetry Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Telemetria em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Velocidade</span>
                  </div>
                  <p className="text-xl font-bold">{vehicle.telemetry.speed} km/h</p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className={cn(
                      'h-4 w-4',
                      vehicle.telemetry.engineTemp > 90 ? 'text-red-500' : 'text-muted-foreground'
                    )} />
                    <span className="text-xs text-muted-foreground">Temp. Motor</span>
                  </div>
                  <p className={cn(
                    'text-xl font-bold',
                    vehicle.telemetry.engineTemp > 90 && 'text-red-500'
                  )}>
                    {vehicle.telemetry.engineTemp}°C
                  </p>
                </div>
              </div>
              
              {/* Fuel */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className={cn(
                      'h-4 w-4',
                      vehicle.telemetry.fuelLevel < 20 ? 'text-red-500' : 'text-muted-foreground'
                    )} />
                    <span className="text-sm">Combustível</span>
                  </div>
                  <span className={cn(
                    'font-bold',
                    vehicle.telemetry.fuelLevel < 20 && 'text-red-500'
                  )}>
                    {vehicle.telemetry.fuelLevel}%
                  </span>
                </div>
                <Progress 
                  value={vehicle.telemetry.fuelLevel}
                  className={cn(
                    'h-2',
                    vehicle.telemetry.fuelLevel < 20 && '[&>div]:bg-red-500',
                    vehicle.telemetry.fuelLevel < 40 && vehicle.telemetry.fuelLevel >= 20 && '[&>div]:bg-amber-500'
                  )}
                />
              </div>
              
              {/* Location */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Localização</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {vehicle.telemetry.latitude.toFixed(4)}, {vehicle.telemetry.longitude.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Última atualização: {formatDistanceToNow(new Date(vehicle.telemetry.lastUpdate), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
              
              {/* Odometer */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Odômetro</span>
                <span className="font-medium">
                  {vehicle.telemetry.odometer.toLocaleString('pt-BR')} km
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Operating Hours */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Horas de Operação</span>
                </div>
                <span className="text-xl font-bold">{vehicle.operatingHours}h</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Last Maintenance */}
          {vehicle.lastMaintenance && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Última Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo</span>
                  <Badge variant="outline">{vehicle.lastMaintenance.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data</span>
                  <span className="text-sm font-medium">
                    {format(new Date(vehicle.lastMaintenance.date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Custo</span>
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.lastMaintenance.cost)}
                  </span>
                </div>
                {vehicle.lastMaintenance.partsReplaced.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Peças trocadas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vehicle.lastMaintenance.partsReplaced.map((part, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {part}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Próxima manutenção</span>
                    <span className="text-sm font-medium">
                      {format(new Date(vehicle.lastMaintenance.nextDue), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Active Alerts */}
          {alerts.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas Ativos ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={cn(
                      'p-2 rounded-lg text-sm',
                      alert.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-amber-500/10 text-amber-600'
                    )}
                  >
                    {alert.message}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
