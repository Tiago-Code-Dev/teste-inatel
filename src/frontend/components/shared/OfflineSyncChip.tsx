import { cn } from '@/lib/utils';
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export type SyncStatus = 'offline' | 'pending' | 'syncing' | 'synced';

interface OfflineSyncChipProps {
  status: SyncStatus;
  className?: string;
  showLabel?: boolean;
}

const statusConfig: Record<SyncStatus, {
  label: string;
  icon: typeof Cloud;
  className: string;
}> = {
  offline: {
    label: 'Offline',
    icon: CloudOff,
    className: 'bg-status-offline/15 text-status-offline border-status-offline/30',
  },
  pending: {
    label: 'Pendente',
    icon: Cloud,
    className: 'bg-status-warning/15 text-status-warning border-status-warning/30',
  },
  syncing: {
    label: 'Sincronizando',
    icon: RefreshCw,
    className: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  },
  synced: {
    label: 'Sincronizado',
    icon: CheckCircle2,
    className: 'bg-status-ok/15 text-status-ok border-status-ok/30',
  },
};

export function OfflineSyncChip({ status, className, showLabel = true }: OfflineSyncChipProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      config.className,
      className
    )}>
      <Icon className={cn(
        'w-3.5 h-3.5',
        status === 'syncing' && 'animate-spin'
      )} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
