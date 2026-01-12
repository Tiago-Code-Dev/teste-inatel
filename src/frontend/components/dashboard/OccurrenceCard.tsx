import { cn } from '@/lib/utils';
import { 
  FileText,
  Clock,
  Truck,
  User,
  ChevronRight,
  Image,
  Mic,
  Video,
  MessageSquare,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type OccurrenceStatus = 'pending_upload' | 'uploading' | 'open' | 'in_progress' | 'resolved' | 'closed';
type MediaType = 'image' | 'audio' | 'video';

interface OccurrenceCardProps {
  occurrence: {
    id: string;
    status: OccurrenceStatus;
    description: string;
    created_at: string | Date;
    machine?: { name: string } | null;
    assigned_to?: string | null;
    media_count?: number;
    media_types?: MediaType[];
    is_offline_created?: boolean;
  };
  onAssign?: (occurrenceId: string) => void;
  onClose?: (occurrenceId: string) => void;
  onAddComment?: (occurrenceId: string) => void;
  onViewDetails?: (occurrenceId: string) => void;
  compact?: boolean;
  loading?: boolean;
}

const statusConfig: Record<OccurrenceStatus, { label: string; className: string; icon: typeof FileText }> = {
  pending_upload: { 
    label: 'Pendente de envio', 
    className: 'bg-status-warning/15 text-status-warning',
    icon: Upload,
  },
  uploading: { 
    label: 'Enviando...', 
    className: 'bg-blue-500/15 text-blue-500 animate-pulse',
    icon: Upload,
  },
  open: { 
    label: 'Aberta', 
    className: 'bg-primary/15 text-primary',
    icon: FileText,
  },
  in_progress: { 
    label: 'Em andamento', 
    className: 'bg-blue-500/15 text-blue-500',
    icon: FileText,
  },
  resolved: { 
    label: 'Resolvida', 
    className: 'bg-status-ok/15 text-status-ok',
    icon: CheckCircle2,
  },
  closed: { 
    label: 'Fechada', 
    className: 'bg-muted text-muted-foreground',
    icon: CheckCircle2,
  },
};

const mediaIcons: Record<MediaType, typeof Image> = {
  image: Image,
  audio: Mic,
  video: Video,
};

export function OccurrenceCard({
  occurrence,
  onAssign,
  onClose,
  onAddComment,
  onViewDetails,
  compact = false,
  loading = false,
}: OccurrenceCardProps) {
  const config = statusConfig[occurrence.status];
  const StatusIcon = config.icon;
  const timeAgo = formatDistanceToNow(
    typeof occurrence.created_at === 'string' ? new Date(occurrence.created_at) : occurrence.created_at,
    { addSuffix: true, locale: ptBR }
  );

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
          'hover:bg-muted/50 cursor-pointer group'
        )}
        onClick={() => onViewDetails?.(occurrence.id)}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
          <StatusIcon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{occurrence.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {occurrence.machine?.name && (
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                {occurrence.machine.name}
              </span>
            )}
            <span>{timeAgo}</span>
          </div>
        </div>
        <Badge className={cn('text-xs shrink-0', config.className)}>{config.label}</Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
            <StatusIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-xs', config.className)}>{config.label}</Badge>
              {occurrence.is_offline_created && (
                <Badge variant="outline" className="text-xs">
                  Offline
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </p>
          </div>
        </div>
        {occurrence.assigned_to && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <User className="w-3 h-3" />
            {occurrence.assigned_to}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-foreground mb-3 line-clamp-2">{occurrence.description}</p>

      {/* Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {occurrence.machine?.name && (
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              {occurrence.machine.name}
            </span>
          )}
        </div>

        {occurrence.media_types && occurrence.media_types.length > 0 && (
          <div className="flex items-center gap-1">
            {occurrence.media_types.slice(0, 3).map((type, idx) => {
              const Icon = mediaIcons[type];
              return (
                <span 
                  key={idx}
                  className="flex items-center justify-center w-6 h-6 rounded bg-muted"
                >
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </span>
              );
            })}
            {(occurrence.media_count || 0) > 3 && (
              <span className="text-xs text-muted-foreground">
                +{(occurrence.media_count || 0) - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Button
          variant="default"
          size="sm"
          className="flex-1 sm:flex-none gap-1.5"
          onClick={() => onViewDetails?.(occurrence.id)}
          disabled={loading}
        >
          Ver detalhes
          <ChevronRight className="w-4 h-4" />
        </Button>

        {(occurrence.status === 'open' || occurrence.status === 'in_progress') && (
          <>
            {!occurrence.assigned_to && onAssign && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onAssign(occurrence.id)}
                disabled={loading}
              >
                <User className="w-4 h-4" />
                Atribuir
              </Button>
            )}
            {onAddComment && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => onAddComment(occurrence.id)}
                disabled={loading}
              >
                <MessageSquare className="w-4 h-4" />
                Comentar
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-status-ok hover:text-status-ok"
                onClick={() => onClose(occurrence.id)}
                disabled={loading}
              >
                <CheckCircle2 className="w-4 h-4" />
                Fechar
              </Button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
