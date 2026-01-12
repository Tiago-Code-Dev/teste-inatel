import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, Filter, AlertTriangle, TrendingUp, 
  DollarSign, RefreshCw, Truck
} from 'lucide-react';
import { useCostManagement, CostPeriod, CostCategory } from '@/hooks/useCostManagement';
import {
  CostOverviewCard,
  CostChart,
  CostAlertCard,
  CostDetailSheet,
  CostSettingsModal,
  MachineCostList
} from '@/components/costs';
import { Skeleton } from '@/components/ui/skeleton';

const CostManagementPage = () => {
  const {
    costs,
    machineCostSummaries,
    costTotals,
    costAlerts,
    machines,
    costByCategoryData,
    costByMachineData,
    costTrendData,
    filters,
    thresholds,
    updateFilters,
    updateThresholds,
    getMachineSummary,
    getMachineCosts,
    categoryLabels,
    categoryColors,
    isLoading
  } = useCostManagement();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  const selectedMachineSummary = selectedMachineId ? getMachineSummary(selectedMachineId) : null;
  const selectedMachineCosts = selectedMachineId ? getMachineCosts(selectedMachineId) : [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  if (isLoading) {
    return (
      <MainLayout title="Gerenciamento de Custos">
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gerenciamento de Custos">
      <div className="space-y-4 p-4 pb-24 md:pb-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(costTotals.total)}
            </Badge>
            {costAlerts.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {costAlerts.length} alertas
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.period}
                onValueChange={(value: CostPeriod) => updateFilters({ period: value })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6h">Últimas 6h</SelectItem>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7d</SelectItem>
                  <SelectItem value="30d">Últimos 30d</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.machineId || 'all'}
                onValueChange={(value) => updateFilters({ machineId: value === 'all' ? null : value })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Máquina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Máquinas</SelectItem>
                  {machines.map(machine => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) => updateFilters({ category: value as CostCategory | 'all' })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="fuel">Combustível</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="parts">Peças</SelectItem>
                  <SelectItem value="labor">Mão de Obra</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="machines">Máquinas</TabsTrigger>
            <TabsTrigger value="alerts">
              Alertas
              {costAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {costAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <CostOverviewCard
                title="Combustível"
                value={costTotals.fuel}
                type="fuel"
                threshold={thresholds.fuelLimit}
              />
              <CostOverviewCard
                title="Manutenção"
                value={costTotals.maintenance}
                type="maintenance"
                threshold={thresholds.maintenanceLimit}
              />
              <CostOverviewCard
                title="Peças"
                value={costTotals.parts}
                type="parts"
                threshold={thresholds.partsLimit}
              />
              <CostOverviewCard
                title="Custo/Hora"
                value={costTotals.costPerHour}
                type="perHour"
                threshold={thresholds.costPerHourLimit}
              />
            </div>

            {/* Total Cost Card */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Custo Total do Período</p>
                    <p className="text-3xl font-bold">{formatCurrency(costTotals.total)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {costTotals.operatingHours}h de operação
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Limite</p>
                    <p className="text-lg font-medium">{formatCurrency(thresholds.totalLimit)}</p>
                    <Badge 
                      variant={costTotals.total > thresholds.totalLimit ? 'destructive' : 'secondary'}
                      className="mt-1"
                    >
                      {costTotals.total > thresholds.totalLimit 
                        ? `+${formatCurrency(costTotals.total - thresholds.totalLimit)}`
                        : `${formatCurrency(thresholds.totalLimit - costTotals.total)} disponível`
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <CostChart
              byCategoryData={costByCategoryData}
              byMachineData={costByMachineData}
              trendData={costTrendData}
            />
          </TabsContent>

          <TabsContent value="machines" className="space-y-4">
            <MachineCostList
              summaries={machineCostSummaries}
              thresholds={thresholds}
              onSelectMachine={setSelectedMachineId}
            />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {costAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <h3 className="font-medium text-lg">Tudo sob controle!</h3>
                  <p className="text-muted-foreground mt-1">
                    Nenhum custo excedeu os limites configurados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {costAlerts.map(alert => (
                  <CostAlertCard
                    key={alert.id}
                    alert={alert}
                    categoryLabel={categoryLabels[alert.category]}
                    onViewDetails={() => setSelectedMachineId(alert.machineId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Modal */}
      <CostSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        thresholds={thresholds}
        onSave={updateThresholds}
      />

      {/* Detail Sheet */}
      <CostDetailSheet
        isOpen={!!selectedMachineId}
        onClose={() => setSelectedMachineId(null)}
        summary={selectedMachineSummary || null}
        costs={selectedMachineCosts}
        thresholds={thresholds}
        categoryLabels={categoryLabels}
        categoryColors={categoryColors}
      />
    </MainLayout>
  );
};

export default CostManagementPage;
