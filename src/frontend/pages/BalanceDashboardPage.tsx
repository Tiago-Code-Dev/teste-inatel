import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  Settings,
  Download,
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  Truck,
  Activity,
  Clock,
  TrendingUp,
  Gauge,
  Users,
} from 'lucide-react';
import { useOperationalDashboard } from '@/hooks/useOperationalDashboard';
import {
  KPIWidget,
  PerformanceChart,
  AlertSummaryCard,
  MachinePerformanceList,
  DashboardSettingsModal,
} from '@/components/balance';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function BalanceDashboardPage() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    kpis,
    alertSummary,
    performanceData,
    machinePerformance,
    machines,
    alerts,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    refreshData,
  } = useOperationalDashboard();

  const handleRefresh = () => {
    refreshData();
    toast.success('Dados atualizados');
  };

  const handleExport = () => {
    // Export dashboard data
    const data = {
      kpis,
      alertSummary,
      performanceData,
      machinePerformance,
      exportedAt: new Date().toISOString(),
      period: filters.period,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-operacional-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado');
  };

  const handleMachineSelect = (machineId: string) => {
    navigate(`/machines/${machineId}`);
  };

  const getKPIIcon = (kpiId: string) => {
    switch (kpiId) {
      case 'uptime': return Clock;
      case 'efficiency': return TrendingUp;
      case 'alerts': return AlertTriangle;
      case 'resolution': return Activity;
      case 'critical': return Gauge;
      case 'operational': return Truck;
      default: return LayoutDashboard;
    }
  };

  const getKPIVariant = (kpi: typeof kpis[0]): 'default' | 'success' | 'warning' | 'danger' => {
    if (kpi.id === 'alerts' || kpi.id === 'critical') {
      return kpi.value === 0 ? 'success' : kpi.value <= 3 ? 'warning' : 'danger';
    }
    if (kpi.trend === 'up') return 'success';
    if (kpi.trend === 'down') return 'danger';
    return 'default';
  };

  if (isLoading) {
    return (
      <MainLayout title="Dashboard Operacional">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard Operacional">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              Dashboard Operacional
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitoramento de equilíbrio operacional em tempo real
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filters.period === '6h' ? 'Últimas 6h' : 
               filters.period === '24h' ? 'Últimas 24h' : 
               filters.period === '7d' ? 'Últimos 7d' : 'Últimos 30d'}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((kpi) => (
            <KPIWidget
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              icon={getKPIIcon(kpi.id)}
              variant={getKPIVariant(kpi)}
              size="sm"
            />
          ))}
        </div>

        {/* SLA Warning Banner */}
        {(alertSummary.slaExpired > 0 || alertSummary.slaWarning > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              alertSummary.slaExpired > 0 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${
                alertSummary.slaExpired > 0 ? 'text-red-500' : 'text-yellow-500'
              }`} />
              <div className="flex-1">
                <p className={`font-medium ${
                  alertSummary.slaExpired > 0 ? 'text-red-500' : 'text-yellow-600'
                }`}>
                  {alertSummary.slaExpired > 0 
                    ? `${alertSummary.slaExpired} alertas com SLA vencido`
                    : `${alertSummary.slaWarning} alertas com SLA próximo do vencimento`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Atenção requerida para manter o nível de serviço
                </p>
              </div>
              <Button 
                variant={alertSummary.slaExpired > 0 ? 'destructive' : 'secondary'} 
                size="sm"
                onClick={() => navigate('/alerts')}
              >
                Ver Alertas
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-1.5 text-xs sm:text-sm">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Desempenho</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1.5 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="gap-1.5 text-xs sm:text-sm">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Máquinas</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <PerformanceChart data={performanceData} type="uptime" height={250} />
              <AlertSummaryCard 
                summary={alertSummary}
                onFilterBySeverity={(severity) => {
                  updateFilters({ alertSeverity: [severity] });
                  setActiveTab('alerts');
                }}
              />
            </div>
            <MachinePerformanceList 
              machines={machinePerformance}
              onMachineSelect={handleMachineSelect}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-4 space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <PerformanceChart data={performanceData} type="uptime" height={280} />
              <PerformanceChart data={performanceData} type="efficiency" height={280} />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <PerformanceChart data={performanceData} type="resources" height={250} />
              <PerformanceChart data={performanceData} type="alerts" height={250} />
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-4 space-y-4">
            <AlertSummaryCard 
              summary={alertSummary}
              onFilterBySeverity={(severity) => {
                navigate(`/alerts?severity=${severity}`);
              }}
              onFilterByStatus={(status) => {
                navigate(`/alerts?status=${status}`);
              }}
            />
            <PerformanceChart data={performanceData} type="alerts" height={300} />
            
            {/* Recent Critical Alerts */}
            {alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Alertas Críticos Recentes</h3>
                <div className="space-y-2">
                  {alerts
                    .filter(a => a.severity === 'critical' && a.status !== 'resolved')
                    .slice(0, 5)
                    .map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => navigate('/alerts')}
                        className="w-full p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-left hover:bg-red-500/10 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="font-medium text-sm">{alert.message}</span>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {alert.status === 'open' ? 'Aberto' : 'Reconhecido'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(alert as any).machines?.name || 'Máquina não identificada'}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Machines Tab */}
          <TabsContent value="machines" className="mt-4">
            <MachinePerformanceList 
              machines={machinePerformance}
              onMachineSelect={handleMachineSelect}
            />
          </TabsContent>
        </Tabs>

        {/* Settings Modal */}
        <DashboardSettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          machines={machines.map(m => ({ id: m.id, name: m.name }))}
        />
      </div>
    </MainLayout>
  );
}
