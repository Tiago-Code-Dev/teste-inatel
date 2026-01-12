import { cn } from '@/lib/utils';
import { 
  Truck, 
  Clock, 
  Gauge, 
  Activity, 
  ChevronRight,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  WifiOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

type MachineStatus = 'operational' | 'warning' | 'critical' | 'offline' | 'maintenance';

interface MachineStatusCardProps {
  machine: {
    id: string;
    name: string;
    model: string;
    status: MachineStatus;
    lastTelemetryAt: Date | string;
  };
  telemetry?: {
    pressure: number;
    speed: number;
  };
  alertCount?: number;
  syncStatus?: 'synced' | 'syncing' | 'pending';
  compact?: boolean;
  onViewAlerts?: () => void;
}

const statusConfig: Record<MachineStatus, { 
  label: string; 
  icon: typeof Truck;
  bgClass: string;
  textClass: string;
  badgeClass: string;
}> = {
  operational: {
    label: 'Operacional',
    icon: CheckCircle2,
    bgClass: 'bg-status-ok/10',
    textClass: 'text-status-ok',
    badgeClass: 'bg-status-ok/15 text-status-ok border-status-ok/30',
  },
  warning: {
    label: 'Atenção',
    icon: AlertTriangle,
    bgClass: 'bg-status-warning/10',
    textClass: 'text-status-warning',
    badgeClass: 'bg-status-warning/15 text-status-warning border-status-warning/30',
  },
  critical: {
    label: 'Crítico',
    icon: AlertTriangle,
    bgClass: 'bg-status-critical/10',
    textClass: 'text-status-critical',
    badgeClass: 'bg-status-critical/15 text-status-critical border-status-critical/30',
  },
  offline: {
    label: 'Sem Sinal',
    icon: WifiOff,
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground border-border',
  },
  maintenance: {
    label: 'Manutenção',
    icon: Wrench,
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-500',
    badgeClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  },
};

export function MachineStatusCard({
  machine,
  telemetry,
  alertCount = 0,
  syncStatus = 'synced',
  compact = false,
  onViewAlerts,
}: MachineStatusCardProps) {
  const config = statusConfig[machine.status];
  const StatusIcon = config.icon;
  const timeAgo = formatDistanceToNow(
    typeof machine.lastTelemetryAt === 'string' 
      ? new Date(machine.lastTelemetryAt) 
      : machine.lastTelemetryAt,
    { addSuffix: true, locale: ptBR }
  );

  if (compact) {
    return (
      <Link
        to={`/machines/${machine.id}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
          'hover:bg-muted/50 group',
          machine.status === 'critical' && 'bg-status-critical/5'
        )}
      >
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          config.bgClass
        )}>
          <Truck className={cn('w-5 h-5', config.textClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{machine.name}</p>
          <p className="text-xs text-muted-foreground">{machine.model}</p>
        </div>
        <Badge variant="outline" className={cn('text-xs shrink-0', config.badgeClass)}>
          {config.label}
        </Badge>
        {alertCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-status-critical text-white">
            {alertCount}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/machines/${machine.id}`}
        className={cn(
          'card-interactive flex flex-col p-4',
          machine.status === 'critical' && 'border-status-critical/50 pulse-critical'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-12 h-12 rounded-xl',
              config.bgClass
            )}>
              <Truck className={cn('w-6 h-6', config.textClass)} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{machine.name}</h3>
              <p className="text-sm text-muted-foreground">{machine.model}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={cn('text-xs', config.badgeClass)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            {alertCount > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewAlerts?.();
                }}
                className="flex items-center gap-1 text-xs text-status-critical hover:underline"
              >
                <AlertTriangle className="w-3 h-3" />
                {alertCount} alerta{alertCount > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Telemetry */}
        {telemetry && machine.status !== 'offline' && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <Gauge className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Pressão</p>
                <p className="text-sm font-semibold tabular-nums truncate">
                  {telemetry.pressure.toFixed(1)} PSI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Velocidade</p>
                <p className="text-sm font-semibold tabular-nums truncate">
                  {telemetry.speed.toFixed(0)} km/h
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo}
          </span>
          {syncStatus !== 'synced' && (
            <span className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
              syncStatus === 'syncing' && 'bg-blue-500/15 text-blue-500',
              syncStatus === 'pending' && 'bg-status-warning/15 text-status-warning'
            )}>
              {syncStatus === 'syncing' ? 'Sincronizando...' : 'Pendente'}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
