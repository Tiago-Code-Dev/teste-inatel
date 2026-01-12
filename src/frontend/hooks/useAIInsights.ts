import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DashboardStats, MachineTelemetryData } from '@/contexts/DashboardContext';

interface FleetDataForAI {
  totalMachines: number;
  machinesOperational: number;
  machinesWarning: number;
  machinesCritical: number;
  machinesOffline: number;
  activeAlerts: number;
  criticalAlerts: number;
  fleetHealthScore: number;
  telemetryData?: {
    machineId: string;
    machineName: string;
    pressure: number[];
    speed: number[];
    status: string;
  }[];
}

interface InsightResult {
  insight: string;
  timestamp: string;
}

interface PredictionItem {
  machine: string;
  risk: string;
  days: number;
  confidence: 'alta' | 'média' | 'baixa';
  reason: string;
}

interface AnomalyItem {
  machine: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
}

interface RecommendationItem {
  action: string;
  impact: string;
  priority: 'alta' | 'média' | 'baixa';
  category: 'manutenção' | 'operação' | 'segurança' | 'custo';
}

interface UseAIInsightsReturn {
  // Data
  insights: InsightResult | null;
  predictions: PredictionItem[];
  anomalies: AnomalyItem[];
  recommendations: RecommendationItem[];
  
  // Loading states
  isLoadingInsights: boolean;
  isLoadingPredictions: boolean;
  isLoadingAnomalies: boolean;
  isLoadingRecommendations: boolean;
  isLoading: boolean;
  
  // Actions
  fetchInsights: (stats: DashboardStats, telemetry?: Map<string, MachineTelemetryData>, machines?: { id: string; name: string; status: string }[]) => Promise<void>;
  fetchPredictions: (stats: DashboardStats, telemetry?: Map<string, MachineTelemetryData>, machines?: { id: string; name: string; status: string }[]) => Promise<void>;
  fetchAnomalies: (stats: DashboardStats, telemetry?: Map<string, MachineTelemetryData>, machines?: { id: string; name: string; status: string }[]) => Promise<void>;
  fetchRecommendations: (stats: DashboardStats, telemetry?: Map<string, MachineTelemetryData>, machines?: { id: string; name: string; status: string }[]) => Promise<void>;
  fetchAll: (stats: DashboardStats, telemetry?: Map<string, MachineTelemetryData>, machines?: { id: string; name: string; status: string }[]) => Promise<void>;
  clearAll: () => void;
  
  // Errors
  error: string | null;
}

function buildFleetData(
  stats: DashboardStats, 
  telemetry?: Map<string, MachineTelemetryData>,
  machines?: { id: string; name: string; status: string }[]
): FleetDataForAI {
  const telemetryData = machines && telemetry 
    ? machines.slice(0, 10).map(m => {
        const t = telemetry.get(m.id);
        return {
          machineId: m.id,
          machineName: m.name,
          pressure: t?.pressure || [],
          speed: t?.speed || [],
          status: m.status,
        };
      }).filter(t => t.pressure.length > 0 || t.speed.length > 0)
    : undefined;

  return {
    totalMachines: stats.totalMachines,
    machinesOperational: stats.machinesOperational,
    machinesWarning: stats.machinesWarning,
    machinesCritical: stats.machinesCritical,
    machinesOffline: stats.machinesOffline,
    activeAlerts: stats.activeAlerts,
    criticalAlerts: stats.criticalAlerts,
    fleetHealthScore: stats.fleetHealthScore,
    telemetryData,
  };
}

export function useAIInsights(): UseAIInsightsReturn {
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const callAIFunction = useCallback(async (
    type: 'insights' | 'prediction' | 'anomaly' | 'recommendations',
    fleetData: FleetDataForAI
  ) => {
    const { data, error } = await supabase.functions.invoke('ai-insights', {
      body: { type, fleetData },
    });

    if (error) {
      throw new Error(error.message || 'AI function error');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  }, []);

  const fetchInsights = useCallback(async (
    stats: DashboardStats,
    telemetry?: Map<string, MachineTelemetryData>,
    machines?: { id: string; name: string; status: string }[]
  ) => {
    setIsLoadingInsights(true);
    setError(null);
    
    try {
      const fleetData = buildFleetData(stats, telemetry, machines);
      const result = await callAIFunction('insights', fleetData);
      
      setInsights({
        insight: result.insight,
        timestamp: result.timestamp,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch insights';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error('Limite de requisições excedido. Tente novamente em breve.');
      } else if (message.includes('credits')) {
        toast.error('Créditos de IA esgotados. Adicione créditos para continuar.');
      }
    } finally {
      setIsLoadingInsights(false);
    }
  }, [callAIFunction]);

  const fetchPredictions = useCallback(async (
    stats: DashboardStats,
    telemetry?: Map<string, MachineTelemetryData>,
    machines?: { id: string; name: string; status: string }[]
  ) => {
    setIsLoadingPredictions(true);
    setError(null);
    
    try {
      const fleetData = buildFleetData(stats, telemetry, machines);
      const result = await callAIFunction('prediction', fleetData);
      
      setPredictions(result.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch predictions';
      setError(message);
    } finally {
      setIsLoadingPredictions(false);
    }
  }, [callAIFunction]);

  const fetchAnomalies = useCallback(async (
    stats: DashboardStats,
    telemetry?: Map<string, MachineTelemetryData>,
    machines?: { id: string; name: string; status: string }[]
  ) => {
    setIsLoadingAnomalies(true);
    setError(null);
    
    try {
      const fleetData = buildFleetData(stats, telemetry, machines);
      const result = await callAIFunction('anomaly', fleetData);
      
      setAnomalies(result.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch anomalies';
      setError(message);
    } finally {
      setIsLoadingAnomalies(false);
    }
  }, [callAIFunction]);

  const fetchRecommendations = useCallback(async (
    stats: DashboardStats,
    telemetry?: Map<string, MachineTelemetryData>,
    machines?: { id: string; name: string; status: string }[]
  ) => {
    setIsLoadingRecommendations(true);
    setError(null);
    
    try {
      const fleetData = buildFleetData(stats, telemetry, machines);
      const result = await callAIFunction('recommendations', fleetData);
      
      setRecommendations(result.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      setError(message);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [callAIFunction]);

  const fetchAll = useCallback(async (
    stats: DashboardStats,
    telemetry?: Map<string, MachineTelemetryData>,
    machines?: { id: string; name: string; status: string }[]
  ) => {
    // Fetch in parallel for speed
    await Promise.all([
      fetchInsights(stats, telemetry, machines),
      fetchPredictions(stats, telemetry, machines),
      fetchAnomalies(stats, telemetry, machines),
      fetchRecommendations(stats, telemetry, machines),
    ]);
  }, [fetchInsights, fetchPredictions, fetchAnomalies, fetchRecommendations]);

  const clearAll = useCallback(() => {
    setInsights(null);
    setPredictions([]);
    setAnomalies([]);
    setRecommendations([]);
    setError(null);
  }, []);

  const isLoading = isLoadingInsights || isLoadingPredictions || isLoadingAnomalies || isLoadingRecommendations;

  return {
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
    clearAll,
    error,
  };
}
