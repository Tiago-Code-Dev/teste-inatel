import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Activity, CheckCircle2, Clock, MessageSquare, UserPlus, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export type TimelineEventType = 
  | 'alert_created'
  | 'alert_acknowledged'
  | 'alert_assigned'
  | 'alert_resolved'
  | 'alert_escalated'
  | 'comment_added'
  | 'status_changed';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: Date | string;
  actor: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  data?: {
    comment?: string;
    assignee?: string;
    oldStatus?: string;
    newStatus?: string;
  };
}

interface AlertTimelineProps {
  events: TimelineEvent[];
  className?: string;
  compact?: boolean;
}

const eventConfig: Record<TimelineEventType, { 
  icon: any; 
  color: string; 
  bgColor: string;
  getLabel: (event: TimelineEvent) => string;
}> = {
  alert_created: {
    icon: AlertTriangle,
    color: 'text-status-critical',
    bgColor: 'bg-status-critical/15',
    getLabel: () => 'criou o alerta',
  },
  alert_acknowledged: {
    icon: CheckCircle2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/15',
    getLabel: () => 'reconheceu o alerta',
  },
  alert_assigned: {
    icon: UserPlus,
    color: 'text-primary',
    bgColor: 'bg-primary/15',
    getLabel: (event) => `atribuiu para ${event.data?.assignee || 'alguém'}`,
  },
  alert_resolved: {
    icon: CheckCircle2,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/15',
    getLabel: () => 'resolveu o alerta',
  },
  alert_escalated: {
    icon: ArrowUpRight,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/15',
    getLabel: () => 'escalou o alerta',
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    getLabel: () => 'adicionou um comentário',
  },
  status_changed: {
    icon: Activity,
    color: 'text-primary',
    bgColor: 'bg-primary/15',
    getLabel: (event) => `alterou status para ${event.data?.newStatus || 'novo'}`,
  },
};

export function AlertTimeline({ events, className, compact = false }: AlertTimelineProps) {
  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4" />
            Timeline de Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
            <Activity className="w-6 h-6 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma ação registrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-4 h-4" />
          Timeline de Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className={compact ? 'h-[200px]' : 'h-[300px]'}>
          <div className="relative pl-6 space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
            
            <AnimatePresence initial={false}>
              {sortedEvents.map((event, index) => {
                const config = eventConfig[event.type];
                const Icon = config.icon;
                const timeAgo = formatDistanceToNow(new Date(event.timestamp), {
                  addSuffix: true,
                  locale: ptBR,
                });

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-3"
                  >
                    {/* Icon */}
                    <div className={cn(
                      'absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center z-10',
                      config.bgColor
                    )}>
                      <Icon className={cn('w-3 h-3', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={event.actor.avatar_url} />
                          <AvatarFallback className="text-[8px]">
                            {event.actor.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{event.actor.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {config.getLabel(event)}
                        </span>
                      </div>
                      
                      {/* Comment preview */}
                      {event.type === 'comment_added' && event.data?.comment && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pl-7">
                          "{event.data.comment}"
                        </p>
                      )}
                      
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 pl-7">
                        {timeAgo}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
