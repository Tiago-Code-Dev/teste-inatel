import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TelemetryReading {
  id: string;
  machine_id: string;
  tire_id: string | null;
  pressure: number;
  speed: number;
  timestamp: string;
  seq: number;
}

interface AlertThresholds {
  pressureMin: number;
  pressureMax: number;
  pressureTarget: number;
  speedMax: number;
  predictiveEnabled: boolean;
  predictiveThreshold: number; // percentage (e.g., 0.5 = 50%)
}

interface PredictiveAlert {
  type: 'pressure' | 'speed';
  level: 'warning' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  pressureMin: 22,
  pressureMax: 35,
  pressureTarget: 28,
  speedMax: 40,
  predictiveEnabled: true,
  predictiveThreshold: 0.5, // Alert at 50% of threshold
};

const STORAGE_KEY = 'tirewatch-alert-thresholds';

export function useAlertThresholds() {
  const [thresholds, setThresholds] = useState<AlertThresholds>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_THRESHOLDS;
    } catch {
      return DEFAULT_THRESHOLDS;
    }
  });

  const updateThresholds = useCallback((newThresholds: Partial<AlertThresholds>) => {
    setThresholds(prev => {
      const updated = { ...prev, ...newThresholds };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success('Configurações de alerta salvas');
      return updated;
    });
  }, []);

  const resetThresholds = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_THRESHOLDS));
    toast.info('Configurações restauradas para padrão');
  }, []);

  return { thresholds, updateThresholds, resetThresholds };
}

export function useRealtimeTelemetry(machineId?: string) {
  const queryClient = useQueryClient();
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const { thresholds } = useAlertThresholds();

  // Fetch telemetry data
  const { data: telemetryData, isLoading, refetch } = useQuery({
    queryKey: ['telemetry', machineId],
    queryFn: async () => {
      let query = supabase
        .from('telemetry')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (machineId) {
        query = query.eq('machine_id', machineId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TelemetryReading[];
    },
    staleTime: 5000,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Check for predictive alerts
  const checkPredictiveAlerts = useCallback((reading: TelemetryReading) => {
    if (!thresholds.predictiveEnabled) return;

    const newAlerts: PredictiveAlert[] = [];
    const predictiveRange = thresholds.predictiveThreshold;

    // Check pressure - approaching limits
    const pressureRange = thresholds.pressureMax - thresholds.pressureMin;
    const pressureFromMax = thresholds.pressureMax - reading.pressure;
    const pressureFromMin = reading.pressure - thresholds.pressureMin;

    // Critical: exceeded limits
    if (reading.pressure >= thresholds.pressureMax) {
      newAlerts.push({
        type: 'pressure',
        level: 'critical',
        message: `Pressão crítica: ${reading.pressure.toFixed(1)} PSI (limite: ${thresholds.pressureMax} PSI)`,
        currentValue: reading.pressure,
        threshold: thresholds.pressureMax,
        timestamp: new Date(),
      });
    } else if (reading.pressure <= thresholds.pressureMin) {
      newAlerts.push({
        type: 'pressure',
        level: 'critical',
        message: `Pressão crítica baixa: ${reading.pressure.toFixed(1)} PSI (mínimo: ${thresholds.pressureMin} PSI)`,
        currentValue: reading.pressure,
        threshold: thresholds.pressureMin,
        timestamp: new Date(),
      });
    }
    // Warning: approaching limits (within predictive threshold)
    else if (pressureFromMax <= pressureRange * predictiveRange) {
      newAlerts.push({
        type: 'pressure',
        level: 'warning',
        message: `Pressão aproximando do limite: ${reading.pressure.toFixed(1)} PSI`,
        currentValue: reading.pressure,
        threshold: thresholds.pressureMax,
        timestamp: new Date(),
      });
    } else if (pressureFromMin <= pressureRange * predictiveRange) {
      newAlerts.push({
        type: 'pressure',
        level: 'warning',
        message: `Pressão aproximando do mínimo: ${reading.pressure.toFixed(1)} PSI`,
        currentValue: reading.pressure,
        threshold: thresholds.pressureMin,
        timestamp: new Date(),
      });
    }

    // Check speed
    if (reading.speed >= thresholds.speedMax) {
      newAlerts.push({
        type: 'speed',
        level: 'critical',
        message: `Velocidade crítica: ${reading.speed.toFixed(0)} km/h (limite: ${thresholds.speedMax} km/h)`,
        currentValue: reading.speed,
        threshold: thresholds.speedMax,
        timestamp: new Date(),
      });
    } else if (reading.speed >= thresholds.speedMax * (1 - predictiveRange)) {
      newAlerts.push({
        type: 'speed',
        level: 'warning',
        message: `Velocidade aproximando do limite: ${reading.speed.toFixed(0)} km/h`,
        currentValue: reading.speed,
        threshold: thresholds.speedMax,
        timestamp: new Date(),
      });
    }

    if (newAlerts.length > 0) {
      setPredictiveAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
      
      // Show toast for critical alerts
      newAlerts.filter(a => a.level === 'critical').forEach(alert => {
        toast.error(alert.message, { duration: 5000 });
      });
    }
  }, [thresholds]);

  // Real-time subscription
  useEffect(() => {
    console.log('[Realtime] Setting up telemetry subscription...');
    
    const channel = supabase
      .channel('telemetry-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          ...(machineId ? { filter: `machine_id=eq.${machineId}` } : {}),
        },
        (payload) => {
          console.log('[Realtime] New telemetry:', payload);
          
          const reading = payload.new as TelemetryReading;
          checkPredictiveAlerts(reading);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['telemetry'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Telemetry subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Cleaning up telemetry subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, machineId, checkPredictiveAlerts]);

  // Get latest reading
  const latestReading = telemetryData?.[0];

  // Calculate stats
  const stats = telemetryData?.reduce(
    (acc, reading) => ({
      avgPressure: acc.avgPressure + reading.pressure / (telemetryData.length || 1),
      avgSpeed: acc.avgSpeed + reading.speed / (telemetryData.length || 1),
      maxPressure: Math.max(acc.maxPressure, reading.pressure),
      minPressure: Math.min(acc.minPressure, reading.pressure),
      maxSpeed: Math.max(acc.maxSpeed, reading.speed),
    }),
    { avgPressure: 0, avgSpeed: 0, maxPressure: 0, minPressure: Infinity, maxSpeed: 0 }
  );

  const clearPredictiveAlerts = useCallback(() => {
    setPredictiveAlerts([]);
  }, []);

  return {
    telemetryData: telemetryData || [],
    latestReading,
    stats,
    predictiveAlerts,
    clearPredictiveAlerts,
    isLoading,
    refetch,
    thresholds,
  };
}
