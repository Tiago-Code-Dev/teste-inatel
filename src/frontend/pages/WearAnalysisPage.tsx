import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  RefreshCw,
  ChevronLeft,
  TrendingUp,
  WifiOff,
  AlertTriangle,
  Clock,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useWearCalculation, useWearThresholds } from '@/hooks/useWearCalculation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  WearCalculationChart,
  TelemetryDataCard,
  WearSettingsModal,
  WearAlertCard,
  WearSummaryCard,
} from '@/components/wear';

type PeriodFilter = '6h' | '24h' | '7d' | '30d';

const periodOptions: { value: PeriodFilter; label: string; hours: number }[] = [
  { value: '6h', label: 'Últimas 6h', hours: 6 },
  { value: '24h', label: 'Últimas 24h', hours: 24 },
  { value: '7d', label: 'Últimos 7 dias', hours: 168 },
  { value: '30d', label: 'Últimos 30 dias', hours: 720 },
];

export default function WearAnalysisPage() {
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('24h');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const isOnline = useOnlineStatus();
  const { thresholds, updateThresholds, resetThresholds } = useWearThresholds();

  const { data: machines = [] } = useQuery({
    queryKey: ['machines-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('machines').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const periodHours = periodOptions.find((p) => p.value === selectedPeriod)?.hours || 24;

  const {
    telemetryData,
    wearCalculation,
    chartData,
    latestReading,
    alerts,
    clearAlerts,
    isLoading,
    refetch,
  } = useWearCalculation(
    selectedMachine === 'all' ? undefined : selectedMachine,
    undefined,
    periodHours
  );

  useEffect(() => {
    if (telemetryData.length > 0) {
      setLastUpdate(new Date());
    }
  }, [telemetryData]);

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  const handleExport = () => {
    if (!chartData.length) return;
    const csvContent = [
      ['Timestamp', 'Avanço (km)', 'Patinagem (%)', 'Pressão (PSI)', 'Velocidade (km/h)'].join(','),
      ...chartData.map((row) =>
        [row.timestamp, row.advance, row.slippage, row.pressure, row.speed].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `desgaste-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-64 pb-24 lg:pb-8">
        {/* Offline Banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-status-warning/10 border-b border-status-warning/30"
            >
              <div className="flex items-center justify-center gap-2 py-2 px-4">
                <WifiOff className="w-4 h-4 text-status-warning" />
                <span className="text-sm text-status-warning font-medium">
                  Sem conexão • Modo offline
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-foreground">Cálculo de Desgaste</h1>
                <p className="text-xs text-muted-foreground">Avanço e Patinagem</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleExport} disabled={!chartData.length}>
                <Download className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-border/50 bg-muted/30">
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Selecionar máquina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Máquinas</SelectItem>
                {machines.map((machine) => (
                  <SelectItem key={machine.id} value={machine.id}>{machine.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
          {/* Alerts */}
          <AnimatePresence mode="popLayout">
            {alerts.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-status-warning" />
                    <span className="text-sm font-medium">Alertas de Desgaste</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAlerts}>Limpar</Button>
                </div>
                {alerts.slice(0, 3).map((alert, index) => (
                  <WearAlertCard key={`${alert.type}-${index}`} alert={alert} onDismiss={clearAlerts} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && telemetryData.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 px-4">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Sem dados disponíveis</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Não há dados de telemetria para o período selecionado.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />Tentar novamente
              </Button>
            </motion.div>
          )}

          {/* Data Display */}
          {!isLoading && telemetryData.length > 0 && wearCalculation && (
            <>
              <WearSummaryCard calculation={wearCalculation} advanceCritical={thresholds.advanceCritical} />
              {latestReading && (
                <TelemetryDataCard
                  pressure={latestReading.pressure}
                  speed={latestReading.speed}
                  optimalPressure={thresholds.optimalPressure}
                />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WearCalculationChart data={chartData} type="advance" threshold={thresholds.advanceCritical} />
                <WearCalculationChart data={chartData} type="slippage" threshold={thresholds.slippageCritical} />
              </div>
            </>
          )}
        </main>

        <WearSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          thresholds={thresholds}
          onSave={updateThresholds}
          onReset={resetThresholds}
        />
      </div>
      <BottomNav />
    </div>
  );
}
