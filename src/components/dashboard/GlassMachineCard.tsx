import { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DashboardMachine } from '@/contexts/DashboardContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TelemetrySparkline } from './TelemetrySparkline';
import { cn } from '@/lib/utils';
import { Truck, Clock, Gauge, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GlassMachineCardProps {
  machine: DashboardMachine;
  telemetry?: {
    pressure: number;
    speed: number;
  };
  delay?: number;
}

// Generate mock sparkline data based on machine ID for consistency
function generateSparklineData(machineId: string, baseValue: number, variance: number): number[] {
  const hash = machineId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 100;
  
  return Array.from({ length: 20 }, (_, i) => {
    const wave = Math.sin((i + seed) / 3) * variance;
    const noise = (Math.sin((i + seed) * 7.3) * 0.5 + 0.5) * variance * 0.5;
    return baseValue + wave + noise;
  });
}

export const GlassMachineCard = forwardRef<HTMLAnchorElement, GlassMachineCardProps>(({ 
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
  
  // Generate consistent sparkline data
  const pressureData = useMemo(() => 
    generateSparklineData(machine.id, telemetry?.pressure || 28, 3),
    [machine.id, telemetry?.pressure]
  );
  
  const speedData = useMemo(() => 
    generateSparklineData(machine.id + 'speed', telemetry?.speed || 15, 5),
    [machine.id, telemetry?.speed]
  );

  const getSparklineColor = (status: string): 'success' | 'warning' | 'danger' | 'primary' => {
    switch (status) {
      case 'operational': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link
        ref={ref}
        to={`/machines/${machine.id}`}
        className={cn(
          'block relative overflow-hidden rounded-2xl p-4 transition-all duration-300',
          // Glassmorphism effect
          'bg-gradient-to-br from-card/80 to-card/40',
          'backdrop-blur-xl',
          'border border-white/10',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
          'hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]',
          'hover:border-white/20',
          // Critical state
          status === 'critical' && [
            'border-status-critical/40',
            'shadow-[0_0_30px_hsl(var(--status-critical)/0.15)]',
            'hover:shadow-[0_0_40px_hsl(var(--status-critical)/0.25)]',
          ],
          // Warning state
          status === 'warning' && [
            'border-status-warning/30',
          ],
        )}
      >
        {/* Background gradient overlay */}
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          'bg-gradient-to-br',
          status === 'operational' && 'from-status-ok/5 to-transparent',
          status === 'warning' && 'from-status-warning/5 to-transparent',
          status === 'critical' && 'from-status-critical/5 to-transparent',
          status === 'offline' && 'from-muted/20 to-transparent',
        )} />

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-xl',
                  'backdrop-blur-sm',
                  status === 'operational' && 'bg-status-ok/15 ring-1 ring-status-ok/20',
                  status === 'warning' && 'bg-status-warning/15 ring-1 ring-status-warning/20',
                  status === 'critical' && 'bg-status-critical/15 ring-1 ring-status-critical/20',
                  status === 'offline' && 'bg-muted/50 ring-1 ring-border'
                )}
                whileHover={{ scale: 1.05, rotate: 3 }}
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
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {machine.name}
                </h3>
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

          {/* Metrics with Sparklines */}
          {status !== 'offline' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative flex flex-col gap-1 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Pressão</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {telemetry?.pressure.toFixed(1) || '--'} PSI
                  </span>
                </div>
                <TelemetrySparkline
                  data={pressureData}
                  color={getSparklineColor(status)}
                  height={24}
                  width={120}
                  className="w-full"
                />
              </div>
              <div className="relative flex flex-col gap-1 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Velocidade</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {telemetry?.speed.toFixed(0) || '--'} km/h
                  </span>
                </div>
                <TelemetrySparkline
                  data={speedData}
                  color={getSparklineColor(status)}
                  height={24}
                  width={120}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Offline state */}
          {status === 'offline' && (
            <div className="flex items-center justify-center py-6 mb-4 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20">
              <span className="text-sm text-muted-foreground">Sem dados disponíveis</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {timeAgo}
              </span>
            </div>
            <motion.div
              initial={{ x: 0, opacity: 0 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span>Detalhes</span>
              <ChevronRight className="w-3 h-3" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

GlassMachineCard.displayName = 'GlassMachineCard';
