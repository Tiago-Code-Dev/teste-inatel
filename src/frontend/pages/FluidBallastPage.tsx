import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  RefreshCw, 
  Download, 
  Filter,
  AlertTriangle,
  ChevronLeft,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useFluidBallast, useFluidThresholds } from '@/hooks/useFluidBallast';
import { useRealtimeMachines } from '@/hooks/useRealtimeMachines';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { 
  FluidLevelChart, 
  FluidTemperatureChart, 
  FluidSettingsModal, 
  FluidAlertCard,
  FluidSummaryCard,
  FluidTelemetryCard
} from '@/components/fluid';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PERIOD_OPTIONS = [
  { value: '6', label: 'Últimas 6h' },
  { value: '24', label: 'Últimas 24h' },
  { value: '168', label: 'Últimos 7 dias' },
  { value: '720', label: 'Últimos 30 dias' },
];

export default function FluidBallastPage() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { thresholds } = useFluidThresholds();
  
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('24');

  // Subscribe to realtime updates
  useRealtimeMachines();
  
  const { 
    fluidReadings, 
    calculation, 
    alerts, 
    stats,
    isLoading, 
    error,
    refetch,
    dismissAlert,
    clearAlerts
  } = useFluidBallast(
    selectedMachine !== 'all' ? selectedMachine : undefined,
    parseInt(selectedPeriod)
  );

  const handleRefresh = () => {
    refetch();
    toast.success('Dados atualizados');
  };

  const handleExport = () => {
    if (fluidReadings.length === 0) {
      toast.error('Sem dados para exportar');
      return;
    }

    const headers = ['Timestamp', 'Nível de Fluido (%)', 'Temperatura (°C)', 'Pressão (bar)'];
    const csvData = fluidReadings.map(reading => [
      format(new Date(reading.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      reading.fluidLevel.toFixed(1),
      reading.temperature.toFixed(1),
      reading.pressure.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lastro-liquido-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado com sucesso');
  };

  // Offline Banner
  const OfflineBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-3 mb-4"
    >
      <div className="flex items-center gap-2 text-status-warning">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">
          Sem conexão • Trabalhando em modo offline
        </span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="md:hidden"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  Análise de Lastro Líquido
                </h1>
                <p className="text-xs text-muted-foreground">
                  Monitoramento em tempo real do nível de fluido
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <FluidSettingsModal />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="flex-1 h-9">
                <SelectValue placeholder="Selecionar máquina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as máquinas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Offline Banner */}
        {!isOnline && <OfflineBanner />}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <StateDisplay
            state="error"
            title="Erro ao carregar dados"
            description="Não foi possível carregar os dados de lastro líquido"
            action={{ label: "Tentar novamente", onClick: () => refetch() }}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && fluidReadings.length === 0 && (
          <StateDisplay
            state="empty"
            title="Sem dados disponíveis"
            description="Não há dados de lastro líquido para o período selecionado"
          />
        )}

        {/* Data Content */}
        {!isLoading && !error && fluidReadings.length > 0 && calculation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Predictive Alerts */}
            <AnimatePresence>
              {alerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-warning" />
                      Alertas Preditivos ({alerts.length})
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAlerts}
                      className="text-xs h-7"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Limpar
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {alerts.slice(0, 5).map((alert) => (
                      <FluidAlertCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={dismissAlert}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Real-time Telemetry Card */}
            <FluidTelemetryCard
              fluidLevel={calculation.currentLevel}
              temperature={calculation.currentTemperature}
              pressure={calculation.currentPressure}
            />

            {/* Summary Card */}
            <FluidSummaryCard calculation={calculation} />

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Média</p>
                  <p className="text-lg font-bold text-primary">{stats.avgLevel}%</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Mínimo</p>
                  <p className="text-lg font-bold text-status-warning">{stats.minLevel}%</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Máximo</p>
                  <p className="text-lg font-bold text-status-ok">{stats.maxLevel}%</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Temp. Méd</p>
                  <p className="text-lg font-bold">{stats.avgTemp}°C</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <FluidLevelChart
              data={fluidReadings}
              thresholds={thresholds}
            />

            <FluidTemperatureChart
              data={fluidReadings}
              thresholds={thresholds}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
