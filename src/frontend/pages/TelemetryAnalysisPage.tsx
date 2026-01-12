import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { TelemetryChart } from '@/components/shared/TelemetryChart';
import { 
  TelemetryGauge, 
  PredictiveAlertCard, 
  AlertSettingsModal 
} from '@/components/telemetry';
import { useRealtimeTelemetry, useAlertThresholds } from '@/hooks/useRealtimeTelemetry';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  RefreshCw,
  Gauge,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  WifiOff,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Machine {
  id: string;
  name: string;
  model: string;
  status: string;
}

const TelemetryAnalysisPage = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [selectedMachineId, setSelectedMachineId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30m');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Get thresholds
  const { thresholds, updateThresholds, resetThresholds } = useAlertThresholds();

  // Fetch machines
  const { data: machines, isLoading: machinesLoading } = useQuery({
    queryKey: ['machines-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, model, status')
        .order('name');
      if (error) throw error;
      return data as Machine[];
    },
    staleTime: 60000,
  });

  // Real-time telemetry
  const {
    telemetryData,
    latestReading,
    stats,
    predictiveAlerts,
    clearPredictiveAlerts,
    isLoading: telemetryLoading,
    refetch,
  } = useRealtimeTelemetry(selectedMachineId === 'all' ? undefined : selectedMachineId);

  // Convert to TelemetryReading format for chart
  const chartData = useMemo(() => {
    return telemetryData.map(reading => ({
      id: reading.id,
      machineId: reading.machine_id,
      tireId: reading.tire_id || undefined,
      timestamp: new Date(reading.timestamp),
      pressure: reading.pressure,
      speed: reading.speed,
      seq: reading.seq,
    })).reverse();
  }, [telemetryData]);

  // Status calculation
  const currentStatus = useMemo(() => {
    if (!latestReading) return 'offline';
    
    const pressure = latestReading.pressure;
    const speed = latestReading.speed;
    
    if (pressure >= thresholds.pressureMax || pressure <= thresholds.pressureMin) {
      return 'critical';
    }
    if (speed >= thresholds.speedMax) {
      return 'critical';
    }
    
    const pressureDeviation = Math.abs(pressure - thresholds.pressureTarget) / thresholds.pressureTarget;
    const speedRatio = speed / thresholds.speedMax;
    
    if (pressureDeviation > 0.1 || speedRatio > 0.8) {
      return 'warning';
    }
    
    return 'ok';
  }, [latestReading, thresholds]);

  const isLoading = machinesLoading || telemetryLoading;

  if (isLoading && !telemetryData.length) {
    return (
      <MobileLayout title="Análise de Telemetria">
        <StateDisplay state="loading" className="h-[60vh]" />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Análise de Pressão e Velocidade"
      subtitle={
        selectedMachineId === 'all'
          ? 'Todas as máquinas'
          : machines?.find(m => m.id === selectedMachineId)?.name
      }
      alertCount={predictiveAlerts.filter(a => a.level === 'critical').length}
    >
      <div className="p-4 space-y-6">
        {/* Back link */}
        <Link
          to="/operations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>

        {/* Offline Banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/30"
            >
              <WifiOff className="w-5 h-5 text-status-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium">Sem conexão</p>
                <p className="text-xs text-muted-foreground">
                  Dados podem estar desatualizados
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Machine Filter */}
            <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Selecionar máquina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as máquinas</SelectItem>
                {machines?.map(machine => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Period Filter */}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30m">Últimos 30 min</SelectItem>
                <SelectItem value="6h">Últimas 6h</SelectItem>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurar</span>
            </Button>
          </div>
        </motion.div>

        {/* Predictive Alerts */}
        <AnimatePresence>
          {predictiveAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-warning" />
                  Alertas Preditivos
                  <Badge variant="secondary">{predictiveAlerts.length}</Badge>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPredictiveAlerts}
                  className="text-xs"
                >
                  Limpar todos
                </Button>
              </div>
              <div className="space-y-2">
                {predictiveAlerts.slice(0, 3).map((alert, index) => (
                  <PredictiveAlertCard
                    key={`${alert.type}-${alert.timestamp.getTime()}-${index}`}
                    alert={alert}
                    onDismiss={() => clearPredictiveAlerts()}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gauges - Real-time values */}
        {latestReading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="card-elevated p-4">
              <TelemetryGauge
                type="pressure"
                value={latestReading.pressure}
                min={thresholds.pressureMin - 5}
                max={thresholds.pressureMax + 5}
                target={thresholds.pressureTarget}
                unit="PSI"
              />
            </div>
            <div className="card-elevated p-4">
              <TelemetryGauge
                type="speed"
                value={latestReading.speed}
                min={0}
                max={thresholds.speedMax + 20}
                unit="km/h"
              />
            </div>
          </motion.div>
        ) : (
          <StateDisplay
            state="empty"
            title="Sem dados de telemetria"
            description="Nenhum dado recebido ainda"
            className="py-8"
          />
        )}

        {/* Quick Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Gauge className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Pressão Média
                </span>
              </div>
              <p className="text-xl font-bold tabular-nums">
                {stats.avgPressure.toFixed(1)} PSI
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Velocidade Média
                </span>
              </div>
              <p className="text-xl font-bold tabular-nums">
                {stats.avgSpeed.toFixed(0)} km/h
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Pressão Máx
                </span>
              </div>
              <p className="text-xl font-bold tabular-nums">
                {stats.maxPressure.toFixed(1)} PSI
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Pressão Mín
                </span>
              </div>
              <p className="text-xl font-bold tabular-nums">
                {stats.minPressure === Infinity ? '--' : stats.minPressure.toFixed(1)} PSI
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs for Charts */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="overview" className="gap-1.5">
              <Gauge className="w-4 h-4" />
              Pressão
            </TabsTrigger>
            <TabsTrigger value="speed" className="gap-1.5">
              <Zap className="w-4 h-4" />
              Velocidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  Histórico de Pressão
                </h3>
                <Badge
                  variant="outline"
                  className={
                    currentStatus === 'ok'
                      ? 'border-status-ok text-status-ok'
                      : currentStatus === 'warning'
                      ? 'border-status-warning text-status-warning'
                      : 'border-status-critical text-status-critical'
                  }
                >
                  {currentStatus === 'ok' ? 'Normal' : currentStatus === 'warning' ? 'Atenção' : 'Crítico'}
                </Badge>
              </div>
              {chartData.length > 0 ? (
                <TelemetryChart
                  data={chartData}
                  type="pressure"
                  thresholds={{
                    target: thresholds.pressureTarget,
                    min: thresholds.pressureMin,
                    max: thresholds.pressureMax,
                  }}
                />
              ) : (
                <StateDisplay
                  state="empty"
                  title="Sem dados"
                  description="Nenhum dado de pressão disponível"
                  className="h-64"
                />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="speed" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-status-warning" />
                  Histórico de Velocidade
                </h3>
                <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                  Limite: {thresholds.speedMax} km/h
                </Badge>
              </div>
              {chartData.length > 0 ? (
                <TelemetryChart
                  data={chartData}
                  type="speed"
                  thresholds={{
                    max: thresholds.speedMax,
                  }}
                />
              ) : (
                <StateDisplay
                  state="empty"
                  title="Sem dados"
                  description="Nenhum dado de velocidade disponível"
                  className="h-64"
                />
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-status-ok rounded-full" />
            Ideal
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-status-warning rounded-full" />
            Limite Mínimo
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-status-critical rounded-full" />
            Limite Máximo
          </div>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AlertSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        thresholds={thresholds}
        onSave={updateThresholds}
        onReset={resetThresholds}
      />
    </MobileLayout>
  );
};

export default TelemetryAnalysisPage;
