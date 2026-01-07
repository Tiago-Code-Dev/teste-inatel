import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search, Settings, Truck, AlertTriangle, Link2, 
  RefreshCw, CheckCircle
} from 'lucide-react';
import { useFleetManagement, VehicleStatus, AlertSeverity, ExternalIntegration } from '@/hooks/useFleetManagement';
import {
  VehicleCard,
  FleetAlertCard,
  IntegrationStatusCard,
  VehicleDetailSheet,
  FleetStatsCard,
  IntegrationConfigModal
} from '@/components/fleet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const FleetManagementPage = () => {
  const {
    vehicles,
    alerts,
    integrations,
    stats,
    filters,
    updateFilters,
    getVehicle,
    getVehicleAlerts,
    testIntegration,
    toggleIntegration,
    resolveAlert,
    isLoading
  } = useFleetManagement();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<ExternalIntegration | null>(null);
  const [showIntegrationConfig, setShowIntegrationConfig] = useState(false);

  const selectedVehicle = selectedVehicleId ? getVehicle(selectedVehicleId) : null;
  const selectedVehicleAlerts = selectedVehicleId ? getVehicleAlerts(selectedVehicleId) : [];

  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;

  const handleTestIntegration = async (integrationId: string) => {
    toast.promise(testIntegration(integrationId), {
      loading: 'Testando conexão...',
      success: 'Conexão estabelecida com sucesso!',
      error: 'Falha ao conectar'
    });
  };

  const handleToggleIntegration = (integration: ExternalIntegration) => {
    toggleIntegration(integration.id);
    toast.success(
      integration.status === 'connected' 
        ? 'Integração desconectada' 
        : 'Integração conectada'
    );
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestão de Frota">
        <div className="space-y-4 p-4">
          <Skeleton className="h-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gestão de Frota">
      <div className="space-y-4 p-4 pb-24 md:pb-4">
        {/* Header Stats */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Truck className="h-3 w-3" />
              {stats.totalVehicles} veículos
            </Badge>
            {stats.activeAlerts > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {stats.activeAlerts} alertas
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <Link2 className="h-3 w-3" />
              {connectedIntegrations}/{integrations.length} integrações
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vehicles">
              Veículos
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {vehicles.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alertas
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-5 w-5 p-0 text-xs">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar veículo..."
                      value={filters.search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilters({ status: value as VehicleStatus | 'all' })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <FleetStatsCard stats={stats} />

            {/* Vehicle List */}
            <div className="space-y-3">
              {vehicles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium text-lg">Nenhum veículo encontrado</h3>
                    <p className="text-muted-foreground mt-1">
                      Ajuste os filtros para ver mais veículos.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                vehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onPress={() => setSelectedVehicleId(vehicle.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {/* Alert Filters */}
            <Card>
              <CardContent className="p-3">
                <Select
                  value={filters.alertSeverity}
                  onValueChange={(value) => updateFilters({ alertSeverity: value as AlertSeverity | 'all' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Severidades</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="low">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Alerts List */}
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <h3 className="font-medium text-lg">Nenhum alerta ativo</h3>
                  <p className="text-muted-foreground mt-1">
                    Todos os veículos estão operando normalmente.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <FleetAlertCard
                    key={alert.id}
                    alert={alert}
                    onViewVehicle={() => setSelectedVehicleId(alert.vehicleId)}
                    onResolve={() => {
                      resolveAlert(alert.id);
                      toast.success('Alerta resolvido');
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            {/* Integration Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Integrações Externas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecte sistemas externos de telemetria, manutenção e gestão de combustível.
                </p>
                
                <div className="flex gap-4 text-center">
                  <div className="flex-1 p-3 rounded-lg bg-emerald-500/10">
                    <p className="text-2xl font-bold text-emerald-500">{connectedIntegrations}</p>
                    <p className="text-xs text-muted-foreground">Conectadas</p>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{integrations.length - connectedIntegrations}</p>
                    <p className="text-xs text-muted-foreground">Desconectadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations List */}
            <div className="space-y-3">
              {integrations.map(integration => (
                <IntegrationStatusCard
                  key={integration.id}
                  integration={integration}
                  onTest={() => handleTestIntegration(integration.id)}
                  onToggle={() => handleToggleIntegration(integration)}
                  onConfigure={() => {
                    setSelectedIntegration(integration);
                    setShowIntegrationConfig(true);
                  }}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Vehicle Detail Sheet */}
      <VehicleDetailSheet
        isOpen={!!selectedVehicleId}
        onClose={() => setSelectedVehicleId(null)}
        vehicle={selectedVehicle || null}
        alerts={selectedVehicleAlerts}
      />

      {/* Integration Config Modal */}
      <IntegrationConfigModal
        isOpen={showIntegrationConfig}
        onClose={() => {
          setShowIntegrationConfig(false);
          setSelectedIntegration(null);
        }}
        integration={selectedIntegration}
        onSave={(config) => {
          toast.success('Configuração salva com sucesso');
        }}
        onTest={() => {
          if (selectedIntegration) {
            handleTestIntegration(selectedIntegration.id);
          }
        }}
      />
    </MainLayout>
  );
};

export default FleetManagementPage;
