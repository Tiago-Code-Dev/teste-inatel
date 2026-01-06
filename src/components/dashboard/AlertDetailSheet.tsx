import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Clock,
  Truck,
  User,
  CheckCircle2,
  FileText,
  MessageSquare,
  CircleDot,
  UserPlus,
  Send,
  Loader2,
  History,
  Lightbulb,
  Wrench,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';

interface AlertAction {
  id: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  comment?: string;
}

interface AlertDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: {
    id: string;
    type: string;
    severity: AlertSeverity;
    status: AlertStatus;
    message: string;
    reason?: string | null;
    probable_cause?: string | null;
    recommended_action?: string | null;
    opened_at: string | Date;
    machine?: { name: string; model?: string } | null;
    tire?: { serial: string; position?: string | null } | null;
    assigned_to?: string | null;
    actions?: AlertAction[];
  } | null;
  onAssign?: (alertId: string) => void;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string, comment: string) => void;
  onCreateOccurrence?: (alertId: string) => void;
  onAddComment?: (alertId: string, comment: string) => void;
  loading?: boolean;
}

const severityConfig: Record<AlertSeverity, { 
  label: string; 
  bgClass: string; 
  textClass: string;
  iconClass: string;
}> = {
  low: {
    label: 'Baixa',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    iconClass: 'text-muted-foreground',
  },
  medium: {
    label: 'Média',
    bgClass: 'bg-status-warning/15',
    textClass: 'text-status-warning',
    iconClass: 'text-status-warning',
  },
  high: {
    label: 'Alta',
    bgClass: 'bg-orange-500/15',
    textClass: 'text-orange-500',
    iconClass: 'text-orange-500',
  },
  critical: {
    label: 'Crítica',
    bgClass: 'bg-status-critical/15',
    textClass: 'text-status-critical',
    iconClass: 'text-status-critical',
  },
};

const statusConfig: Record<AlertStatus, { label: string; className: string }> = {
  open: { label: 'Aberto', className: 'bg-status-critical/15 text-status-critical' },
  acknowledged: { label: 'Reconhecido', className: 'bg-status-warning/15 text-status-warning' },
  in_progress: { label: 'Em andamento', className: 'bg-blue-500/15 text-blue-500' },
  resolved: { label: 'Resolvido', className: 'bg-status-ok/15 text-status-ok' },
};

export function AlertDetailSheet({
  open,
  onOpenChange,
  alert,
  onAssign,
  onAcknowledge,
  onResolve,
  onCreateOccurrence,
  onAddComment,
  loading = false,
}: AlertDetailSheetProps) {
  const [comment, setComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  if (!alert) return null;

  const severity = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const openedAt = typeof alert.opened_at === 'string' ? new Date(alert.opened_at) : alert.opened_at;
  const timeAgo = formatDistanceToNow(openedAt, { addSuffix: true, locale: ptBR });
  const formattedDate = format(openedAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    onAddComment?.(alert.id, comment);
    setComment('');
    setIsAddingComment(false);
  };

  const handleResolve = () => {
    onResolve?.(alert.id, comment);
    setComment('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl', severity.bgClass)}>
              <AlertTriangle className={cn('w-6 h-6', severity.iconClass)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn('text-xs', status.className)}>{status.label}</Badge>
                <Badge variant="outline" className={cn('text-xs', severity.textClass)}>
                  {severity.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {alert.type}
              </p>
            </div>
          </div>
          <SheetTitle className="text-left text-lg">{alert.message}</SheetTitle>
          <SheetDescription className="text-left flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formattedDate} • {timeAgo}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-2">
          {/* Meta Information */}
          <div className="flex flex-wrap gap-3 p-3 rounded-xl bg-muted/50">
            {alert.machine?.name && (
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{alert.machine.name}</span>
                {alert.machine.model && (
                  <span className="text-muted-foreground">({alert.machine.model})</span>
                )}
              </div>
            )}
            {alert.tire?.serial && (
              <div className="flex items-center gap-2 text-sm">
                <CircleDot className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{alert.tire.serial}</span>
                {alert.tire.position && (
                  <span className="text-muted-foreground">Pos: {alert.tire.position}</span>
                )}
              </div>
            )}
            {alert.assigned_to && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{alert.assigned_to}</span>
              </div>
            )}
          </div>

          {/* Probable Cause */}
          {alert.probable_cause && (
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lightbulb className="w-4 h-4 text-status-warning" />
                Causa Provável
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {alert.probable_cause}
              </p>
            </div>
          )}

          {/* Recommended Action */}
          {alert.recommended_action && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Wrench className="w-4 h-4" />
                Ação Recomendada
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {alert.recommended_action}
              </p>
            </div>
          )}

          {/* Action History */}
          {alert.actions && alert.actions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <History className="w-4 h-4 text-muted-foreground" />
                Histórico de Ações
              </div>
              <div className="space-y-2">
                {alert.actions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{action.performedBy}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(action.timestamp, { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.action}</p>
                      {action.comment && (
                        <p className="text-sm text-foreground mt-1 italic">"{action.comment}"</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Add Comment Section */}
          <AnimatePresence>
            {isAddingComment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Adicionar Comentário
                </div>
                <Textarea
                  placeholder="Digite seu comentário..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingComment(false);
                      setComment('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!comment.trim() || loading}
                    className="flex-1 gap-1.5"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Enviar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-border">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-2">
              {alert.status === 'open' && !alert.assigned_to && onAssign && (
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => onAssign(alert.id)}
                  disabled={loading}
                >
                  <UserPlus className="w-4 h-4" />
                  Atribuir
                </Button>
              )}
              
              {alert.status === 'open' && onAcknowledge && (
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => onAcknowledge(alert.id)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Reconhecer
                </Button>
              )}

              {alert.status !== 'resolved' && onResolve && (
                <Button
                  variant="default"
                  className="gap-1.5 bg-status-ok hover:bg-status-ok/90"
                  onClick={handleResolve}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Resolver
                </Button>
              )}

              {alert.status !== 'resolved' && onCreateOccurrence && (
                <Button
                  variant="secondary"
                  className="gap-1.5"
                  onClick={() => onCreateOccurrence(alert.id)}
                  disabled={loading}
                >
                  <FileText className="w-4 h-4" />
                  Criar Ocorrência
                </Button>
              )}
            </div>

            {/* Secondary Actions */}
            {!isAddingComment && onAddComment && (
              <Button
                variant="ghost"
                className="w-full gap-1.5"
                onClick={() => setIsAddingComment(true)}
              >
                <MessageSquare className="w-4 h-4" />
                Adicionar Comentário
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
