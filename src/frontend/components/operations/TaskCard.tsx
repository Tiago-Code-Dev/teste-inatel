import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  User, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle,
  Truck,
  ChevronRight,
  Timer
} from 'lucide-react';
import { OperationTask, TaskStatus, TaskPriority, TaskType } from '@/types/operations';
import { formatDistanceToNow, differenceInMinutes, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: OperationTask;
  slaStatus: 'ok' | 'warning' | 'expired';
  onAssign: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onViewDetails: () => void;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  critical: { label: 'Crítico', className: 'bg-status-critical text-white' },
  high: { label: 'Alto', className: 'bg-status-warning text-status-warning-foreground' },
  medium: { label: 'Médio', className: 'bg-primary/20 text-primary' },
  low: { label: 'Baixo', className: 'bg-muted text-muted-foreground' }
};

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'Em Andamento', className: 'bg-primary text-primary-foreground' },
  paused: { label: 'Pausada', className: 'bg-status-warning text-status-warning-foreground' },
  completed: { label: 'Concluída', className: 'bg-status-success text-white' },
  cancelled: { label: 'Cancelada', className: 'bg-muted text-muted-foreground line-through' }
};

const typeLabels: Record<TaskType, string> = {
  preventive_maintenance: 'Manutenção Preventiva',
  corrective_maintenance: 'Manutenção Corretiva',
  telemetry_monitoring: 'Monitoramento de Telemetria',
  tire_change: 'Troca de Pneu',
  inspection: 'Inspeção',
  other: 'Outro'
};

export function TaskCard({ task, slaStatus, onAssign, onStatusChange, onViewDetails }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const minutesRemaining = differenceInMinutes(task.slaDueAt, new Date());

  const getSlaDisplay = () => {
    if (task.status === 'completed' || task.status === 'cancelled') {
      return null;
    }

    if (slaStatus === 'expired') {
      const overdue = Math.abs(minutesRemaining);
      const hours = Math.floor(overdue / 60);
      const mins = overdue % 60;
      return (
        <div className="flex items-center gap-1 text-status-critical">
          <Timer className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            Vencido há {hours > 0 ? `${hours}h ` : ''}{mins}min
          </span>
        </div>
      );
    }

    if (slaStatus === 'warning') {
      return (
        <div className="flex items-center gap-1 text-status-warning">
          <Timer className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{minutesRemaining}min restantes</span>
        </div>
      );
    }

    const hours = Math.floor(minutesRemaining / 60);
    const mins = minutesRemaining % 60;
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs">
          {hours > 0 ? `${hours}h ` : ''}{mins}min
        </span>
      </div>
    );
  };

  const getQuickAction = () => {
    if (!task.assignedTo && task.status !== 'completed' && task.status !== 'cancelled') {
      return (
        <Button size="sm" onClick={onAssign} className="gap-1.5">
          <User className="w-4 h-4" />
          Atribuir
        </Button>
      );
    }

    switch (task.status) {
      case 'pending':
        return (
          <Button size="sm" onClick={() => onStatusChange('in_progress')} className="gap-1.5">
            <Play className="w-4 h-4" />
            Iniciar
          </Button>
        );
      case 'in_progress':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onStatusChange('paused')}>
              <Pause className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => onStatusChange('completed')} className="gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Concluir
            </Button>
          </div>
        );
      case 'paused':
        return (
          <Button size="sm" onClick={() => onStatusChange('in_progress')} className="gap-1.5">
            <Play className="w-4 h-4" />
            Retomar
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-lg',
          slaStatus === 'expired' && 'border-status-critical/50 bg-status-critical/5',
          slaStatus === 'warning' && 'border-status-warning/50 bg-status-warning/5',
          task.priority === 'critical' && slaStatus === 'ok' && 'border-l-4 border-l-status-critical'
        )}
        onClick={onViewDetails}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn('text-xs', priority.className)}>
                  {priority.label}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', status.className)}>
                  {status.label}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground truncate">{task.name}</h3>
              <p className="text-xs text-muted-foreground">{typeLabels[task.type]}</p>
            </div>
            {getSlaDisplay()}
          </div>

          {/* Machine info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Truck className="w-4 h-4" />
            <span>{task.machineName}</span>
            {task.tireSerial && (
              <>
                <span className="text-border">•</span>
                <span>Pneu {task.tireSerial}</span>
              </>
            )}
          </div>

          {/* Progress bar (if in progress) */}
          {(task.status === 'in_progress' || task.status === 'paused') && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2" />
            </div>
          )}

          {/* Assignee and time */}
          <div className="flex items-center justify-between mb-3">
            {task.assignedTo ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {task.assignedToName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{task.assignedToName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-status-warning">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Sem responsável</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(task.createdAt, { addSuffix: true, locale: ptBR })}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
            {getQuickAction()}
            <Button variant="ghost" size="sm" onClick={onViewDetails} className="text-muted-foreground">
              Detalhes
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
