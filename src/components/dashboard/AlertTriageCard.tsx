import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Clock, 
  Truck, 
  User, 
  CheckCircle2,
  FileText,
  CircleDot,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';

interface AlertTriageCardProps {
  alert: {
    id: string;
    type: string;
    severity: AlertSeverity;
    status: AlertStatus;
    message: string;
    reason?: string | null;
    probable_cause?: string | null;
    recommended_action?: string | null;
    opened_at: string | Date;
    machine?: { name: string; model?: string } | null;
    tire?: { serial: string; position?: string } | null;
    assigned_to?: string | null;
  };
  onAssign?: (alertId: string) => void;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onCreateOccurrence?: (alertId: string) => void;
  onViewDetails?: (alertId: string) => void;
  compact?: boolean;
  loading?: boolean;
}

const severityConfig: Record<AlertSeverity, { 
  label: string; 
  bgClass: string; 
  textClass: string;
  iconClass: string;
}> = {
  low: {
    label: 'Baixa',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    iconClass: 'text-muted-foreground',
  },
  medium: {
    label: 'Média',
    bgClass: 'bg-status-warning/15',
    textClass: 'text-status-warning',
    iconClass: 'text-status-warning',
  },
  high: {
    label: 'Alta',
    bgClass: 'bg-orange-500/15',
    textClass: 'text-orange-500',
    iconClass: 'text-orange-500',
  },
  critical: {
    label: 'Crítica',
    bgClass: 'bg-status-critical/15',
    textClass: 'text-status-critical',
    iconClass: 'text-status-critical',
  },
};

const statusConfig: Record<AlertStatus, { label: string; className: string }> = {
  open: { label: 'Aberto', className: 'bg-status-critical/15 text-status-critical' },
  acknowledged: { label: 'Reconhecido', className: 'bg-status-warning/15 text-status-warning' },
  in_progress: { label: 'Em andamento', className: 'bg-blue-500/15 text-blue-500' },
  resolved: { label: 'Resolvido', className: 'bg-status-ok/15 text-status-ok' },
};

export function AlertTriageCard({
  alert,
  onAssign,
  onAcknowledge,
  onResolve,
  onCreateOccurrence,
  onViewDetails,
  compact = false,
  loading = false,
}: AlertTriageCardProps) {
  const severity = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const timeAgo = formatDistanceToNow(
    typeof alert.opened_at === 'string' ? new Date(alert.opened_at) : alert.opened_at,
    { addSuffix: true, locale: ptBR }
  );

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
          'hover:bg-muted/50 cursor-pointer group',
          alert.severity === 'critical' && 'bg-status-critical/5'
        )}
        onClick={() => onViewDetails?.(alert.id)}
      >
        <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg', severity.bgClass)}>
          <AlertTriangle className={cn('w-4 h-4', severity.iconClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{alert.message}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {alert.machine?.name && (
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                {alert.machine.name}
              </span>
            )}
            <span>{timeAgo}</span>
          </div>
        </div>
        <Badge className={cn('text-xs shrink-0', status.className)}>{status.label}</Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card-elevated p-4',
        alert.severity === 'critical' && 'border-status-critical/50 pulse-critical'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center justify-center w-11 h-11 rounded-xl', severity.bgClass)}>
            <AlertTriangle className={cn('w-5 h-5', severity.iconClass)} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-xs', status.className)}>{status.label}</Badge>
              <Badge variant="outline" className={cn('text-xs', severity.textClass)}>
                {severity.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </p>
          </div>
        </div>
        {alert.assigned_to && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <User className="w-3 h-3" />
            {alert.assigned_to}
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-foreground mb-2">{alert.message}</h3>

      {alert.probable_cause && (
        <div className="mb-2 p-2.5 rounded-lg bg-muted/50 text-sm">
          <p className="text-xs text-muted-foreground mb-0.5 font-medium">Causa provável:</p>
          <p className="text-foreground">{alert.probable_cause}</p>
        </div>
      )}

      {alert.recommended_action && (
        <div className="mb-3 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <p className="text-xs text-primary mb-0.5 font-medium">Ação recomendada:</p>
          <p className="text-foreground">{alert.recommended_action}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
        {alert.machine?.name && (
          <span className="inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            {alert.machine.name}
          </span>
        )}
        {alert.tire?.serial && (
          <span className="inline-flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5" />
            {alert.tire.position || alert.tire.serial}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Button
          variant="default"
          size="sm"
          className="flex-1 sm:flex-none gap-1.5"
          onClick={() => onViewDetails?.(alert.id)}
          disabled={loading}
        >
          Ver detalhes
          <ChevronRight className="w-4 h-4" />
        </Button>

        {alert.status === 'open' && (
          <>
            {!alert.assigned_to && onAssign && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onAssign(alert.id)}
                disabled={loading}
              >
                <UserPlus className="w-4 h-4" />
                Atribuir
              </Button>
            )}
            {onAcknowledge && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onAcknowledge(alert.id)}
                disabled={loading}
              >
                <CheckCircle2 className="w-4 h-4" />
                Reconhecer
              </Button>
            )}
          </>
        )}

        {alert.status !== 'resolved' && onCreateOccurrence && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => onCreateOccurrence(alert.id)}
            disabled={loading}
          >
            <FileText className="w-4 h-4" />
            Ocorrência
          </Button>
        )}
      </div>
    </motion.div>
  );
}
