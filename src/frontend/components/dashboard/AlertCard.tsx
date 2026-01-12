import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { DashboardAlert } from '@/contexts/DashboardContext';
import { SeverityBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { Clock, ChevronRight, Truck, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface AlertCardProps {
  alert: DashboardAlert;
  compact?: boolean;
  delay?: number;
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  acknowledged: 'Reconhecido',
  in_progress: 'Em andamento',
  resolved: 'Resolvido',
};

export const AlertCard = forwardRef<HTMLAnchorElement, AlertCardProps>(({ 
  alert, 
  compact = false,
  delay = 0,
}, ref) => {
  const timeAgo = formatDistanceToNow(new Date(alert.opened_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const severity = alert.severity as 'low' | 'medium' | 'high' | 'critical';
  const machineName = alert.machines?.name || 'Máquina desconhecida';

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay }}
      >
        <Link
          ref={ref}
          to={`/alerts`}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
            'hover:bg-muted/50 group',
            severity === 'critical' && 'bg-status-critical/5'
          )}
        >
          <SeverityBadge severity={severity} showLabel={false} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {alert.message}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {machineName}
            </p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'card-elevated p-4',
        severity === 'critical' && 'border-status-critical/50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={severity} />
          <Badge variant="outline" className="text-xs">
            {statusLabels[alert.status]}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-foreground mb-1">
        {alert.message}
      </h3>
      {alert.reason && (
        <p className="text-sm text-muted-foreground mb-4">
          {alert.reason}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          {machineName}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <Link
          to={`/alerts`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Ver detalhes
          <ChevronRight className="w-4 h-4" />
        </Link>
        {alert.status === 'open' && (
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors">
            Reconhecer
          </button>
        )}
      </div>
    </motion.div>
  );
});

AlertCard.displayName = 'AlertCard';
