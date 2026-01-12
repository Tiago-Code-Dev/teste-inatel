import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  UserPlus,
  MessageSquare,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Zap,
  Radio
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export type LiveActivityType = 
  | 'alert_created' 
  | 'alert_acknowledged' 
  | 'alert_assigned' 
  | 'alert_resolved'
  | 'alert_escalated'
  | 'occurrence_created'
  | 'occurrence_updated'
  | 'occurrence_closed'
  | 'comment_added'
  | 'system_event';

export interface LiveActivityItem {
  id: string;
  type: LiveActivityType;
  actorName: string;
  actorAvatar?: string;
  targetId: string;
  targetType: 'alert' | 'occurrence' | 'system';
  targetLabel: string;
  timestamp: Date | string;
  isNew?: boolean;
  metadata?: {
    assignedTo?: string;
    comment?: string;
    previousStatus?: string;
    newStatus?: string;
    severity?: string;
  };
}

interface LiveActivityFeedProps {
  activities: LiveActivityItem[];
  onActivityAdd?: (activity: Omit<LiveActivityItem, 'id' | 'timestamp' | 'isNew'>) => void;
  maxHeight?: string;
  className?: string;
  showLiveIndicator?: boolean;
}

const activityConfig: Record<LiveActivityType, { 
  icon: typeof User; 
  color: string; 
  bgColor: string;
  getLabel: (item: LiveActivityItem) => string;
}> = {
  alert_created: {
    icon: AlertTriangle,
    color: 'text-status-critical',
    bgColor: 'bg-status-critical/10',
    getLabel: () => `Novo alerta detectado`,
  },
  alert_acknowledged: {
    icon: CheckCircle2,
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
    getLabel: () => `reconheceu o alerta`,
  },
  alert_assigned: {
    icon: UserPlus,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    getLabel: (item) => `atribuiu para ${item.metadata?.assignedTo || 'alguém'}`,
  },
  alert_resolved: {
    icon: CheckCircle2,
    color: 'text-status-ok',
    bgColor: 'bg-status-ok/10',
    getLabel: () => `resolveu o alerta`,
  },
  alert_escalated: {
    icon: ArrowUpRight,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    getLabel: () => `escalou o alerta`,
  },
  occurrence_created: {
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    getLabel: () => `criou ocorrência`,
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
    getLabel: () => `fechou a ocorrência`,
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    getLabel: () => `comentou`,
  },
  system_event: {
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    getLabel: (item) => item.targetLabel,
  },
};

export function LiveActivityFeed({ 
  activities, 
  onActivityAdd,
  maxHeight = '400px', 
  className, 
  showLiveIndicator = true 
}: LiveActivityFeedProps) {
  const [isLive, setIsLive] = useState(true);
  const [newCount, setNewCount] = useState(0);

  // Subscribe to real-time audit events
  useEffect(() => {
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_events' },
        (payload) => {
          const event = payload.new as {
            id: string;
            action: string;
            entity_type: string;
            entity_id: string;
            actor_id: string | null;
            metadata: Record<string, any> | null;
            created_at: string;
          };
          
          // Map audit event to activity
          const activityType = mapActionToType(event.action);
          if (activityType && onActivityAdd) {
            onActivityAdd({
              type: activityType,
              actorName: event.metadata?.actor_name || 'Sistema',
              targetId: event.entity_id,
              targetType: event.entity_type as 'alert' | 'occurrence',
              targetLabel: event.entity_id.substring(0, 8),
              metadata: event.metadata as any,
            });
          }
          setNewCount(prev => prev + 1);
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onActivityAdd]);

  // Clear new count when activities change
  useEffect(() => {
    const timer = setTimeout(() => setNewCount(0), 3000);
    return () => clearTimeout(timer);
  }, [activities.length]);

  if (activities.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Clock className="w-10 h-10 text-muted-foreground/50 mb-3" />
        </motion.div>
        <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
        <p className="text-xs text-muted-foreground/70 mt-1">As ações do time aparecerão aqui em tempo real</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Live indicator */}
      {showLiveIndicator && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isLive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                'w-2 h-2 rounded-full',
                isLive ? 'bg-status-ok' : 'bg-muted-foreground'
              )}
            />
            <span className="text-xs text-muted-foreground">
              {isLive ? 'Ao vivo' : 'Reconectando...'}
            </span>
          </div>
          
          <AnimatePresence>
            {newCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="secondary" className="text-xs gap-1">
                  <Radio className="w-3 h-3" />
                  +{newCount} nova{newCount > 1 ? 's' : ''}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <ScrollArea className="w-full" style={{ maxHeight }}>
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
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    delay: index * 0.02 
                  }}
                  className={cn(
                    'flex items-start gap-3 p-2.5 rounded-lg transition-colors group',
                    activity.isNew 
                      ? 'bg-primary/5 border border-primary/20' 
                      : 'hover:bg-muted/50'
                  )}
                >
                  {/* Animated Icon */}
                  <motion.div 
                    initial={activity.isNew ? { scale: 0 } : {}}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                      config.bgColor
                    )}
                  >
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </motion.div>

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
                      {activity.isNew && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: 3 }}
                          className="text-xs text-primary font-medium"
                        >
                          NOVO
                        </motion.span>
                      )}
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
    </div>
  );
}

function mapActionToType(action: string): LiveActivityType | null {
  const mapping: Record<string, LiveActivityType> = {
    'alert.created': 'alert_created',
    'alert.acknowledged': 'alert_acknowledged',
    'alert.assigned': 'alert_assigned',
    'alert.resolved': 'alert_resolved',
    'alert.escalated': 'alert_escalated',
    'occurrence.created': 'occurrence_created',
    'occurrence.updated': 'occurrence_updated',
    'occurrence.closed': 'occurrence_closed',
    'comment.added': 'comment_added',
  };
  return mapping[action] || null;
}
