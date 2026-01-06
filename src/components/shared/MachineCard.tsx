import { Machine } from '@/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { Truck, Clock, Gauge, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MachineCardProps {
  machine: Machine;
  telemetry?: {
    pressure: number;
    speed: number;
  };
}

export function MachineCard({ machine, telemetry }: MachineCardProps) {
  const timeAgo = formatDistanceToNow(machine.lastTelemetryAt, {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Link
      to={`/machines/${machine.id}`}
      className={cn(
        'card-interactive flex flex-col p-4 animate-fade-in',
        machine.status === 'critical' && 'border-status-critical/50 animate-pulse-glow'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            machine.status === 'operational' && 'bg-status-ok/10',
            machine.status === 'warning' && 'bg-status-warning/10',
            machine.status === 'critical' && 'bg-status-critical/10',
            machine.status === 'offline' && 'bg-muted'
          )}>
            <Truck className={cn(
              'w-6 h-6',
              machine.status === 'operational' && 'text-status-ok',
              machine.status === 'warning' && 'text-status-warning',
              machine.status === 'critical' && 'text-status-critical',
              machine.status === 'offline' && 'text-muted-foreground'
            )} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{machine.name}</h3>
            <p className="text-sm text-muted-foreground">{machine.model}</p>
          </div>
        </div>
        <StatusBadge 
          status={machine.status} 
          showLabel={false} 
          size="sm" 
          pulse={machine.status === 'critical'}
        />
      </div>

      {/* Metrics */}
      {telemetry && machine.status !== 'offline' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pressão</p>
              <p className="text-sm font-semibold tabular-nums">
                {telemetry.pressure.toFixed(1)} PSI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Velocidade</p>
              <p className="text-sm font-semibold tabular-nums">
                {telemetry.speed.toFixed(0)} km/h
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Última atualização: {timeAgo}
        </span>
      </div>
    </Link>
  );
}
