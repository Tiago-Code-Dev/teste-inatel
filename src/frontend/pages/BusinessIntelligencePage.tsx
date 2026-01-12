import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, 
  BarChart3, 
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useBusinessIntelligence } from '@/hooks/useBusinessIntelligence';
import {
  KPIWidget,
  BIChart,
  MachinePerformanceChart,
  BIAlertCard,
  BIReportSheet,
  BISettingsModal,
} from '@/components/bi';

export default function BusinessIntelligencePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [periodDays, setPeriodDays] = useState(7);

  const {
    kpis,
    chartData,
    biAlerts,
    machinePerformance,
    thresholds,
    updateThresholds,
    resetThresholds,
    exportReport,
    isLoading,
  } = useBusinessIntelligence(periodDays);

  const performanceKpis = kpis.filter(k => k.category === 'performance' || k.category === 'efficiency');
  const costKpis = kpis.filter(k => k.category === 'cost');
  const alertKpis = kpis.filter(k => k.category === 'alerts');

  return (
    <MainLayout title="Business Intelligence">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Business Intelligence</h1>
            <p className="text-sm text-muted-foreground">
              Análise operacional e tomada de decisão baseada em dados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(periodDays)} onValueChange={(v) => setPeriodDays(Number(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Últimas 24h</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="14">Últimos 14 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setReportOpen(true)}>
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Relatório</span>
            </Button>
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Indicadores Chave
          </h3>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-[100px]" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {performanceKpis.map((kpi) => (
                  <KPIWidget key={kpi.id} kpi={kpi} />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {costKpis.map((kpi) => (
                  <KPIWidget key={kpi.id} kpi={kpi} />
                ))}
                {alertKpis.map((kpi) => (
                  <KPIWidget key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Máquinas</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
              {biAlerts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-status-critical text-white rounded-full">
                  {biAlerts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-[380px]" />
                <Skeleton className="h-[380px]" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <BIChart data={chartData} title="Análise Operacional" />
                <MachinePerformanceChart data={machinePerformance} />
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
            ) : machinePerformance.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhuma máquina encontrada</h3>
                <p className="text-muted-foreground text-sm">
                  Cadastre máquinas para visualizar o desempenho
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {machinePerformance.map(machine => (
                  <div 
                    key={machine.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        machine.status === 'excellent' ? 'bg-status-normal' :
                        machine.status === 'good' ? 'bg-primary' :
                        machine.status === 'average' ? 'bg-status-warning' :
                        'bg-status-critical'
                      }`} />
                      <div>
                        <p className="font-medium">{machine.name}</p>
                        <p className="text-xs text-muted-foreground">{machine.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Eficiência</p>
                        <p className="font-semibold">{machine.efficiency.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Custo/Hora</p>
                        <p className="font-semibold">R$ {machine.costPerHour.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Horas</p>
                        <p className="font-semibold">{machine.operatingHours.toFixed(0)}h</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Alerts/Insights Tab */}
          <TabsContent value="alerts" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[140px]" />
                ))}
              </div>
            ) : biAlerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-status-normal mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Tudo funcionando bem!</h3>
                <p className="text-muted-foreground text-sm">
                  Nenhum insight ou alerta para exibir no momento
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {biAlerts.map(alert => (
                  <BIAlertCard
                    key={alert.id}
                    alert={alert}
                    onView={() => setReportOpen(true)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Report Sheet */}
        <BIReportSheet
          open={reportOpen}
          onOpenChange={setReportOpen}
          kpis={kpis}
          chartData={chartData}
          machinePerformance={machinePerformance}
          onExport={exportReport}
          periodDays={periodDays}
        />

        {/* Settings Modal */}
        <BISettingsModal
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
