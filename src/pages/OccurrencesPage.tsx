import { MainLayout } from '@/components/layout/MainLayout';
import { occurrences } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Clock, 
  Truck, 
  CircleDot,
  Image,
  Mic,
  Video,
  ChevronRight,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { OccurrenceStatus, MediaType } from '@/types';

const statusConfig: Record<OccurrenceStatus, { label: string; className: string }> = {
  pending_upload: { label: 'Pendente de envio', className: 'bg-status-warning/15 text-status-warning' },
  uploading: { label: 'Enviando...', className: 'bg-blue-500/15 text-blue-500' },
  open: { label: 'Aberta', className: 'bg-primary/15 text-primary' },
  in_progress: { label: 'Em andamento', className: 'bg-blue-500/15 text-blue-500' },
  resolved: { label: 'Resolvida', className: 'bg-status-ok/15 text-status-ok' },
  closed: { label: 'Fechada', className: 'bg-muted text-muted-foreground' },
};

const mediaIcons: Record<MediaType, typeof Image> = {
  image: Image,
  audio: Mic,
  video: Video,
};

const OccurrencesPage = () => {
  const navigate = useNavigate();
  
  const sortedOccurrences = [...occurrences].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const openCount = occurrences.filter(o => o.status === 'open' || o.status === 'in_progress').length;

  return (
    <MainLayout 
      title="Ocorrências" 
      subtitle={`${openCount} ocorrências em aberto`}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{openCount} Em aberto</span>
          </div>
        </div>
        <Button className="gap-2" onClick={() => navigate('/occurrences/new')}>
          <Plus className="w-4 h-4" />
          Nova Ocorrência
        </Button>
      </div>

      {/* Occurrences List */}
      <div className="space-y-4">
        {sortedOccurrences.map((occurrence) => {
          const statusInfo = statusConfig[occurrence.status];
          const timeAgo = formatDistanceToNow(occurrence.createdAt, {
            addSuffix: true,
            locale: ptBR,
          });

          return (
            <div 
              key={occurrence.id}
              className="card-interactive p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('font-medium', statusInfo.className)}>
                        {statusInfo.label}
                      </Badge>
                      {occurrence.status === 'pending_upload' && (
                        <Upload className="w-4 h-4 text-status-warning animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Description */}
              <p className="text-foreground mb-4 line-clamp-2">
                {occurrence.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  {occurrence.machineName}
                </span>
                {occurrence.tireId && (
                  <span className="inline-flex items-center gap-1.5">
                    <CircleDot className="w-4 h-4" />
                    Pneu vinculado
                  </span>
                )}
                {occurrence.attachments.length > 0 && (
                  <span className="inline-flex items-center gap-2">
                    {occurrence.attachments.map((att) => {
                      const Icon = mediaIcons[att.type];
                      return (
                        <span 
                          key={att.id} 
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-md',
                            att.uploadStatus === 'completed' 
                              ? 'bg-status-ok/10 text-status-ok'
                              : att.uploadStatus === 'uploading'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-status-warning/10 text-status-warning'
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {att.uploadStatus === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <span className="text-xs">
                              {att.uploadStatus === 'uploading' ? 'Enviando...' : 'Pendente'}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {sortedOccurrences.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-status-ok" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Nenhuma ocorrência registrada
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Registre uma nova ocorrência quando identificar um problema
            </p>
            <Button className="gap-2" onClick={() => navigate('/occurrences/new')}>
              <Plus className="w-4 h-4" />
              Nova Ocorrência
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OccurrencesPage;
