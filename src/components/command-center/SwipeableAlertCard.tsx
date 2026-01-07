import { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Clock, 
  Truck, 
  User, 
  CheckCircle2,
  FileText,
  CircleDot,
  UserPlus,
  ArrowUpRight,
  Timer
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { SlaIndicator } from './SlaIndicator';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';

export interface SwipeableAlert {
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
  sla_due_at?: string | null;
}

interface SwipeableAlertCardProps {
  alert: SwipeableAlert;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onEscalate?: (alertId: string) => void;
  onAssign?: (alertId: string) => void;
  onViewDetails?: (alertId: string) => void;
  loading?: boolean;
}

const severityConfig: Record<AlertSeverity, { 
  label: string; 
  bgClass: string; 
  textClass: string;
  iconClass: string;
  glowClass: string;
}> = {
  low: {
    label: 'Baixa',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    iconClass: 'text-muted-foreground',
    glowClass: '',
  },
  medium: {
    label: 'Média',
    bgClass: 'bg-status-warning/15',
    textClass: 'text-status-warning',
    iconClass: 'text-status-warning',
    glowClass: '',
  },
  high: {
    label: 'Alta',
    bgClass: 'bg-orange-500/15',
    textClass: 'text-orange-500',
    iconClass: 'text-orange-500',
    glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
  },
  critical: {
    label: 'Crítica',
    bgClass: 'bg-status-critical/15',
    textClass: 'text-status-critical',
    iconClass: 'text-status-critical',
    glowClass: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
  },
};

const statusConfig: Record<AlertStatus, { label: string; className: string }> = {
  open: { label: 'Aberto', className: 'bg-status-critical/15 text-status-critical' },
  acknowledged: { label: 'Reconhecido', className: 'bg-status-warning/15 text-status-warning' },
  in_progress: { label: 'Em andamento', className: 'bg-blue-500/15 text-blue-500' },
  resolved: { label: 'Resolvido', className: 'bg-status-ok/15 text-status-ok' },
};

// Haptic feedback
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
  if ('vibrate' in navigator) {
    const patterns = { light: [10], medium: [20], heavy: [30, 10, 30] };
    navigator.vibrate(patterns[type]);
  }
};

export function SwipeableAlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onEscalate,
  onAssign,
  onViewDetails,
  loading = false,
}: SwipeableAlertCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [activeAction, setActiveAction] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const threshold = 80;
  
  // Transforms for swipe actions
  const leftBgOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightBgOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const leftIconScale = useTransform(x, [0, threshold / 2, threshold], [0.6, 0.9, 1.1]);
  const rightIconScale = useTransform(x, [-threshold, -threshold / 2, 0], [1.1, 0.9, 0.6]);
  const leftIconRotate = useTransform(x, [0, threshold], [0, 10]);
  const rightIconRotate = useTransform(x, [-threshold, 0], [-10, 0]);
  
  const severity = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const timeAgo = formatDistanceToNow(
    typeof alert.opened_at === 'string' ? new Date(alert.opened_at) : alert.opened_at,
    { addSuffix: true, locale: ptBR }
  );

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const { offset } = info;
    if (offset.x > threshold * 0.5) {
      setActiveAction('left');
    } else if (offset.x < -threshold * 0.5) {
      setActiveAction('right');
    } else {
      setActiveAction(null);
    }
  }, [threshold]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = threshold * 0.6;
    const velocityThreshold = 400;
    
    // Right swipe → Acknowledge/Resolve
    if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      triggerHaptic('heavy');
      if (alert.status === 'open') {
        onAcknowledge?.(alert.id);
      } else {
        onResolve?.(alert.id);
      }
    }
    // Left swipe → Escalate
    else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      triggerHaptic('heavy');
      onEscalate?.(alert.id);
    }
    
    setActiveAction(null);
  }, [threshold, alert.id, alert.status, onAcknowledge, onResolve, onEscalate]);

  const handleTap = useCallback(() => {
    triggerHaptic('light');
    onViewDetails?.(alert.id);
  }, [alert.id, onViewDetails]);

  const isResolved = alert.status === 'resolved';

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-xl">
      {/* Left action background (Acknowledge/Resolve) */}
      <motion.div 
        style={{ opacity: leftBgOpacity }}
        className="absolute inset-y-0 left-0 w-24 flex items-center justify-center bg-status-ok"
      >
        <motion.div 
          style={{ scale: leftIconScale, rotate: leftIconRotate }}
          className="flex flex-col items-center gap-1 text-white"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span className="text-xs font-medium">
            {alert.status === 'open' ? 'Reconhecer' : 'Resolver'}
          </span>
        </motion.div>
      </motion.div>
      
      {/* Right action background (Escalate) */}
      <motion.div 
        style={{ opacity: rightBgOpacity }}
        className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-orange-500"
      >
        <motion.div 
          style={{ scale: rightIconScale, rotate: rightIconRotate }}
          className="flex flex-col items-center gap-1 text-white"
        >
          <ArrowUpRight className="w-6 h-6" />
          <span className="text-xs font-medium">Escalar</span>
        </motion.div>
      </motion.div>

      {/* Card content */}
      <motion.div
        style={{ x }}
        drag={isResolved || loading ? false : 'x'}
        dragConstraints={{ left: -threshold * 1.3, right: threshold * 1.3 }}
        dragElastic={0.15}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        whileTap={{ scale: 0.98 }}
        animate={{
          scale: activeAction ? 0.98 : 1,
          boxShadow: activeAction === 'left' 
            ? '0 0 20px rgba(34, 197, 94, 0.3)'
            : activeAction === 'right'
            ? '0 0 20px rgba(249, 115, 22, 0.3)'
            : 'none',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn(
          'relative z-10 bg-card border border-border rounded-xl p-4',
          'cursor-grab active:cursor-grabbing',
          alert.severity === 'critical' && !isResolved && severity.glowClass,
          alert.severity === 'critical' && !isResolved && 'animate-[pulse_2s_ease-in-out_infinite]',
          isResolved && 'opacity-60'
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn('flex items-center justify-center w-11 h-11 rounded-xl', severity.bgClass)}
              animate={alert.severity === 'critical' && !isResolved ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <AlertTriangle className={cn('w-5 h-5', severity.iconClass)} />
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className={cn('text-xs', status.className)}>{status.label}</Badge>
                <Badge variant="outline" className={cn('text-xs', severity.textClass)}>
                  {severity.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </p>
            </div>
          </div>
          
          {/* SLA Indicator */}
          {alert.sla_due_at && !isResolved && (
            <SlaIndicator dueAt={alert.sla_due_at} compact />
          )}
        </div>

        {/* Message */}
        <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
          {alert.message}
        </h3>

        {/* Cause hint */}
        {alert.probable_cause && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
            <span className="text-xs text-muted-foreground/70">Causa:</span> {alert.probable_cause}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {alert.machine?.name && (
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                {alert.machine.name}
              </span>
            )}
            {alert.tire?.serial && (
              <span className="inline-flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5" />
                {alert.tire.position || alert.tire.serial}
              </span>
            )}
          </div>
          
          {/* Assigned or Assign button */}
          {alert.assigned_to ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <User className="w-3 h-3" />
              {alert.assigned_to}
            </span>
          ) : alert.status === 'open' && onAssign ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                onAssign(alert.id);
              }}
              className="flex items-center gap-1 text-xs text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-full transition-colors"
            >
              <UserPlus className="w-3 h-3" />
              Atribuir
            </motion.button>
          ) : null}
        </div>

        {/* Swipe hint for mobile */}
        {!isResolved && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <motion.span
              initial={{ x: 0 }}
              animate={{ x: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ← →
            </motion.span>
            <span>deslize</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
