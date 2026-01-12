import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { OperationFilters, TaskStatus, TaskPriority, TaskType, Employee } from '@/types/operations';
import { cn } from '@/lib/utils';

interface OperationFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: OperationFilters;
  employees: Employee[];
  onFiltersChange: (filters: OperationFilters) => void;
  onClear: () => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'paused', label: 'Pausada' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' }
];

const priorityOptions: { value: TaskPriority; label: string; className: string }[] = [
  { value: 'critical', label: 'Crítico', className: 'bg-status-critical text-white' },
  { value: 'high', label: 'Alto', className: 'bg-status-warning text-status-warning-foreground' },
  { value: 'medium', label: 'Médio', className: 'bg-primary/20 text-primary' },
  { value: 'low', label: 'Baixo', className: 'bg-muted text-muted-foreground' }
];

const typeOptions: { value: TaskType; label: string }[] = [
  { value: 'preventive_maintenance', label: 'Manutenção Preventiva' },
  { value: 'corrective_maintenance', label: 'Manutenção Corretiva' },
  { value: 'telemetry_monitoring', label: 'Monitoramento' },
  { value: 'tire_change', label: 'Troca de Pneu' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'other', label: 'Outro' }
];

const slaOptions: { value: 'ok' | 'warning' | 'expired'; label: string; className: string }[] = [
  { value: 'ok', label: 'OK', className: 'bg-status-success text-white' },
  { value: 'warning', label: 'Vencendo', className: 'bg-status-warning text-status-warning-foreground' },
  { value: 'expired', label: 'Vencido', className: 'bg-status-critical text-white' }
];

export function OperationFiltersSheet({
  open,
  onOpenChange,
  filters,
  employees,
  onFiltersChange,
  onClear
}: OperationFiltersSheetProps) {
  const toggleFilter = <K extends keyof OperationFilters>(
    key: K,
    value: OperationFilters[K][number]
  ) => {
    const current = filters[key] as any[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const activeFiltersCount = Object.values(filters).reduce(
    (acc, arr) => acc + arr.length, 
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="text-left pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </SheetTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="py-4 space-y-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Status */}
          <div>
            <h4 className="font-medium mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <Badge
                  key={option.value}
                  variant={filters.status.includes(option.value) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    filters.status.includes(option.value) && 'bg-primary'
                  )}
                  onClick={() => toggleFilter('status', option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Priority */}
          <div>
            <h4 className="font-medium mb-3">Prioridade</h4>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map(option => (
                <Badge
                  key={option.value}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-all',
                    filters.priority.includes(option.value) && option.className
                  )}
                  onClick={() => toggleFilter('priority', option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Type */}
          <div>
            <h4 className="font-medium mb-3">Tipo de Tarefa</h4>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(option => (
                <Badge
                  key={option.value}
                  variant={filters.type.includes(option.value) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    filters.type.includes(option.value) && 'bg-primary'
                  )}
                  onClick={() => toggleFilter('type', option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* SLA Status */}
          <div>
            <h4 className="font-medium mb-3">Status do SLA</h4>
            <div className="flex flex-wrap gap-2">
              {slaOptions.map(option => (
                <Badge
                  key={option.value}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-all',
                    filters.slaStatus.includes(option.value) && option.className
                  )}
                  onClick={() => toggleFilter('slaStatus', option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Assignee */}
          <div>
            <h4 className="font-medium mb-3">Responsável</h4>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filters.assignedTo.includes('unassigned') ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all',
                  filters.assignedTo.includes('unassigned') && 'bg-status-warning text-status-warning-foreground'
                )}
                onClick={() => toggleFilter('assignedTo', 'unassigned')}
              >
                Sem responsável
              </Badge>
              {employees.map(emp => (
                <Badge
                  key={emp.id}
                  variant={filters.assignedTo.includes(emp.id) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    filters.assignedTo.includes(emp.id) && 'bg-primary'
                  )}
                  onClick={() => toggleFilter('assignedTo', emp.id)}
                >
                  {emp.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t border-border">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
