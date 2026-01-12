import { TimelineEvent, AlertSeverity } from '@/types';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, differenceInDays, differenceInHours } from 'date-fns';
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
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export interface TimelineEventCardProps {
  event: TimelineEvent;
  isFirst?: boolean;
  isLast?: boolean;
  onClick?: (event: TimelineEvent) => void;
  showConnector?: boolean;
  animationDelay?: number;
}

type EventType = TimelineEvent['type'] | 'telemetry_critical' | 'info';

const eventConfig: Record<EventType, {
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
  label: string;
  borderColor: string;
}> = {
  alert: {
    icon: Bell,
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
    borderColor: 'border-status-warning/20',
    label: 'Alerta',
  },
  occurrence: {
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    label: 'Ocorrência',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/10',
    borderColor: 'border-status-ok/20',
    label: 'Manutenção',
  },
  installation: {
    icon: CirclePlus,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/10',
    borderColor: 'border-status-ok/20',
    label: 'Instalação',
  },
  removal: {
    icon: CircleMinus,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
    label: 'Remoção',
  },
  telemetry_critical: {
    icon: Gauge,
    color: 'text-status-critical',
    bgColor: 'bg-status-critical/10',
    borderColor: 'border-status-critical/20',
    label: 'Telemetria Crítica',
  },
  info: {
    icon: Info,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
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
  showConnector = true,
  animationDelay = 0
}: TimelineEventCardProps) {
  const config = eventConfig[event.type] || eventConfig.info;
  const Icon = config.icon;
  const isRecent = differenceInHours(new Date(), new Date(event.timestamp)) < 6;
  const isCritical = event.severity === 'critical' || event.id.startsWith('telemetry-');

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

  const handleClick = () => {
    if (onClick) onClick(event);
  };

  return (
    <motion.div 
      className={cn(
        'relative flex gap-4 group',
        onClick && 'cursor-pointer',
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: animationDelay / 1000,
        ease: 'easeOut'
      }}
      whileHover={onClick ? { x: 4 } : {}}
      onClick={handleClick}
    >
      {/* Timeline connector */}
      {showConnector && (
        <div className="absolute left-5 top-0 bottom-0 w-px">
          {!isFirst && <div className="absolute top-0 left-0 w-full h-3 bg-border" />}
          {!isLast && <div className="absolute bottom-0 left-0 w-full h-full bg-border" />}
        </div>
      )}

      {/* Icon with pulse animation for critical events */}
      <motion.div 
        className={cn(
          'relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors duration-300',
          config.bgColor,
          isFirst && 'ring-2 ring-primary/20',
        )}
        whileHover={onClick ? { scale: 1.1 } : {}}
        animate={isCritical ? { 
          scale: [1, 1.05, 1],
          boxShadow: ['0 0 0 0 rgba(239,68,68,0)', '0 0 0 6px rgba(239,68,68,0.2)', '0 0 0 0 rgba(239,68,68,0)']
        } : {}}
        transition={isCritical ? { repeat: Infinity, duration: 2 } : {}}
      >
        <Icon className={cn('w-5 h-5', config.color)} />
        {isRecent && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
        )}
      </motion.div>

      {/* Content Card with enhanced styling */}
      <div className={cn(
        'flex-1 pb-6 min-w-0',
        isLast && 'pb-0'
      )}>
        <motion.div 
          className={cn(
            'p-4 rounded-xl border bg-card transition-colors duration-300',
            config.borderColor,
            onClick && 'group-hover:border-primary/40',
            isFirst && 'shadow-sm border-primary/20',
            isCritical && 'border-status-critical/30 shadow-status-critical/5'
          )}
          whileHover={onClick ? { 
            y: -2,
            boxShadow: '0 10px 20px -10px rgba(0,0,0,0.1)'
          } : {}}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs font-medium transition-colors', 
                  config.color,
                  config.bgColor
                )}
              >
                {config.label}
              </Badge>
              {event.severity && (
                <Badge className={cn('text-xs', severityColors[event.severity])}>
                  {event.severity === 'critical' ? 'Crítico' : 
                   event.severity === 'high' ? 'Alto' :
                   event.severity === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
              )}
              {isRecent && (
                <Badge className="text-xs bg-primary/10 text-primary gap-1">
                  <Sparkles className="w-3 h-3" />
                  Novo
                </Badge>
              )}
            </div>
            {onClick && (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
        </motion.div>
      </div>
    </motion.div>
  );
}
