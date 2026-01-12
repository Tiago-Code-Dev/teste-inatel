import { cn } from '@/lib/utils';
import { 
  Wrench,
  Clock,
  Truck,
  User,
  ChevronRight,
  CheckCircle2,
  Calendar,
  FileText
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

interface MaintenanceCardProps {
  maintenance: {
    id: string;
    status: MaintenanceStatus;
    description: string;
    scheduled_at?: string | Date | null;
    performed_at?: string | Date | null;
    machine?: { name: string } | null;
    technician?: string | null;
    notes?: string | null;
  };
  onViewDetails?: (maintenanceId: string) => void;
  onMarkComplete?: (maintenanceId: string) => void;
  compact?: boolean;
  loading?: boolean;
}

const statusConfig: Record<MaintenanceStatus, { label: string; className: string; icon: typeof Wrench }> = {
  scheduled: { 
    label: 'Agendada', 
    className: 'bg-blue-500/15 text-blue-500',
    icon: Calendar,
  },
  in_progress: { 
    label: 'Em andamento', 
    className: 'bg-status-warning/15 text-status-warning',
    icon: Wrench,
  },
  completed: { 
    label: 'Concluída', 
    className: 'bg-status-ok/15 text-status-ok',
    icon: CheckCircle2,
  },
  cancelled: { 
    label: 'Cancelada', 
    className: 'bg-muted text-muted-foreground',
    icon: FileText,
  },
};

export function MaintenanceCard({
  maintenance,
  onViewDetails,
  onMarkComplete,
  compact = false,
  loading = false,
}: MaintenanceCardProps) {
  const config = statusConfig[maintenance.status];
  const StatusIcon = config.icon;
  
  const dateToShow = maintenance.performed_at || maintenance.scheduled_at;
  const timeAgo = dateToShow 
    ? formatDistanceToNow(
        typeof dateToShow === 'string' ? new Date(dateToShow) : dateToShow,
        { addSuffix: true, locale: ptBR }
      )
    : null;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
          'hover:bg-muted/50 cursor-pointer group'
        )}
        onClick={() => onViewDetails?.(maintenance.id)}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10">
          <StatusIcon className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{maintenance.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {maintenance.machine?.name && (
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                {maintenance.machine.name}
              </span>
            )}
            {timeAgo && <span>{timeAgo}</span>}
          </div>
        </div>
        <Badge className={cn('text-xs shrink-0', config.className)}>{config.label}</Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-500/10">
            <StatusIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-xs', config.className)}>{config.label}</Badge>
            </div>
            {timeAgo && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </p>
            )}
          </div>
        </div>
        {maintenance.technician && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <User className="w-3 h-3" />
            {maintenance.technician}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-foreground mb-3 line-clamp-2">{maintenance.description}</p>

      {/* Notes */}
      {maintenance.notes && (
        <div className="mb-3 p-2.5 rounded-lg bg-muted/50 text-sm">
          <p className="text-xs text-muted-foreground mb-0.5 font-medium">Observações:</p>
          <p className="text-foreground line-clamp-2">{maintenance.notes}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {maintenance.machine?.name && (
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              {maintenance.machine.name}
            </span>
          )}
          {maintenance.scheduled_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(
                typeof maintenance.scheduled_at === 'string' 
                  ? new Date(maintenance.scheduled_at) 
                  : maintenance.scheduled_at,
                'dd/MM/yyyy',
                { locale: ptBR }
              )}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Button
          variant="default"
          size="sm"
          className="flex-1 sm:flex-none gap-1.5"
          onClick={() => onViewDetails?.(maintenance.id)}
          disabled={loading}
        >
          Ver detalhes
          <ChevronRight className="w-4 h-4" />
        </Button>

        {maintenance.status === 'in_progress' && onMarkComplete && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-status-ok hover:text-status-ok"
            onClick={() => onMarkComplete(maintenance.id)}
            disabled={loading}
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluir
          </Button>
        )}
      </div>
    </motion.div>
  );
}
