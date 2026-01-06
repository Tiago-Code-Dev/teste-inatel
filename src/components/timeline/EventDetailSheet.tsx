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
  ExternalLink,
  Share2,
  Plus,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EventDetailSheetProps {
  event: TimelineEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateOccurrence?: (event: TimelineEvent) => void;
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
  onCreateOccurrence 
}: EventDetailSheetProps) {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const config = eventConfig[event.type] || eventConfig.info;
  const Icon = config.icon;
  const isRecent = differenceInHours(new Date(), new Date(event.timestamp)) < 24;
  const canCreateOccurrence = event.type === 'alert' || event.id.startsWith('telemetry-');

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-auto max-h-[85vh] rounded-t-2xl overflow-auto"
      >
        <SheetHeader className="text-left pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
                config.bgColor
              )}>
                <Icon className={cn('w-6 h-6', config.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn('text-xs', config.color)}>
                    {config.label}
                  </Badge>
                  {event.severity && (
                    <Badge className={cn('text-xs', severityConfig[event.severity].color)}>
                      {severityConfig[event.severity].label}
                    </Badge>
                  )}
                  {isRecent && (
                    <Badge className="text-xs bg-primary/10 text-primary animate-pulse">
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
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-sm text-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Timestamp Details */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Relative Time */}
          <p className="text-xs text-muted-foreground text-center">
            {formatDistanceToNow(new Date(event.timestamp), { locale: ptBR, addSuffix: true })}
          </p>

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
        <div className="flex flex-col gap-3 pb-4">
          {canCreateOccurrence && onCreateOccurrence && (
            <Button 
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
          
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Compartilhar evento
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
