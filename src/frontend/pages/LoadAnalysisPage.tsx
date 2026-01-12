import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, 
  Weight, 
  AlertTriangle,
  Search,
  Truck,
  BarChart3
} from 'lucide-react';
import { useLoadAnalysis, TireLoadData, MachineLoadData } from '@/hooks/useLoadAnalysis';
import {
  LoadImpactCard,
  LoadImpactChart,
  FleetLoadChart,
  LoadAlertCard,
  LoadDetailSheet,
  LoadStatsCard,
  LoadSettingsModal,
} from '@/components/load';

export default function LoadAnalysisPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState<TireLoadData | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<MachineLoadData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    tireLoadData,
    machineLoadData,
    alerts,
    stats,
    thresholds,
    updateThresholds,
    resetThresholds,
    adjustLoad,
    requestMaintenance,
    isLoading,
  } = useLoadAnalysis();

  const filteredTires = tireLoadData.filter(tire => {
    const matchesSearch = 
      tire.tireSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tire.machineName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tire.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTireSelect = (tire: TireLoadData) => {
    setSelectedTire(tire);
    setSelectedMachine(null);
    setDetailOpen(true);
  };

  const handleMachineSelect = (machine: MachineLoadData) => {
    setSelectedMachine(machine);
    setSelectedTire(null);
    setDetailOpen(true);
  };

  const handleViewFromAlert = (tireId?: string, machineId?: string) => {
    if (tireId) {
      const tire = tireLoadData.find(t => t.tireId === tireId);
      if (tire) handleTireSelect(tire);
    } else if (machineId) {
      const machine = machineLoadData.find(m => m.id === machineId);
      if (machine) handleMachineSelect(machine);
    }
  };

  const aggregatedHistory = tireLoadData.length > 0 ? tireLoadData[0].history : [];

  return (
    <MainLayout title="Análise de Carga">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Análise de Carga</h1>
            <p className="text-sm text-muted-foreground">
              Monitoramento do impacto da carga em pneus e máquinas
            </p>
          </div>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>

        {/* Stats */}
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <LoadStatsCard stats={stats} />
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="tires" className="flex items-center gap-2">
              <Weight className="w-4 h-4" />
              <span className="hidden sm:inline">Pneus</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Máquinas</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
              {alerts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-status-critical text-white rounded-full">
                  {alerts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-[350px]" />
                <Skeleton className="h-[350px]" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <LoadImpactChart 
                  data={aggregatedHistory} 
                  thresholds={thresholds}
                  title="Evolução da Carga"
                />
                <FleetLoadChart 
                  machines={machineLoadData} 
                  thresholds={thresholds}
                />
              </div>
            )}

            {stats.overload > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-critical" />
                  Pneus com Sobrecarga
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tireLoadData
                    .filter(t => t.status === 'overload')
                    .slice(0, 3)
                    .map(tire => (
                      <LoadImpactCard
                        key={tire.id}
                        tire={tire}
                        onPress={() => handleTireSelect(tire)}
                      />
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tires Tab */}
          <TabsContent value="tires" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por serial ou máquina..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="overload">Sobrecarga</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[180px]" />
                ))}
              </div>
            ) : filteredTires.length === 0 ? (
              <div className="text-center py-12">
                <Weight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum pneu encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTires.map(tire => (
                  <LoadImpactCard
                    key={tire.id}
                    tire={tire}
                    onPress={() => handleTireSelect(tire)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Machines Tab */}
          <TabsContent value="machines" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-[80px]" />
                ))}
              </div>
            ) : machineLoadData.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhuma máquina encontrada</h3>
                <p className="text-muted-foreground text-sm">
                  Cadastre máquinas para analisar a carga
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {machineLoadData.map(machine => (
                  <div 
                    key={machine.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleMachineSelect(machine)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        machine.status === 'normal' ? 'bg-status-normal' :
                        machine.status === 'warning' ? 'bg-status-warning' :
                        'bg-status-critical'
                      }`} />
                      <div>
                        <p className="font-medium">{machine.name}</p>
                        <p className="text-xs text-muted-foreground">{machine.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Carga</p>
                        <p className={`font-semibold ${
                          machine.status === 'overload' ? 'text-status-critical' :
                          machine.status === 'warning' ? 'text-status-warning' : ''
                        }`}>{machine.loadPercent.toFixed(0)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Eficiência</p>
                        <p className="font-semibold">{machine.efficiency.toFixed(0)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Afetados</p>
                        <p className="font-semibold">{machine.tiresAffected}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[140px]" />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-status-normal mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Tudo funcionando bem!</h3>
                <p className="text-muted-foreground text-sm">
                  Nenhum alerta de sobrecarga detectado
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <LoadAlertCard
                    key={alert.id}
                    alert={alert}
                    onView={() => handleViewFromAlert(alert.tireId, alert.machineId)}
                    onFix={() => adjustLoad(alert.machineId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Sheet */}
        <LoadDetailSheet
          tire={selectedTire}
          machine={selectedMachine}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          thresholds={thresholds}
          onAdjustLoad={adjustLoad}
          onRequestMaintenance={requestMaintenance}
        />

        {/* Settings Modal */}
        <LoadSettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          thresholds={thresholds}
          onSave={updateThresholds}
          onReset={resetThresholds}
        />
      </div>
    </MainLayout>
  );
}
