import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Truck, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MachinePerformance {
  machineId: string;
  machineName: string;
  uptime: number;
  downtime: number;
  efficiency: number;
  alertCount: number;
  status: 'operational' | 'warning' | 'critical' | 'offline';
}

interface MachinePerformanceListProps {
  machines: MachinePerformance[];
  onMachineSelect?: (machineId: string) => void;
  className?: string;
}

export function MachinePerformanceList({
  machines,
  onMachineSelect,
  className,
}: MachinePerformanceListProps) {
  const getStatusConfig = (status: MachinePerformance['status']) => {
    switch (status) {
      case 'operational':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Operacional' };
      case 'warning':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Atenção' };
      case 'critical':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Crítico' };
      case 'offline':
        return { icon: Truck, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Offline' };
    }
  };

  // Sort by status priority (critical first)
  const sortedMachines = [...machines].sort((a, b) => {
    const order = { critical: 0, warning: 1, offline: 2, operational: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="w-5 h-5" />
            Desempenho por Máquina
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {machines.length} máquinas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {sortedMachines.map((machine) => {
            const statusConfig = getStatusConfig(machine.status);
            const StatusIcon = statusConfig.icon;

            return (
              <button
                key={machine.machineId}
                onClick={() => onMachineSelect?.(machine.machineId)}
                className={cn(
                  'w-full p-3 rounded-lg border transition-colors text-left',
                  'hover:bg-muted/50',
                  machine.status === 'critical' && 'border-red-500/30 bg-red-500/5',
                  machine.status === 'warning' && 'border-yellow-500/30 bg-yellow-500/5'
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn('p-1.5 rounded-lg', statusConfig.bg)}>
                      <StatusIcon className={cn('w-4 h-4', statusConfig.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{machine.machineName}</p>
                      <p className={cn('text-xs', statusConfig.color)}>{statusConfig.label}</p>
                    </div>
                  </div>
                  {machine.alertCount > 0 && (
                    <Badge 
                      variant={machine.status === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs shrink-0"
                    >
                      {machine.alertCount} alertas
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Uptime</p>
                    <div className="flex items-center gap-2">
                      <Progress value={machine.uptime} className="h-1.5 flex-1" />
                      <span className="font-medium">{machine.uptime}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Eficiência</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={machine.efficiency} 
                        className={cn(
                          'h-1.5 flex-1',
                          machine.efficiency < 60 && '[&>div]:bg-red-500',
                          machine.efficiency >= 60 && machine.efficiency < 80 && '[&>div]:bg-yellow-500'
                        )}
                      />
                      <span className="font-medium">{machine.efficiency}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground mb-1">Inatividade</p>
                    <span className={cn(
                      'font-medium',
                      machine.downtime > 20 && 'text-red-500'
                    )}>
                      {machine.downtime}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {machines.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma máquina encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
