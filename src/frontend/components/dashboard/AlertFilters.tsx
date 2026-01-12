import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';

interface AlertFiltersProps {
  selectedSeverities: AlertSeverity[];
  selectedStatuses: AlertStatus[];
  selectedPeriod: string;
  onSeverityToggle: (severity: AlertSeverity) => void;
  onStatusToggle: (status: AlertStatus) => void;
  onPeriodChange: (period: string) => void;
  onClearFilters: () => void;
  counts?: {
    bySeverity?: Record<AlertSeverity, number>;
    byStatus?: Record<AlertStatus, number>;
  };
}

const severityOptions: { value: AlertSeverity; label: string; className: string }[] = [
  { value: 'critical', label: 'Crítico', className: 'bg-status-critical/15 text-status-critical border-status-critical/30' },
  { value: 'high', label: 'Alto', className: 'bg-orange-500/15 text-orange-500 border-orange-500/30' },
  { value: 'medium', label: 'Médio', className: 'bg-status-warning/15 text-status-warning border-status-warning/30' },
  { value: 'low', label: 'Baixo', className: 'bg-muted text-muted-foreground border-border' },
];

const statusOptions: { value: AlertStatus; label: string }[] = [
  { value: 'open', label: 'Abertos' },
  { value: 'acknowledged', label: 'Reconhecidos' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'resolved', label: 'Resolvidos' },
];

const periodOptions = [
  { value: '15m', label: 'Últimos 15min' },
  { value: '1h', label: 'Última hora' },
  { value: '6h', label: 'Últimas 6h' },
  { value: '24h', label: 'Últimas 24h' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: 'all', label: 'Todos' },
];

export function AlertFilters({
  selectedSeverities,
  selectedStatuses,
  selectedPeriod,
  onSeverityToggle,
  onStatusToggle,
  onPeriodChange,
  onClearFilters,
  counts,
}: AlertFiltersProps) {
  const hasFilters = selectedSeverities.length > 0 || selectedStatuses.length > 0 || selectedPeriod !== 'all';

  return (
    <div className="space-y-3">
      {/* Period & Clear */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtros</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs gap-1 text-muted-foreground"
              onClick={onClearFilters}
            >
              <X className="w-3 h-3" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Severity Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {severityOptions.map((opt) => {
          const isSelected = selectedSeverities.includes(opt.value);
          const count = counts?.bySeverity?.[opt.value] || 0;
          return (
            <Button
              key={opt.value}
              variant="outline"
              size="sm"
              className={cn(
                'shrink-0 h-8 gap-1.5 transition-all',
                isSelected && opt.className
              )}
              onClick={() => onSeverityToggle(opt.value)}
            >
              {opt.label}
              {count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'h-5 min-w-[20px] px-1.5 text-xs font-medium',
                    isSelected && 'bg-white/20'
                  )}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statusOptions.map((opt) => {
          const isSelected = selectedStatuses.includes(opt.value);
          const count = counts?.byStatus?.[opt.value] || 0;
          return (
            <Button
              key={opt.value}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className="shrink-0 h-8 gap-1.5"
              onClick={() => onStatusToggle(opt.value)}
            >
              {opt.label}
              {count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'h-5 min-w-[20px] px-1.5 text-xs font-medium',
                    isSelected && 'bg-white/20'
                  )}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
