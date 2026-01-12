import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MediaUploader, MediaItem, MediaType } from '@/components/shared/MediaUploader';
import { OfflineSyncChip, SyncStatus } from '@/components/shared/OfflineSyncChip';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Loader2, CheckCircle2, Truck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function NewOccurrencePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  
  const machineId = searchParams.get('machineId');
  const alertId = searchParams.get('alertId');
  
  const [description, setDescription] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  const handleAddMedia = useCallback((files: File[], type: MediaType) => {
    const newItems: MediaItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      type,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
  }, []);

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleRetryMedia = useCallback((id: string) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'pending' } : item
      )
    );
  }, []);

  const uploadMedia = async (occurrenceId: string, item: MediaItem): Promise<string | null> => {
    try {
      const fileExt = item.file.name.split('.').pop();
      const fileName = `${occurrenceId}/${item.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media-attachments')
        .upload(fileName, item.file);

      if (uploadError) throw uploadError;

      // Use signed URL (4 hour expiration) instead of public URL for security
      const { data, error: signedUrlError } = await supabase.storage
        .from('media-attachments')
        .createSignedUrl(fileName, 14400); // 4 hours

      if (signedUrlError) throw signedUrlError;

      return data.signedUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Descrição obrigatória', {
        description: 'Por favor, descreva o problema encontrado.',
      });
      return;
    }

    if (!user) {
      toast.error('Não autenticado');
      return;
    }

    setSubmitting(true);
    setSyncStatus(isOnline ? 'syncing' : 'pending');

    try {
      // Create occurrence
      const { data: occurrence, error: occError } = await supabase
        .from('occurrences')
        .insert({
          machine_id: machineId || '11111111-1111-1111-1111-111111111111',
          alert_id: alertId || null,
          created_by: user.id,
          description: description.trim(),
          status: isOnline ? 'open' : 'pending_upload',
          is_offline_created: !isOnline,
        })
        .select()
        .single();

      if (occError) throw occError;

      // Upload media files
      if (mediaItems.length > 0 && isOnline) {
        for (const item of mediaItems) {
          setMediaItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i))
          );

          const url = await uploadMedia(occurrence.id, item);

          if (url) {
            await supabase.from('media_attachments').insert({
              occurrence_id: occurrence.id,
              type: item.type,
              file_path: `${occurrence.id}/${item.id}`,
              file_url: url,
              size: item.file.size,
              upload_status: 'completed',
            });

            setMediaItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, status: 'completed' } : i))
            );
          } else {
            setMediaItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, status: 'failed' } : i))
            );
          }
        }
      }

      setSyncStatus('synced');
      toast.success('Ocorrência registrada!', {
        description: isOnline 
          ? 'A ocorrência foi enviada com sucesso.'
          : 'A ocorrência será sincronizada quando você estiver online.',
      });
      navigate('/occurrences');
    } catch (error) {
      console.error('Error creating occurrence:', error);
      setSyncStatus('offline');
      toast.error('Erro ao salvar', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileLayout title="Nova Ocorrência" showBackButton>
      <div className="p-4 space-y-6">
        {/* Status Chip */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Registrar Problema</h2>
          <OfflineSyncChip status={syncStatus} />
        </div>

        {/* Machine Context */}
        {machineId && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <Truck className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground">Máquina vinculada</span>
          </div>
        )}

        {/* Alert Context */}
        {alertId && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-status-warning/10 border border-status-warning/30">
            <AlertTriangle className="w-5 h-5 text-status-warning" />
            <span className="text-sm text-status-warning">Vinculado a um alerta</span>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Descrição do problema <span className="text-status-critical">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva o problema encontrado de forma clara e objetiva..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={cn(
              'resize-none',
              !description.trim() && 'border-status-warning/50'
            )}
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/500 caracteres
          </p>
        </div>

        {/* Media Uploader */}
        <div className="space-y-2">
          <Label>Evidências (opcional)</Label>
          <MediaUploader
            items={mediaItems}
            onAdd={handleAddMedia}
            onRemove={handleRemoveMedia}
            onRetry={handleRetryMedia}
            disabled={submitting}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full gap-2"
          disabled={submitting || !description.trim()}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isOnline ? 'Enviando...' : 'Salvando localmente...'}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {isOnline ? 'Enviar Ocorrência' : 'Salvar Offline'}
            </>
          )}
        </Button>

        {/* Offline Notice */}
        {!isOnline && (
          <p className="text-xs text-center text-muted-foreground">
            A ocorrência será sincronizada automaticamente quando você estiver online.
          </p>
        )}
      </div>
    </MobileLayout>
  );
}
