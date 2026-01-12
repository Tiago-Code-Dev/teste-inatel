import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Camera, 
  Mic, 
  Video, 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';

export type MediaType = 'image' | 'audio' | 'video';
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export interface MediaItem {
  id: string;
  file: File;
  type: MediaType;
  previewUrl: string;
  status: UploadStatus;
  progress?: number;
}

interface MediaUploaderProps {
  items: MediaItem[];
  onAdd: (files: File[], type: MediaType) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

const mediaIcons: Record<MediaType, typeof Camera> = {
  image: Camera,
  audio: Mic,
  video: Video,
};

export function MediaUploader({ 
  items, 
  onAdd, 
  onRemove, 
  onRetry,
  disabled,
  className 
}: MediaUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAdd(Array.from(files), type);
    }
    e.target.value = '';
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'pending':
        return <Upload className="w-4 h-4 text-status-warning" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-status-ok" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-status-critical" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
          className="flex-1 gap-2"
        >
          <Camera className="w-4 h-4" />
          Foto
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => audioInputRef.current?.click()}
          disabled={disabled}
          className="flex-1 gap-2"
        >
          <Mic className="w-4 h-4" />
          Áudio
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          disabled={disabled}
          className="flex-1 gap-2"
        >
          <Video className="w-4 h-4" />
          Vídeo
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, 'image')}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        capture="user"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'audio')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'video')}
      />

      {/* Media Items Preview */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const Icon = mediaIcons[item.type];
            
            return (
              <div 
                key={item.id} 
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden border',
                  item.status === 'failed' && 'border-status-critical',
                  item.status === 'completed' && 'border-status-ok',
                  item.status === 'uploading' && 'border-blue-500',
                  item.status === 'pending' && 'border-status-warning'
                )}
              >
                {item.type === 'image' ? (
                  <img 
                    src={item.previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status Overlay */}
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {item.status === 'failed' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onRetry(item.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemove(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-1 right-1">
                  {getStatusIcon(item.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Summary */}
      {items.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{items.length} arquivo(s)</span>
          <div className="flex items-center gap-2">
            {items.some(i => i.status === 'pending') && (
              <span className="flex items-center gap-1 text-status-warning">
                <Upload className="w-3 h-3" />
                Pendente
              </span>
            )}
            {items.some(i => i.status === 'uploading') && (
              <span className="flex items-center gap-1 text-blue-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Enviando
              </span>
            )}
            {items.every(i => i.status === 'completed') && (
              <span className="flex items-center gap-1 text-status-ok">
                <CheckCircle2 className="w-3 h-3" />
                Concluído
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
