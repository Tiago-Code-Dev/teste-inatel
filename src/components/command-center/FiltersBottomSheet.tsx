import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, X, AlertTriangle, FileText, User, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';
type OccurrenceStatus = 'open' | 'in_progress' | 'paused' | 'closed';
type SlaFilter = 'all' | 'expired' | 'warning' | 'ok';

interface FiltersState {
  severities: AlertSeverity[];
  alertStatuses: AlertStatus[];
  occurrenceStatuses: OccurrenceStatus[];
  period: string;
  assignee: string;
  sla: SlaFilter;
  machineId: string;
}

interface FiltersBottomSheetProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  assignees?: { id: string; name: string }[];
  machines?: { id: string; name: string }[];
  counts?: {
    bySeverity?: Record<AlertSeverity, number>;
    byAlertStatus?: Record<AlertStatus, number>;
    byOccurrenceStatus?: Record<OccurrenceStatus, number>;
  };
}

const severityOptions: { value: AlertSeverity; label: string; className: string }[] = [
  { value: 'critical', label: 'Crítico', className: 'bg-status-critical/15 text-status-critical border-status-critical/30' },
  { value: 'high', label: 'Alto', className: 'bg-orange-500/15 text-orange-500 border-orange-500/30' },
  { value: 'medium', label: 'Médio', className: 'bg-status-warning/15 text-status-warning border-status-warning/30' },
  { value: 'low', label: 'Baixo', className: 'bg-muted text-muted-foreground border-border' },
];

const alertStatusOptions: { value: AlertStatus; label: string }[] = [
  { value: 'open', label: 'Abertos' },
  { value: 'acknowledged', label: 'Reconhecidos' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'resolved', label: 'Resolvidos' },
];

const occurrenceStatusOptions: { value: OccurrenceStatus; label: string }[] = [
  { value: 'open', label: 'Abertas' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'closed', label: 'Fechadas' },
];

const periodOptions = [
  { value: '15m', label: 'Últimos 15min' },
  { value: '1h', label: 'Última hora' },
  { value: '6h', label: 'Últimas 6h' },
  { value: '24h', label: 'Últimas 24h' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: 'all', label: 'Todos' },
];

const slaOptions: { value: SlaFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'expired', label: 'Vencidos' },
  { value: 'warning', label: 'Vencendo em 30min' },
  { value: 'ok', label: 'OK' },
];

export function FiltersBottomSheet({
  filters,
  onFiltersChange,
  assignees = [],
  machines = [],
  counts,
}: FiltersBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FiltersState>(filters);

  const activeFiltersCount = 
    filters.severities.length +
    filters.alertStatuses.length +
    filters.occurrenceStatuses.length +
    (filters.period !== 'all' ? 1 : 0) +
    (filters.assignee !== 'all' ? 1 : 0) +
    (filters.sla !== 'all' ? 1 : 0) +
    (filters.machineId !== 'all' ? 1 : 0);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FiltersState = {
      severities: [],
      alertStatuses: [],
      occurrenceStatuses: [],
      period: 'all',
      assignee: 'all',
      sla: 'all',
      machineId: 'all',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const toggleSeverity = (sev: AlertSeverity) => {
    setLocalFilters(prev => ({
      ...prev,
      severities: prev.severities.includes(sev)
        ? prev.severities.filter(s => s !== sev)
        : [...prev.severities, sev],
    }));
  };

  const toggleAlertStatus = (status: AlertStatus) => {
    setLocalFilters(prev => ({
      ...prev,
      alertStatuses: prev.alertStatuses.includes(status)
        ? prev.alertStatuses.filter(s => s !== status)
        : [...prev.alertStatuses, status],
    }));
  };

  const toggleOccurrenceStatus = (status: OccurrenceStatus) => {
    setLocalFilters(prev => ({
      ...prev,
      occurrenceStatuses: prev.occurrenceStatuses.includes(status)
        ? prev.occurrenceStatuses.filter(s => s !== status)
        : [...prev.occurrenceStatuses, status],
    }));
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros Avançados
            </DrawerTitle>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={handleReset}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar
              </Button>
            )}
          </div>
          <DrawerDescription>
            Filtre alertas e ocorrências por diferentes critérios
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="alerts" className="gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Alertas
              </TabsTrigger>
              <TabsTrigger value="occurrences" className="gap-1.5">
                <FileText className="w-4 h-4" />
                Ocorrências
              </TabsTrigger>
            </TabsList>

            {/* Alerts Filters */}
            <TabsContent value="alerts" className="space-y-5 mt-0">
              {/* Severity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Severidade</label>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map((opt) => {
                    const isSelected = localFilters.severities.includes(opt.value);
                    const count = counts?.bySeverity?.[opt.value] || 0;
                    return (
                      <Button
                        key={opt.value}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-9 gap-1.5 transition-all',
                          isSelected && opt.className
                        )}
                        onClick={() => toggleSeverity(opt.value)}
                      >
                        {opt.label}
                        {count > 0 && (
                          <Badge variant="secondary" className="h-5 min-w-[20px] px-1 text-xs">
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Alert Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <div className="flex flex-wrap gap-2">
                  {alertStatusOptions.map((opt) => {
                    const isSelected = localFilters.alertStatuses.includes(opt.value);
                    const count = counts?.byAlertStatus?.[opt.value] || 0;
                    return (
                      <Button
                        key={opt.value}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={() => toggleAlertStatus(opt.value)}
                      >
                        {opt.label}
                        {count > 0 && (
                          <Badge 
                            variant="secondary" 
                            className={cn('h-5 min-w-[20px] px-1 text-xs', isSelected && 'bg-white/20')}
                          >
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* SLA */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  SLA
                </label>
                <Select
                  value={localFilters.sla}
                  onValueChange={(v) => setLocalFilters(prev => ({ ...prev, sla: v as SlaFilter }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar SLA" />
                  </SelectTrigger>
                  <SelectContent>
                    {slaOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Occurrences Filters */}
            <TabsContent value="occurrences" className="space-y-5 mt-0">
              {/* Occurrence Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <div className="flex flex-wrap gap-2">
                  {occurrenceStatusOptions.map((opt) => {
                    const isSelected = localFilters.occurrenceStatuses.includes(opt.value);
                    const count = counts?.byOccurrenceStatus?.[opt.value] || 0;
                    return (
                      <Button
                        key={opt.value}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={() => toggleOccurrenceStatus(opt.value)}
                      >
                        {opt.label}
                        {count > 0 && (
                          <Badge 
                            variant="secondary" 
                            className={cn('h-5 min-w-[20px] px-1 text-xs', isSelected && 'bg-white/20')}
                          >
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Common Filters */}
            <div className="space-y-5 pt-4 border-t border-border mt-4">
              {/* Period */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Período
                </label>
                <Select
                  value={localFilters.period}
                  onValueChange={(v) => setLocalFilters(prev => ({ ...prev, period: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              {assignees.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    Responsável
                  </label>
                  <Select
                    value={localFilters.assignee}
                    onValueChange={(v) => setLocalFilters(prev => ({ ...prev, assignee: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="unassigned">Sem responsável</SelectItem>
                      {assignees.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Machine */}
              {machines.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Máquina</label>
                  <Select
                    value={localFilters.machineId}
                    onValueChange={(v) => setLocalFilters(prev => ({ ...prev, machineId: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar máquina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Tabs>
        </div>

        <DrawerFooter className="pt-2">
          <Button onClick={handleApply} className="w-full">
            Aplicar Filtros
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
