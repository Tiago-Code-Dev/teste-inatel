import { TimelineEvent, AlertSeverity } from '@/types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  FileText, 
  Wrench, 
  CirclePlus, 
  CircleMinus,
  Bell,
  Gauge,
  Info,
  Calendar,
  Clock,
  Share2,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  UserPlus,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EventDetailSheetProps {
  event: TimelineEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateOccurrence?: (event: TimelineEvent) => void;
  onAssignUser?: (event: TimelineEvent) => void;
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

const severityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Média', color: 'bg-status-warning/15 text-status-warning' },
  high: { label: 'Alta', color: 'bg-status-warning/20 text-status-warning' },
  critical: { label: 'Crítica', color: 'bg-status-critical/15 text-status-critical' },
};

export function EventDetailSheet({ 
  event, 
  open, 
  onOpenChange,
  onCreateOccurrence,
  onAssignUser
}: EventDetailSheetProps) {
  const [copied, setCopied] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  // Mutation to resolve an alert
  const resolveAlertMutation = useMutation({
    mutationFn: async ({ alertId, resolution }: { alertId: string; resolution: string }) => {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          status: 'resolved',
          reason: resolution,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alerta resolvido com sucesso');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erro ao resolver alerta');
    },
  });

  if (!event) return null;

  // Determine the actual event type for display
  const displayType: EventType = event.id.startsWith('telemetry-') ? 'telemetry_critical' : event.type;
  const config = eventConfig[displayType] || eventConfig.info;
  const Icon = config.icon;
  const isRecent = differenceInHours(new Date(), new Date(event.timestamp)) < 24;
  const canCreateOccurrence = event.type === 'alert' || event.id.startsWith('telemetry-');
  const canResolve = event.type === 'alert' && event.id.startsWith('alert-');
  const alertId = event.id.startsWith('alert-') ? event.id.replace('alert-', '') : null;

  const handleShare = async () => {
    const shareData = {
      title: `Evento: ${event.title}`,
      text: `${config.label} - ${event.description}\n\n${format(new Date(event.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copiado para a área de transferência');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Não foi possível compartilhar');
      }
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(event.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('ID copiado');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  const handleResolve = () => {
    if (!alertId) return;
    const resolution = comment.trim() || 'Resolvido pelo usuário';
    resolveAlertMutation.mutate({ alertId, resolution });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-auto max-h-[90vh] rounded-t-2xl overflow-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <SheetHeader className="text-left pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div 
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
                    config.bgColor
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Icon className={cn('w-6 h-6', config.color)} />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className={cn('text-xs', config.color)}>
                      {config.label}
                    </Badge>
                    {event.severity && (
                      <Badge className={cn('text-xs', severityConfig[event.severity].color)}>
                        {severityConfig[event.severity].label}
                      </Badge>
                    )}
                    {isRecent && (
                      <Badge className="text-xs bg-primary/10 text-primary">
                        Recente
                      </Badge>
                    )}
                  </div>
                  <SheetTitle className="text-lg leading-tight">
                    {event.title}
                  </SheetTitle>
                </div>
              </div>
            </div>
          </SheetHeader>

          <Separator className="my-4" />

          {/* Event Details */}
          <div className="space-y-4">
            {/* Description */}
            <motion.div 
              className="p-4 rounded-xl bg-muted/50 border border-border"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-sm text-foreground leading-relaxed">
                {event.description}
              </p>
            </motion.div>

            {/* Timestamp Details */}
            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(event.timestamp), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Horário</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(event.timestamp), 'HH:mm:ss', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Relative Time */}
            <p className="text-xs text-muted-foreground text-center">
              {formatDistanceToNow(new Date(event.timestamp), { locale: ptBR, addSuffix: true })}
            </p>

            {/* Comment Input for Resolution */}
            <AnimatePresence>
              {showCommentInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    Comentário de resolução (opcional)
                  </div>
                  <Textarea
                    placeholder="Descreva a ação realizada para resolver este evento..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Event ID */}
            <button 
              onClick={handleCopyId}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">ID do evento:</span>
                <code className="text-xs font-mono text-foreground truncate max-w-[180px]">
                  {event.id}
                </code>
              </div>
              {copied ? (
                <Check className="w-4 h-4 text-status-ok" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
          </div>

          <Separator className="my-4" />

          {/* Actions */}
          <motion.div 
            className="flex flex-col gap-3 pb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Resolve Alert Button */}
            {canResolve && !showCommentInput && (
              <Button 
                className="w-full gap-2"
                variant="default"
                onClick={() => setShowCommentInput(true)}
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como resolvido
              </Button>
            )}

            {/* Confirm Resolution */}
            {showCommentInput && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowCommentInput(false);
                    setComment('');
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={handleResolve}
                  disabled={resolveAlertMutation.isPending}
                >
                  {resolveAlertMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirmar
                </Button>
              </div>
            )}

            {/* Create Occurrence */}
            {canCreateOccurrence && onCreateOccurrence && !showCommentInput && (
              <Button 
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  onCreateOccurrence(event);
                  onOpenChange(false);
                }}
              >
                <Plus className="w-4 h-4" />
                Criar ocorrência relacionada
              </Button>
            )}

            {/* Assign User */}
            {onAssignUser && !showCommentInput && (
              <Button 
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  onAssignUser(event);
                  onOpenChange(false);
                }}
              >
                <UserPlus className="w-4 h-4" />
                Atribuir responsável
              </Button>
            )}
            
            {!showCommentInput && (
              <Button 
                variant="ghost" 
                className="w-full gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Compartilhar evento
              </Button>
            )}
          </motion.div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
