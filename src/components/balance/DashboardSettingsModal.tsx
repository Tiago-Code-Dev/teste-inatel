import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, RotateCcw } from 'lucide-react';
import { DashboardFilters } from '@/hooks/useOperationalDashboard';

interface DashboardSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: DashboardFilters;
  onFiltersChange: (filters: Partial<DashboardFilters>) => void;
  onReset: () => void;
  machines?: { id: string; name: string }[];
}

export function DashboardSettingsModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onReset,
  machines = [],
}: DashboardSettingsModalProps) {
  const [localFilters, setLocalFilters] = useState<DashboardFilters>(filters);

  const handleSave = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Period Filter */}
          <div className="space-y-2">
            <Label>Período de Análise</Label>
            <Select
              value={localFilters.period}
              onValueChange={(value: DashboardFilters['period']) => 
                setLocalFilters({ ...localFilters, period: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6h">Últimas 6 horas</SelectItem>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Machine Filter */}
          <div className="space-y-2">
            <Label>Máquina Específica</Label>
            <Select
              value={localFilters.machineId || 'all'}
              onValueChange={(value) => 
                setLocalFilters({ 
                  ...localFilters, 
                  machineId: value === 'all' ? null : value 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as máquinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as máquinas</SelectItem>
                {machines.map((machine) => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show Resolved Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar Alertas Resolvidos</Label>
              <p className="text-xs text-muted-foreground">
                Incluir alertas já resolvidos na análise
              </p>
            </div>
            <Switch
              checked={localFilters.showResolved}
              onCheckedChange={(checked) => 
                setLocalFilters({ ...localFilters, showResolved: checked })
              }
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave}>Aplicar Filtros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
