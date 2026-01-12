import { MachineStatus, AlertSeverity } from '@/types';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  WifiOff,
  AlertOctagon,
  Info
} from 'lucide-react';

interface StatusBadgeProps {
  status: MachineStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const statusConfig: Record<MachineStatus, {
  label: string;
  icon: typeof CheckCircle2;
  className: string;
}> = {
  operational: {
    label: 'Operacional',
    icon: CheckCircle2,
    className: 'status-badge-ok',
  },
  warning: {
    label: 'Atenção',
    icon: AlertTriangle,
    className: 'status-badge-warning',
  },
  critical: {
    label: 'Crítico',
    icon: XCircle,
    className: 'status-badge-critical',
  },
  offline: {
    label: 'Sem Sinal',
    icon: WifiOff,
    className: 'status-badge-offline',
  },
};

const sizeConfig = {
  sm: { badge: 'px-2 py-0.5 text-xs gap-1', icon: 'w-3 h-3' },
  md: { badge: 'px-2.5 py-1 text-sm gap-1.5', icon: 'w-4 h-4' },
  lg: { badge: 'px-3 py-1.5 text-sm gap-2', icon: 'w-5 h-5' },
};

export function StatusBadge({ status, showLabel = true, size = 'md', pulse = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      config.className,
      sizes.badge,
      pulse && status === 'critical' && 'pulse-critical'
    )}>
      <Icon className={cn(sizes.icon, pulse && status === 'critical' && 'pulse-dot')} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

// Severity Badge
interface SeverityBadgeProps {
  severity: AlertSeverity;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const severityConfig: Record<AlertSeverity, {
  label: string;
  icon: typeof Info;
  className: string;
}> = {
  low: {
    label: 'Baixa',
    icon: Info,
    className: 'bg-muted text-muted-foreground border border-border',
  },
  medium: {
    label: 'Média',
    icon: AlertTriangle,
    className: 'status-badge-warning',
  },
  high: {
    label: 'Alta',
    icon: AlertOctagon,
    className: 'bg-orange-500/15 text-orange-500 border border-orange-500/30',
  },
  critical: {
    label: 'Crítica',
    icon: XCircle,
    className: 'status-badge-critical',
  },
};

export function SeverityBadge({ severity, showLabel = true, size = 'md' }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      config.className,
      sizes.badge,
    )}>
      <Icon className={sizes.icon} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
