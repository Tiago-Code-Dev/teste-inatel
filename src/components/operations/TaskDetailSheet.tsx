import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Truck, 
  CircleDot, 
  User,
  Play,
  Pause,
  CheckCircle,
  Timer,
  AlertTriangle,
  FileText,
  Calendar
} from 'lucide-react';
import { OperationTask, TaskStatus, TaskPriority, TaskType } from '@/types/operations';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TaskProgressBar } from './TaskProgressBar';

interface TaskDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: OperationTask | null;
  slaStatus: 'ok' | 'warning' | 'expired';
  onStatusChange: (taskId: string, status: TaskStatus, notes?: string) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onAssign: () => void;
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
  cancelled: { label: 'Cancelada', className: 'bg-muted text-muted-foreground' }
};

const typeLabels: Record<TaskType, string> = {
  preventive_maintenance: 'Manutenção Preventiva',
  corrective_maintenance: 'Manutenção Corretiva',
  telemetry_monitoring: 'Monitoramento de Telemetria',
  tire_change: 'Troca de Pneu',
  inspection: 'Inspeção',
  other: 'Outro'
};

export function TaskDetailSheet({ 
  open, 
  onOpenChange, 
  task, 
  slaStatus,
  onStatusChange,
  onProgressChange,
  onAssign
}: TaskDetailSheetProps) {
  const [notes, setNotes] = useState('');
  const [localProgress, setLocalProgress] = useState(task?.progress || 0);

  if (!task) return null;

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const minutesRemaining = differenceInMinutes(task.slaDueAt, new Date());

  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(task.id, newStatus, notes || undefined);
    if (newStatus === 'completed') {
      setNotes('');
    }
  };

  const handleProgressUpdate = () => {
    onProgressChange(task.id, localProgress);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn('text-xs', priority.className)}>
              {priority.label}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', status.className)}>
              {status.label}
            </Badge>
          </div>
          <SheetTitle className="text-xl">{task.name}</SheetTitle>
          <p className="text-sm text-muted-foreground">{typeLabels[task.type]}</p>
        </SheetHeader>

        <div className="space-y-6">
          {/* SLA Status */}
          <div className={cn(
            'p-4 rounded-lg',
            slaStatus === 'expired' && 'bg-status-critical/10 border border-status-critical/30',
            slaStatus === 'warning' && 'bg-status-warning/10 border border-status-warning/30',
            slaStatus === 'ok' && 'bg-muted'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className={cn(
                'w-5 h-5',
                slaStatus === 'expired' && 'text-status-critical',
                slaStatus === 'warning' && 'text-status-warning',
                slaStatus === 'ok' && 'text-muted-foreground'
              )} />
              <span className="font-medium">SLA</span>
            </div>
            {task.status === 'completed' ? (
              <p className="text-sm text-status-success">Concluído dentro do prazo</p>
            ) : slaStatus === 'expired' ? (
              <p className="text-sm text-status-critical">
                Vencido há {Math.abs(minutesRemaining)} minutos
              </p>
            ) : (
              <p className={cn(
                'text-sm',
                slaStatus === 'warning' ? 'text-status-warning' : 'text-muted-foreground'
              )}>
                {Math.floor(minutesRemaining / 60)}h {minutesRemaining % 60}min restantes
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Prazo: {format(task.slaDueAt, "dd/MM 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>

          {/* Machine & Tire */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{task.machineName}</p>
                <p className="text-xs text-muted-foreground">Máquina</p>
              </div>
            </div>
            {task.tireSerial && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <CircleDot className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{task.tireSerial}</p>
                  <p className="text-xs text-muted-foreground">Pneu</p>
                </div>
              </div>
            )}
          </div>

          {/* Assignee */}
          <div>
            <h4 className="font-medium mb-3">Responsável</h4>
            {task.assignedTo ? (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {task.assignedToName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.assignedToName}</p>
                  <p className="text-xs text-muted-foreground">Atribuído</p>
                </div>
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <Button variant="outline" size="sm" onClick={onAssign}>
                    Alterar
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-status-warning/10 border border-status-warning/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-status-warning" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-status-warning">Sem responsável</p>
                </div>
                <Button size="sm" onClick={onAssign}>
                  <User className="w-4 h-4 mr-1" />
                  Atribuir
                </Button>
              </div>
            )}
          </div>

          {/* Progress (if applicable) */}
          {(task.status === 'in_progress' || task.status === 'paused') && (
            <div>
              <h4 className="font-medium mb-3">Progresso</h4>
              <TaskProgressBar progress={task.progress} status={task.status} size="lg" />
              <div className="mt-4">
                <Slider
                  value={[localProgress]}
                  onValueChange={(v) => setLocalProgress(v[0])}
                  max={100}
                  step={5}
                  className="mb-2"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleProgressUpdate}
                  disabled={localProgress === task.progress}
                  className="w-full"
                >
                  Atualizar Progresso para {localProgress}%
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Descrição</h4>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>

          {/* Notes */}
          {task.notes && (
            <div>
              <h4 className="font-medium mb-2">Notas</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {task.notes}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="font-medium mb-3">Histórico</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Criada {formatDistanceToNow(task.createdAt, { addSuffix: true, locale: ptBR })}</span>
              </div>
              {task.startedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Play className="w-4 h-4" />
                  <span>Iniciada {formatDistanceToNow(task.startedAt, { addSuffix: true, locale: ptBR })}</span>
                </div>
              )}
              {task.completedAt && (
                <div className="flex items-center gap-2 text-status-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>Concluída {formatDistanceToNow(task.completedAt, { addSuffix: true, locale: ptBR })}</span>
                  {task.actualDuration && (
                    <span className="text-muted-foreground">
                      ({Math.floor(task.actualDuration / 60)}h {task.actualDuration % 60}min)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Add Notes (for completing) */}
          {task.status !== 'completed' && task.status !== 'cancelled' && (
            <div>
              <h4 className="font-medium mb-2">Adicionar Nota</h4>
              <Textarea
                placeholder="Adicione observações sobre a tarefa..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4">
            {task.status === 'pending' && task.assignedTo && (
              <Button onClick={() => handleStatusChange('in_progress')} className="w-full gap-2">
                <Play className="w-4 h-4" />
                Iniciar Tarefa
              </Button>
            )}
            {task.status === 'in_progress' && (
              <>
                <Button onClick={() => handleStatusChange('completed')} className="w-full gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Concluir Tarefa
                </Button>
                <Button variant="outline" onClick={() => handleStatusChange('paused')} className="w-full gap-2">
                  <Pause className="w-4 h-4" />
                  Pausar Tarefa
                </Button>
              </>
            )}
            {task.status === 'paused' && (
              <Button onClick={() => handleStatusChange('in_progress')} className="w-full gap-2">
                <Play className="w-4 h-4" />
                Retomar Tarefa
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
