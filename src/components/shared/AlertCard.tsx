import { Alert } from '@/types';
import { SeverityBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  ChevronRight, 
  Truck,
  CircleDot,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface AlertCardProps {
  alert: Alert;
  compact?: boolean;
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  acknowledged: 'Reconhecido',
  in_progress: 'Em andamento',
  resolved: 'Resolvido',
};

export function AlertCard({ alert, compact = false }: AlertCardProps) {
  const timeAgo = formatDistanceToNow(alert.openedAt, {
    addSuffix: true,
    locale: ptBR,
  });

  if (compact) {
    return (
      <Link
        to={`/alerts/${alert.id}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
          'hover:bg-muted/50 group',
          alert.severity === 'critical' && 'bg-status-critical/5'
        )}
      >
        <SeverityBadge severity={alert.severity} showLabel={false} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {alert.message}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {alert.machineName}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    );
  }

  return (
    <div className={cn(
      'card-elevated p-4 animate-fade-in',
      alert.severity === 'critical' && 'border-status-critical/50'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={alert.severity} />
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
      <p className="text-sm text-muted-foreground mb-4">
        {alert.reason}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          {alert.machineName}
        </span>
        {alert.tireSerial && (
          <span className="inline-flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5" />
            {alert.tireSerial}
          </span>
        )}
        {alert.acknowledgedBy && (
          <span className="inline-flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {alert.acknowledgedBy}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <Link
          to={`/alerts/${alert.id}`}
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
    </div>
  );
}
