import { MainLayout } from '@/components/layout/MainLayout';
import { MachineCard } from '@/components/shared/MachineCard';
import { machines } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MachineStatus } from '@/types';

const statusFilters: { value: MachineStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'critical', label: 'Críticos' },
  { value: 'warning', label: 'Atenção' },
  { value: 'operational', label: 'Operacionais' },
  { value: 'offline', label: 'Sem sinal' },
];

const MachinesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter machines
  const filteredMachines = machines.filter((machine) => {
    const matchesSearch = 
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by criticality
  const sortedMachines = [...filteredMachines].sort((a, b) => {
    const priority = { critical: 0, warning: 1, operational: 2, offline: 3 };
    return priority[a.status] - priority[b.status];
  });

  // Mock telemetry
  const getMockTelemetry = (machineId: string) => {
    if (machineId === 'machine-1') return { pressure: 18.5, speed: 52 };
    if (machineId === 'machine-2') return { pressure: 32, speed: 12 };
    return { pressure: 28 + Math.random() * 3, speed: 15 + Math.random() * 8 };
  };

  return (
    <MainLayout 
      title="Máquinas" 
      subtitle={`${filteredMachines.length} máquinas encontradas`}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'whitespace-nowrap',
                statusFilter === filter.value && 'bg-primary text-primary-foreground'
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center gap-1 ml-auto">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Machines Grid */}
      {sortedMachines.length > 0 ? (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' 
            ? 'sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-3xl'
        )}>
          {sortedMachines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              telemetry={machine.status !== 'offline' ? getMockTelemetry(machine.id) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Filter className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Nenhuma máquina encontrada
          </h3>
          <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros ou buscar por outro termo
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default MachinesPage;
