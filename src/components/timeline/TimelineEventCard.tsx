import { TimelineEvent, AlertSeverity } from '@/types';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AlertTriangle, 
  FileText, 
  Wrench, 
  CirclePlus, 
  CircleMinus,
  Bell,
  Gauge,
  Info,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface TimelineEventCardProps {
  event: TimelineEvent;
  isFirst?: boolean;
  isLast?: boolean;
  onClick?: () => void;
  showConnector?: boolean;
}

type EventType = TimelineEvent['type'] | 'telemetry_critical' | 'info';

const eventConfig: Record<EventType, {
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
  label: string;
}> = {
  alert: {
    icon: Bell,
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
    label: 'Alerta',
  },
  occurrence: {
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    label: 'Ocorrência',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/10',
    label: 'Manutenção',
  },
  installation: {
    icon: CirclePlus,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/10',
    label: 'Instalação',
  },
  removal: {
    icon: CircleMinus,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Remoção',
  },
  telemetry_critical: {
    icon: Gauge,
    color: 'text-status-critical',
    bgColor: 'bg-status-critical/10',
    label: 'Telemetria Crítica',
  },
  info: {
    icon: Info,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Informação',
  },
};

const severityColors: Record<AlertSeverity, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-status-warning/15 text-status-warning',
  high: 'bg-status-warning/20 text-status-warning',
  critical: 'bg-status-critical/15 text-status-critical',
};

export function TimelineEventCard({ 
  event, 
  isFirst, 
  isLast, 
  onClick,
  showConnector = true 
}: TimelineEventCardProps) {
  const config = eventConfig[event.type] || eventConfig.info;
  const Icon = config.icon;

  const formatEventTime = (date: Date) => {
    if (isToday(date)) {
      return `Hoje às ${format(date, 'HH:mm', { locale: ptBR })}`;
    }
    if (isYesterday(date)) {
      return `Ontem às ${format(date, 'HH:mm', { locale: ptBR })}`;
    }
    const days = differenceInDays(new Date(), date);
    if (days <= 7) {
      return format(date, "EEEE 'às' HH:mm", { locale: ptBR });
    }
    return format(date, "dd MMM yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div 
      className={cn(
        'relative flex gap-4 group',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {/* Timeline connector */}
      {showConnector && (
        <div className="absolute left-5 top-0 bottom-0 w-px">
          {!isFirst && <div className="absolute top-0 left-0 w-full h-3 bg-border" />}
          {!isLast && <div className="absolute bottom-0 left-0 w-full h-full bg-border" />}
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        'relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-transform duration-200',
        config.bgColor,
        onClick && 'group-hover:scale-110',
        isFirst && 'ring-2 ring-primary/20'
      )}>
        <Icon className={cn('w-5 h-5', config.color)} />
      </div>

      {/* Content Card */}
      <div className={cn(
        'flex-1 pb-6 min-w-0',
        isLast && 'pb-0'
      )}>
        <div className={cn(
          'p-4 rounded-xl border border-border bg-card transition-all duration-200',
          onClick && 'group-hover:border-primary/30 group-hover:shadow-md',
          isFirst && 'border-primary/20 shadow-sm'
        )}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn('text-xs font-medium', config.color)}>
                {config.label}
              </Badge>
              {event.severity && (
                <Badge className={cn('text-xs', severityColors[event.severity])}>
                  {event.severity === 'critical' ? 'Crítico' : 
                   event.severity === 'high' ? 'Alto' :
                   event.severity === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
              )}
            </div>
            {onClick && (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
            )}
          </div>

          {/* Title & Description */}
          <h4 className="font-medium text-foreground mb-1 line-clamp-2">
            {event.title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>

          {/* Timestamp */}
          <time className="block mt-3 text-xs text-muted-foreground capitalize">
            {formatEventTime(event.timestamp)}
          </time>
        </div>
      </div>
    </div>
  );
}
