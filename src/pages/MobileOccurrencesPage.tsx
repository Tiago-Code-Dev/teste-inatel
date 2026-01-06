import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { OfflineSyncChip, SyncStatus } from '@/components/shared/OfflineSyncChip';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  FileText,
  Clock,
  Truck,
  ChevronRight,
  Image,
  Mic,
  Video,
  CheckCircle2,
  Upload,
  CircleDot
} from 'lucide-react';

type OccurrenceStatus = 'pending_upload' | 'uploading' | 'open' | 'in_progress' | 'resolved' | 'closed';

interface Occurrence {
  id: string;
  machine_id: string;
  tire_id: string | null;
  status: OccurrenceStatus;
  description: string;
  is_offline_created: boolean;
  created_at: string;
  machines: {
    name: string;
  };
  media_attachments: {
    id: string;
    type: 'image' | 'audio' | 'video';
    upload_status: string;
  }[];
}

const statusConfig: Record<OccurrenceStatus, { label: string; className: string }> = {
  pending_upload: { label: 'Pendente de envio', className: 'bg-status-warning/15 text-status-warning' },
  uploading: { label: 'Enviando...', className: 'bg-blue-500/15 text-blue-500' },
  open: { label: 'Aberta', className: 'bg-primary/15 text-primary' },
  in_progress: { label: 'Em andamento', className: 'bg-blue-500/15 text-blue-500' },
  resolved: { label: 'Resolvida', className: 'bg-status-ok/15 text-status-ok' },
  closed: { label: 'Fechada', className: 'bg-muted text-muted-foreground' },
};

const mediaIcons = {
  image: Image,
  audio: Mic,
  video: Video,
};

const MobileOccurrencesPage = () => {
  const navigate = useNavigate();

  const { data: occurrences, isLoading, error, refetch } = useQuery({
    queryKey: ['occurrences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('occurrences')
        .select(`
          *,
          machines (name),
          media_attachments (id, type, upload_status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Occurrence[];
    },
  });

  const openCount = occurrences?.filter(o => 
    o.status === 'open' || o.status === 'in_progress' || o.status === 'pending_upload'
  ).length || 0;

  const getSyncStatus = (occ: Occurrence): SyncStatus => {
    if (occ.status === 'pending_upload') return 'pending';
    if (occ.status === 'uploading') return 'syncing';
    if (occ.media_attachments.some(m => m.upload_status === 'pending')) return 'pending';
    if (occ.media_attachments.some(m => m.upload_status === 'uploading')) return 'syncing';
    return 'synced';
  };

  if (isLoading) {
    return (
      <MobileLayout title="Ocorrências" showFAB fabHref="/occurrences/new">
        <StateDisplay state="loading" className="h-[60vh]" />
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Ocorrências" showFAB fabHref="/occurrences/new">
        <StateDisplay 
          state="error" 
          className="h-[60vh]"
          action={{ label: 'Tentar novamente', onClick: () => refetch() }}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      title="Ocorrências" 
      subtitle={`${openCount} em aberto`}
      showFAB 
      fabHref="/occurrences/new"
    >
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <FileText className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">{openCount} ocorrências em aberto</p>
          </div>
        </div>

        {/* Occurrences List */}
        {occurrences && occurrences.length > 0 ? (
          <div className="space-y-3">
            {occurrences.map((occurrence) => {
              const statusInfo = statusConfig[occurrence.status];
              const syncStatus = getSyncStatus(occurrence);
              const timeAgo = formatDistanceToNow(new Date(occurrence.created_at), {
                addSuffix: true,
                locale: ptBR,
              });

              return (
                <div
                  key={occurrence.id}
                  className="card-interactive p-4"
                  onClick={() => navigate(`/occurrences/${occurrence.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={cn('font-medium text-xs', statusInfo.className)}>
                            {statusInfo.label}
                          </Badge>
                          {syncStatus !== 'synced' && (
                            <OfflineSyncChip status={syncStatus} showLabel={false} />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-foreground line-clamp-2 mb-3">
                    {occurrence.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      {occurrence.machines?.name}
                    </span>
                    
                    {occurrence.media_attachments.length > 0 && (
                      <div className="flex items-center gap-1">
                        {occurrence.media_attachments.slice(0, 3).map((att) => {
                          const Icon = mediaIcons[att.type];
                          return (
                            <span 
                              key={att.id}
                              className={cn(
                                'flex items-center justify-center w-6 h-6 rounded',
                                att.upload_status === 'completed' 
                                  ? 'bg-status-ok/10 text-status-ok'
                                  : 'bg-status-warning/10 text-status-warning'
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                          );
                        })}
                        {occurrence.media_attachments.length > 3 && (
                          <span className="text-muted-foreground">
                            +{occurrence.media_attachments.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <StateDisplay
            state="empty"
            title="Nenhuma ocorrência"
            description="Registre uma nova ocorrência quando identificar um problema"
          />
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileOccurrencesPage;
