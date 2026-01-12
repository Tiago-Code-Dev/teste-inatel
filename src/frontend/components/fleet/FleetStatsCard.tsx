import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Truck, CheckCircle, Wrench, XCircle, AlertTriangle, 
  Clock, Fuel, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FleetStats } from '@/hooks/useFleetManagement';

interface FleetStatsCardProps {
  stats: FleetStats;
}

export const FleetStatsCard = ({ stats }: FleetStatsCardProps) => {
  const statItems = [
    { 
      label: 'Operacional', 
      value: stats.operational, 
      icon: CheckCircle, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Manutenção', 
      value: stats.inMaintenance, 
      icon: Wrench, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Inativo', 
      value: stats.inactive, 
      icon: XCircle, 
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10'
    },
    { 
      label: 'Crítico', 
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
          <Truck className="h-5 w-5" />
          Visão Geral da Frota
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Vehicles */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
          <span className="font-medium">Total de Veículos</span>
          <span className="text-2xl font-bold text-primary">{stats.totalVehicles}</span>
        </div>
        
        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-2">
          {statItems.map(item => (
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
        
        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">{stats.totalOperatingHours}h</p>
            <p className="text-xs text-muted-foreground">Total Operação</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            </div>
            <p className={cn(
              'text-lg font-bold',
              stats.activeAlerts > 0 && 'text-amber-500'
            )}>
              {stats.activeAlerts}
            </p>
            <p className="text-xs text-muted-foreground">Alertas Ativos</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Fuel className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className={cn(
              'text-lg font-bold',
              stats.avgFuelLevel < 30 && 'text-amber-500'
            )}>
              {stats.avgFuelLevel}%
            </p>
            <p className="text-xs text-muted-foreground">Combustível Médio</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
