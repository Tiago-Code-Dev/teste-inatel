import { TimelineEvent } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AlertTriangle, 
  FileText, 
  Wrench, 
  CirclePlus, 
  CircleMinus 
} from 'lucide-react';

interface TireTimelineProps {
  events: TimelineEvent[];
}

const eventConfig: Record<TimelineEvent['type'], {
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
}> = {
  alert: {
    icon: AlertTriangle,
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
  },
  occurrence: {
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  installation: {
    icon: CirclePlus,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/10',
  },
  removal: {
    icon: CircleMinus,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
};

export function TireTimeline({ events }: TireTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />

      <div className="space-y-4">
        {events.map((event, index) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;

          return (
            <div 
              key={event.id} 
              className={cn(
                'relative flex gap-4 animate-fade-in',
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                'relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0',
                config.bgColor
              )}>
                <Icon className={cn('w-5 h-5', config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-foreground">{event.title}</h4>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(event.timestamp, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
