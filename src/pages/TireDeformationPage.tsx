import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, 
  CircleDot, 
  AlertTriangle,
  Search,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useTireDeformation, TireDeformationData } from '@/hooks/useTireDeformation';
import {
  TireDeformationCard,
  DeformationChart,
  FleetDeformationChart,
  DeformationAlertCard,
  TireDeformationDetailSheet,
  DeformationStatsCard,
  DeformationSettingsModal,
} from '@/components/deformation';

export default function TireDeformationPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState<TireDeformationData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    deformationData,
    alerts,
    stats,
    thresholds,
    updateThresholds,
    resetThresholds,
    adjustPressure,
    requestReplacement,
    isLoading,
  } = useTireDeformation();

  const filteredTires = deformationData.filter(tire => {
    const matchesSearch = 
      tire.tireSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tire.machineName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tire.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTireSelect = (tire: TireDeformationData) => {
    setSelectedTire(tire);
    setDetailOpen(true);
  };

  const handleViewTireFromAlert = (tireId: string) => {
    const tire = deformationData.find(t => t.tireId === tireId);
    if (tire) {
      handleTireSelect(tire);
    }
  };

  // Get aggregated history for fleet chart
  const aggregatedHistory = deformationData.length > 0 ? deformationData[0].history : [];

  return (
    <MainLayout title="Análise de Amassamento">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Análise de Amassamento</h1>
            <p className="text-sm text-muted-foreground">
              Monitoramento de deformação de pneus em tempo real
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
          <DeformationStatsCard stats={stats} />
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="tires" className="flex items-center gap-2">
              <CircleDot className="w-4 h-4" />
              <span className="hidden sm:inline">Pneus</span>
              <span className="sm:hidden">{deformationData.length}</span>
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
                <DeformationChart 
                  data={aggregatedHistory} 
                  thresholds={thresholds}
                  title="Evolução da Deformação"
                />
                <FleetDeformationChart 
                  data={deformationData} 
                  thresholds={thresholds}
                />
              </div>
            )}

            {/* Critical Tires Quick View */}
            {stats.critical > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-critical" />
                  Pneus Críticos
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {deformationData
                    .filter(t => t.status === 'critical')
                    .slice(0, 3)
                    .map(tire => (
                      <TireDeformationCard
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
            {/* Filters */}
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
                  <SelectItem value="optimal">Normal</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tire List */}
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[180px]" />
                ))}
              </div>
            ) : filteredTires.length === 0 ? (
              <div className="text-center py-12">
                <CircleDot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum pneu encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Não há pneus cadastrados no sistema'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTires.map(tire => (
                  <TireDeformationCard
                    key={tire.id}
                    tire={tire}
                    onPress={() => handleTireSelect(tire)}
                  />
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
                <h3 className="font-semibold text-lg mb-2">Tudo está perfeito!</h3>
                <p className="text-muted-foreground text-sm">
                  Nenhum alerta de amassamento detectado
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <DeformationAlertCard
                    key={alert.id}
                    alert={alert}
                    onViewTire={() => handleViewTireFromAlert(alert.tireId)}
                    onFix={() => adjustPressure(alert.tireId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Sheet */}
        <TireDeformationDetailSheet
          tire={selectedTire}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          thresholds={thresholds}
          onAdjustPressure={adjustPressure}
          onRequestReplacement={requestReplacement}
        />

        {/* Settings Modal */}
        <DeformationSettingsModal
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
