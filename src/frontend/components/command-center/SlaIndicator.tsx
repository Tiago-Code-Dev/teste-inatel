import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, differenceInMinutes, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

export type SlaStatus = 'ok' | 'warning' | 'expired';

interface SlaIndicatorProps {
  dueAt?: Date | string | null;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function getSlaStatus(dueAt: Date | string | null | undefined): SlaStatus {
  if (!dueAt) return 'ok';
  
  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  const now = new Date();
  const minutesRemaining = differenceInMinutes(due, now);
  
  if (minutesRemaining < 0) return 'expired';
  if (minutesRemaining <= 30) return 'warning';
  return 'ok';
}

export function SlaIndicator({ dueAt, className, showLabel = true, compact = false }: SlaIndicatorProps) {
  if (!dueAt) return null;

  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  const now = new Date();
  const status = getSlaStatus(dueAt);
  const minutesRemaining = differenceInMinutes(due, now);
  const hoursRemaining = differenceInHours(due, now);
  
  const config = {
    ok: {
      bgClass: 'bg-status-ok/10',
      textClass: 'text-status-ok',
      borderClass: 'border-status-ok/30',
      icon: CheckCircle2,
      label: 'SLA OK',
    },
    warning: {
      bgClass: 'bg-status-warning/10',
      textClass: 'text-status-warning',
      borderClass: 'border-status-warning/30',
      icon: Clock,
      label: 'SLA Vencendo',
    },
    expired: {
      bgClass: 'bg-status-critical/10',
      textClass: 'text-status-critical',
      borderClass: 'border-status-critical/30',
      icon: AlertTriangle,
      label: 'SLA Vencido',
    },
  };

  const { bgClass, textClass, borderClass, icon: Icon, label } = config[status];
  
  const getTimeLabel = () => {
    if (status === 'expired') {
      return formatDistanceToNow(due, { addSuffix: false, locale: ptBR }) + ' atrás';
    }
    if (minutesRemaining < 60) {
      return `${minutesRemaining}min restantes`;
    }
    if (hoursRemaining < 24) {
      return `${hoursRemaining}h restantes`;
    }
    return formatDistanceToNow(due, { addSuffix: false, locale: ptBR }) + ' restantes';
  };

  if (compact) {
    return (
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
          bgClass,
          textClass,
          status === 'expired' && 'pulse-critical',
          className
        )}
      >
        <Icon className="w-3 h-3" />
        {getTimeLabel()}
      </motion.span>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border',
        bgClass,
        borderClass,
        status === 'expired' && 'pulse-critical',
        className
      )}
    >
      <Icon className={cn('w-4 h-4', textClass)} />
      <div className="flex-1 min-w-0">
        {showLabel && (
          <p className={cn('text-xs font-medium', textClass)}>{label}</p>
        )}
        <p className="text-xs text-muted-foreground">{getTimeLabel()}</p>
      </div>
    </motion.div>
  );
}
