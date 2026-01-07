import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { DashboardMachine } from '@/contexts/DashboardContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { Truck, Clock, Gauge, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MachineCardProps {
  machine: DashboardMachine;
  telemetry?: {
    pressure: number;
    speed: number;
  };
  delay?: number;
}

export const MachineCard = forwardRef<HTMLAnchorElement, MachineCardProps>(({ 
  machine, 
  telemetry,
  delay = 0,
}, ref) => {
  const timeAgo = machine.last_telemetry_at 
    ? formatDistanceToNow(new Date(machine.last_telemetry_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : 'Nunca';

  const status = machine.status as 'operational' | 'warning' | 'critical' | 'offline';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link
        ref={ref}
        to={`/machines/${machine.id}`}
        className={cn(
          'block card-interactive p-4 transition-all duration-300',
          status === 'critical' && 'border-status-critical/50 shadow-[0_0_20px_hsl(var(--status-critical)/0.1)]'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl',
                status === 'operational' && 'bg-status-ok/10',
                status === 'warning' && 'bg-status-warning/10',
                status === 'critical' && 'bg-status-critical/10',
                status === 'offline' && 'bg-muted'
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Truck className={cn(
                'w-6 h-6',
                status === 'operational' && 'text-status-ok',
                status === 'warning' && 'text-status-warning',
                status === 'critical' && 'text-status-critical',
                status === 'offline' && 'text-muted-foreground'
              )} />
            </motion.div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{machine.name}</h3>
              <p className="text-sm text-muted-foreground">{machine.model}</p>
            </div>
          </div>
          <StatusBadge 
            status={status} 
            showLabel={false} 
            size="sm" 
            pulse={status === 'critical'}
          />
        </div>

        {/* Metrics */}
        {telemetry && status !== 'offline' && (
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
    </motion.div>
  );
});

MachineCard.displayName = 'MachineCard';
