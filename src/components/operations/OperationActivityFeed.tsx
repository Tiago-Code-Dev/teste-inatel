import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserPlus, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Plus,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { ActivityLogEntry } from '@/types/operations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface OperationActivityFeedProps {
  entries: ActivityLogEntry[];
  maxHeight?: number;
}

const actionConfig: Record<ActivityLogEntry['action'], { icon: React.ComponentType<any>; color: string; label: string }> = {
  created: { icon: Plus, color: 'text-primary', label: 'Criou' },
  assigned: { icon: UserPlus, color: 'text-status-success', label: 'Atribuiu' },
  started: { icon: Play, color: 'text-primary', label: 'Iniciou' },
  paused: { icon: Pause, color: 'text-status-warning', label: 'Pausou' },
  resumed: { icon: RotateCcw, color: 'text-primary', label: 'Retomou' },
  completed: { icon: CheckCircle, color: 'text-status-success', label: 'Concluiu' },
  cancelled: { icon: XCircle, color: 'text-status-critical', label: 'Cancelou' },
  note_added: { icon: MessageSquare, color: 'text-muted-foreground', label: 'Comentou' }
};

export function OperationActivityFeed({ entries, maxHeight = 400 }: OperationActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Nenhuma atividade recente</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />

        <div className="space-y-4">
          {entries.map((entry, index) => {
            const config = actionConfig[entry.action];
            const ActionIcon = config.icon;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-3"
              >
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border ${config.color}`}>
                  <ActionIcon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.employeeName && (
                          <span className="font-medium text-foreground">
                            {entry.employeeName}
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {entry.taskName}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(entry.timestamp, { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
