import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AIInsightsWidget, 
  PredictionsCard, 
  AnomaliesCard, 
  RecommendationsCard 
} from './AIInsightsWidgets';
import { useAIInsights } from '@/hooks/useAIInsights';
import { DashboardStats, MachineTelemetryData, DashboardMachine } from '@/contexts/DashboardContext';
import { cn } from '@/lib/utils';

interface IntelligenceLayerProps {
  stats: DashboardStats;
  machines: DashboardMachine[];
  telemetryByMachine: Map<string, MachineTelemetryData>;
  className?: string;
}

export function IntelligenceLayer({
  stats,
  machines,
  telemetryByMachine,
  className,
}: IntelligenceLayerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const {
    insights,
    predictions,
    anomalies,
    recommendations,
    isLoadingInsights,
    isLoadingPredictions,
    isLoadingAnomalies,
    isLoadingRecommendations,
    isLoading,
    fetchInsights,
    fetchPredictions,
    fetchAnomalies,
    fetchRecommendations,
    fetchAll,
  } = useAIInsights();

  const machineData = machines.map(m => ({ 
    id: m.id, 
    name: m.name, 
    status: m.status 
  }));

  // Initial load on mount (only once)
  useEffect(() => {
    if (!hasInitialLoad && stats.totalMachines > 0) {
      setHasInitialLoad(true);
      // Only fetch insights initially (lighter)
      fetchInsights(stats, telemetryByMachine, machineData);
    }
  }, [hasInitialLoad, stats.totalMachines]);

  const handleRefreshAll = useCallback(() => {
    fetchAll(stats, telemetryByMachine, machineData);
  }, [fetchAll, stats, telemetryByMachine, machineData]);

  const handleRefreshInsights = useCallback(() => {
    fetchInsights(stats, telemetryByMachine, machineData);
  }, [fetchInsights, stats, telemetryByMachine, machineData]);

  const handleRefreshPredictions = useCallback(() => {
    fetchPredictions(stats, telemetryByMachine, machineData);
  }, [fetchPredictions, stats, telemetryByMachine, machineData]);

  const handleRefreshAnomalies = useCallback(() => {
    fetchAnomalies(stats, telemetryByMachine, machineData);
  }, [fetchAnomalies, stats, telemetryByMachine, machineData]);

  const handleRefreshRecommendations = useCallback(() => {
    fetchRecommendations(stats, telemetryByMachine, machineData);
  }, [fetchRecommendations, stats, telemetryByMachine, machineData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Intelligence Layer
              <Sparkles className="w-4 h-4 text-primary" />
            </h2>
            <p className="text-xs text-muted-foreground">
              Powered by AI • Análise em tempo real
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="ml-2"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </motion.div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          {isLoading ? 'Analisando...' : 'Analisar Tudo'}
        </Button>
      </div>

      {/* Collapsible content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Main insight - full width on mobile */}
          <AIInsightsWidget
            insight={insights?.insight || null}
            timestamp={insights?.timestamp || null}
            isLoading={isLoadingInsights}
            onRefresh={handleRefreshInsights}
            className="lg:col-span-2"
          />

          {/* Predictions */}
          <PredictionsCard
            predictions={predictions}
            isLoading={isLoadingPredictions}
            onRefresh={handleRefreshPredictions}
          />

          {/* Anomalies */}
          <AnomaliesCard
            anomalies={anomalies}
            isLoading={isLoadingAnomalies}
            onRefresh={handleRefreshAnomalies}
          />

          {/* Recommendations - full width */}
          <RecommendationsCard
            recommendations={recommendations}
            isLoading={isLoadingRecommendations}
            onRefresh={handleRefreshRecommendations}
            className="lg:col-span-2"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
