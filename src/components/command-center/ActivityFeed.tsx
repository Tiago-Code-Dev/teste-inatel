import { cn } from '@/lib/utils';
import { 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  UserPlus,
  MessageSquare,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

export type ActivityType = 
  | 'alert_created' 
  | 'alert_acknowledged' 
  | 'alert_assigned' 
  | 'alert_resolved'
  | 'occurrence_created'
  | 'occurrence_updated'
  | 'occurrence_closed'
  | 'comment_added';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actorName: string;
  actorAvatar?: string;
  targetId: string;
  targetType: 'alert' | 'occurrence';
  targetLabel: string;
  timestamp: Date | string;
  metadata?: {
    assignedTo?: string;
    comment?: string;
    previousStatus?: string;
    newStatus?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxHeight?: string;
  className?: string;
  showEmpty?: boolean;
}

const activityConfig: Record<ActivityType, { 
  icon: typeof User; 
  color: string; 
  bgColor: string;
  getLabel: (item: ActivityItem) => string;
}> = {
  alert_created: {
    icon: AlertTriangle,
    color: 'text-status-critical',
    bgColor: 'bg-status-critical/10',
    getLabel: (item) => `Novo alerta gerado`,
  },
  alert_acknowledged: {
    icon: CheckCircle2,
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
    getLabel: (item) => `reconheceu o alerta`,
  },
  alert_assigned: {
    icon: UserPlus,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    getLabel: (item) => `atribuiu alerta para ${item.metadata?.assignedTo || 'alguém'}`,
  },
  alert_resolved: {
    icon: CheckCircle2,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/10',
    getLabel: (item) => `resolveu o alerta`,
  },
  occurrence_created: {
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    getLabel: (item) => `criou ocorrência`,
  },
  occurrence_updated: {
    icon: ArrowRight,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    getLabel: (item) => `atualizou status para ${item.metadata?.newStatus || ''}`,
  },
  occurrence_closed: {
    icon: CheckCircle2,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/10',
    getLabel: (item) => `fechou a ocorrência`,
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    getLabel: (item) => `comentou`,
  },
};

export function ActivityFeed({ activities, maxHeight = '400px', className, showEmpty = true }: ActivityFeedProps) {
  if (activities.length === 0 && showEmpty) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <Clock className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
        <p className="text-xs text-muted-foreground/70 mt-1">As ações do time aparecerão aqui</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('w-full', className)} style={{ maxHeight }}>
      <div className="space-y-1 pr-3">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;
            const timestamp = typeof activity.timestamp === 'string' 
              ? new Date(activity.timestamp) 
              : activity.timestamp;
            const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR });

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                {/* Icon */}
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                  config.bgColor
                )}>
                  <Icon className={cn('w-4 h-4', config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-tight">
                    <span className="font-medium">{activity.actorName}</span>
                    {' '}
                    <span className="text-muted-foreground">{config.getLabel(activity)}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-primary font-medium truncate">
                      #{activity.targetLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                  </div>
                  {activity.metadata?.comment && (
                    <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                      "{activity.metadata.comment}"
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
