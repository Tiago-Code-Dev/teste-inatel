import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSummaryCardProps {
  value: number;
  label: string;
  icon: LucideIcon;
  variant: 'success' | 'warning' | 'danger' | 'muted';
  delay?: number;
  onClick?: () => void;
}

const variantStyles = {
  success: {
    bg: 'bg-status-ok/10',
    border: 'border-status-ok/20',
    text: 'text-status-ok',
    hover: 'hover:bg-status-ok/15 hover:border-status-ok/30',
    glow: 'hover:shadow-[0_0_15px_hsl(var(--status-ok)/0.15)]',
  },
  warning: {
    bg: 'bg-status-warning/10',
    border: 'border-status-warning/20',
    text: 'text-status-warning',
    hover: 'hover:bg-status-warning/15 hover:border-status-warning/30',
    glow: 'hover:shadow-[0_0_15px_hsl(var(--status-warning)/0.15)]',
  },
  danger: {
    bg: 'bg-status-critical/10',
    border: 'border-status-critical/20',
    text: 'text-status-critical',
    hover: 'hover:bg-status-critical/15 hover:border-status-critical/30',
    glow: 'hover:shadow-[0_0_15px_hsl(var(--status-critical)/0.15)]',
  },
  muted: {
    bg: 'bg-muted',
    border: 'border-border',
    text: 'text-muted-foreground',
    hover: 'hover:bg-muted/80',
    glow: '',
  },
};

export function StatusSummaryCard({ 
  value, 
  label, 
  icon: Icon, 
  variant,
  delay = 0,
  onClick,
}: StatusSummaryCardProps) {
  const styles = variantStyles[variant];
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
        styles.bg,
        styles.border,
        styles.hover,
        styles.glow,
        onClick && 'cursor-pointer'
      )}
    >
      <motion.div
        animate={variant === 'danger' && value > 0 ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{ 
          repeat: variant === 'danger' && value > 0 ? Infinity : 0,
          duration: 2 
        }}
      >
        <Icon className={cn('w-5 h-5', styles.text)} />
      </motion.div>
      <div className="text-left">
        <motion.p 
          className={cn('text-2xl font-bold tabular-nums', styles.text)}
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Component>
  );
}

interface StatusSummaryGridProps {
  operational: number;
  warning: number;
  critical: number;
  offline: number;
  onStatusClick?: (status: string) => void;
}

export function StatusSummaryGrid({ 
  operational, 
  warning, 
  critical, 
  offline,
  onStatusClick,
}: StatusSummaryGridProps) {
  const { CheckCircle2, AlertTriangle, XCircle, WifiOff } = require('lucide-react');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatusSummaryCard
        value={operational}
        label="Operacionais"
        icon={CheckCircle2}
        variant="success"
        delay={0}
        onClick={onStatusClick ? () => onStatusClick('operational') : undefined}
      />
      <StatusSummaryCard
        value={warning}
        label="Atenção"
        icon={AlertTriangle}
        variant="warning"
        delay={0.05}
        onClick={onStatusClick ? () => onStatusClick('warning') : undefined}
      />
      <StatusSummaryCard
        value={critical}
        label="Críticos"
        icon={XCircle}
        variant="danger"
        delay={0.1}
        onClick={onStatusClick ? () => onStatusClick('critical') : undefined}
      />
      <StatusSummaryCard
        value={offline}
        label="Sem sinal"
        icon={WifiOff}
        variant="muted"
        delay={0.15}
        onClick={onStatusClick ? () => onStatusClick('offline') : undefined}
      />
    </div>
  );
}
