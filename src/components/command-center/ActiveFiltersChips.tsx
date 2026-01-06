import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';
type OccurrenceStatus = 'open' | 'in_progress' | 'paused' | 'closed';

interface ActiveFiltersChipsProps {
  filters: {
    severities: AlertSeverity[];
    alertStatuses: AlertStatus[];
    occurrenceStatuses: OccurrenceStatus[];
    period: string;
    assignee: string;
    sla: string;
    machineId: string;
  };
  onRemove: (type: string, value?: string) => void;
  onClearAll: () => void;
  className?: string;
}

const severityLabels: Record<AlertSeverity, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
};

const alertStatusLabels: Record<AlertStatus, string> = {
  open: 'Aberto',
  acknowledged: 'Reconhecido',
  in_progress: 'Em andamento',
  resolved: 'Resolvido',
};

const occurrenceStatusLabels: Record<OccurrenceStatus, string> = {
  open: 'Aberta',
  in_progress: 'Em andamento',
  paused: 'Pausada',
  closed: 'Fechada',
};

const periodLabels: Record<string, string> = {
  '15m': 'Últimos 15min',
  '1h': 'Última hora',
  '6h': 'Últimas 6h',
  '24h': 'Últimas 24h',
  '7d': 'Últimos 7 dias',
};

const slaLabels: Record<string, string> = {
  expired: 'SLA Vencido',
  warning: 'SLA Vencendo',
  ok: 'SLA OK',
};

export function ActiveFiltersChips({ filters, onRemove, onClearAll, className }: ActiveFiltersChipsProps) {
  const chips: { key: string; label: string; type: string; value?: string }[] = [];

  // Severities
  filters.severities.forEach(sev => {
    chips.push({ key: `sev-${sev}`, label: severityLabels[sev], type: 'severity', value: sev });
  });

  // Alert statuses
  filters.alertStatuses.forEach(status => {
    chips.push({ key: `alert-${status}`, label: alertStatusLabels[status], type: 'alertStatus', value: status });
  });

  // Occurrence statuses
  filters.occurrenceStatuses.forEach(status => {
    chips.push({ key: `occ-${status}`, label: occurrenceStatusLabels[status], type: 'occurrenceStatus', value: status });
  });

  // Period
  if (filters.period !== 'all' && periodLabels[filters.period]) {
    chips.push({ key: 'period', label: periodLabels[filters.period], type: 'period' });
  }

  // SLA
  if (filters.sla !== 'all' && slaLabels[filters.sla]) {
    chips.push({ key: 'sla', label: slaLabels[filters.sla], type: 'sla' });
  }

  // Assignee
  if (filters.assignee === 'unassigned') {
    chips.push({ key: 'assignee', label: 'Sem responsável', type: 'assignee' });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.div
            key={chip.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
          >
            <Badge
              variant="secondary"
              className="gap-1 pr-1 h-7 hover:bg-secondary/80 transition-colors"
            >
              <span className="text-xs">{chip.label}</span>
              <button
                onClick={() => onRemove(chip.type, chip.value)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-foreground/10 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </motion.div>
        ))}
        
        {chips.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={onClearAll}
            >
              Limpar todos
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
