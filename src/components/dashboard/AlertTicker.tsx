import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, XCircle, Info, ChevronRight, Bell } from 'lucide-react';
import { DashboardAlert } from '@/contexts/DashboardContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface AlertTickerProps {
  alerts: DashboardAlert[];
  speed?: number;
  className?: string;
}

const severityConfig = {
  critical: {
    icon: XCircle,
    bg: 'bg-status-critical/10',
    border: 'border-status-critical/30',
    text: 'text-status-critical',
    glow: 'shadow-[0_0_20px_hsl(var(--status-critical)/0.3)]',
  },
  high: {
    icon: AlertTriangle,
    bg: 'bg-status-warning/10',
    border: 'border-status-warning/30',
    text: 'text-status-warning',
    glow: 'shadow-[0_0_15px_hsl(var(--status-warning)/0.2)]',
  },
  medium: {
    icon: AlertTriangle,
    bg: 'bg-status-warning/5',
    border: 'border-status-warning/20',
    text: 'text-status-warning',
    glow: '',
  },
  low: {
    icon: Info,
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    text: 'text-primary',
    glow: '',
  },
};

export function AlertTicker({ alerts, speed = 5000, className }: AlertTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Only show non-resolved alerts
  const activeAlerts = useMemo(() => 
    alerts.filter(a => a.status !== 'resolved').slice(0, 10),
    [alerts]
  );

  // Auto-advance ticker
  useEffect(() => {
    if (activeAlerts.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAlerts.length);
    }, speed);

    return () => clearInterval(interval);
  }, [activeAlerts.length, speed, isPaused]);

  if (activeAlerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-xl',
          'bg-status-ok/10 border border-status-ok/20',
          className
        )}
      >
        <div className="flex items-center gap-2 text-status-ok">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">Sistema Operacional</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Nenhum alerta ativo no momento
        </span>
      </motion.div>
    );
  }

  const currentAlert = activeAlerts[currentIndex];
  const severity = currentAlert?.severity as keyof typeof severityConfig || 'low';
  const config = severityConfig[severity];
  const Icon = config.icon;
  const machineName = currentAlert?.machines?.name || 'Máquina';

  const timeAgo = currentAlert?.opened_at 
    ? formatDistanceToNow(new Date(currentAlert.opened_at), { addSuffix: true, locale: ptBR })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        'relative flex items-center gap-3 px-4 py-2 rounded-xl border overflow-hidden',
        config.bg,
        config.border,
        config.glow,
        'transition-all duration-300',
        className
      )}
    >
      {/* Critical pulse background */}
      {severity === 'critical' && (
        <motion.div
          className="absolute inset-0 bg-status-critical/5"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Icon */}
      <motion.div
        animate={severity === 'critical' ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        className={cn('shrink-0', config.text)}
      >
        <Icon className="w-5 h-5" />
      </motion.div>

      {/* Alert content */}
      <div className="flex-1 min-w-0 relative h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAlert?.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center gap-2"
          >
            <span className={cn('font-medium text-sm truncate', config.text)}>
              {currentAlert?.message}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              • {machineName}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              • {timeAgo}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      {activeAlerts.length > 1 && (
        <div className="flex items-center gap-1 shrink-0">
          {activeAlerts.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                index === currentIndex % 5 
                  ? cn('w-4', config.text, 'bg-current') 
                  : 'bg-muted-foreground/30'
              )}
            />
          ))}
          {activeAlerts.length > 5 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{activeAlerts.length - 5}
            </span>
          )}
        </div>
      )}

      {/* View all link */}
      <Link
        to="/alerts"
        className={cn(
          'shrink-0 flex items-center gap-1 text-xs font-medium',
          config.text,
          'hover:underline'
        )}
      >
        Ver todos
        <ChevronRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}
