import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TelemetryData {
  id: string;
  machine_id: string;
  tire_id: string | null;
  pressure: number;
  speed: number;
  timestamp: string;
  seq: number;
}

interface WearThresholds {
  advanceCritical: number; // km before critical wear
  slippageCritical: number; // percentage
  slippageWarning: number; // percentage
  optimalPressure: number;
  pressureTolerance: number; // percentage deviation allowed
  alertsEnabled: boolean;
}

interface WearCalculation {
  totalDistance: number; // km
  slippageIndex: number; // 0-100%
  estimatedLifeRemaining: number; // percentage
  wearRate: number; // km/hour equivalent
  efficiency: number; // 0-100%
}

interface WearAlert {
  type: 'advance' | 'slippage';
  level: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

const DEFAULT_THRESHOLDS: WearThresholds = {
  advanceCritical: 5000, // 5000 km critical
  slippageCritical: 25, // 25% critical slippage
  slippageWarning: 15, // 15% warning slippage
  optimalPressure: 28,
  pressureTolerance: 0.1, // 10% tolerance
  alertsEnabled: true,
};

const WEAR_STORAGE_KEY = 'tirewatch-wear-thresholds';

export function useWearThresholds() {
  const [thresholds, setThresholds] = useState<WearThresholds>(() => {
    try {
      const stored = localStorage.getItem(WEAR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_THRESHOLDS;
    } catch {
      return DEFAULT_THRESHOLDS;
    }
  });

  const updateThresholds = useCallback((newThresholds: Partial<WearThresholds>) => {
    setThresholds(prev => {
      const updated = { ...prev, ...newThresholds };
      localStorage.setItem(WEAR_STORAGE_KEY, JSON.stringify(updated));
      toast.success('Configurações de desgaste salvas');
      return updated;
    });
  }, []);

  const resetThresholds = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.setItem(WEAR_STORAGE_KEY, JSON.stringify(DEFAULT_THRESHOLDS));
    toast.info('Configurações restauradas para padrão');
  }, []);

  return { thresholds, updateThresholds, resetThresholds };
}

export function useWearCalculation(machineId?: string, tireId?: string, periodHours: number = 24) {
  const { thresholds } = useWearThresholds();
  const [alerts, setAlerts] = useState<WearAlert[]>([]);

  // Fetch telemetry data for calculation
  const { data: telemetryData, isLoading, refetch } = useQuery({
    queryKey: ['wear-telemetry', machineId, tireId, periodHours],
    queryFn: async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - periodHours);

      let query = supabase
        .from('telemetry')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true })
        .limit(1000);

      if (machineId) {
        query = query.eq('machine_id', machineId);
      }
      if (tireId) {
        query = query.eq('tire_id', tireId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TelemetryData[];
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Calculate wear metrics
  const wearCalculation = useMemo((): WearCalculation | null => {
    if (!telemetryData || telemetryData.length < 2) return null;

    let totalDistance = 0;
    let totalSlippage = 0;
    let slippageReadings = 0;

    for (let i = 1; i < telemetryData.length; i++) {
      const prev = telemetryData[i - 1];
      const curr = telemetryData[i];
      
      // Calculate time difference in hours
      const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / (1000 * 60 * 60);
      
      // Calculate distance: speed * time
      const avgSpeed = (prev.speed + curr.speed) / 2;
      const distance = avgSpeed * timeDiff;
      totalDistance += distance;

      // Calculate slippage based on pressure deviation from optimal
      // Lower pressure = higher slippage, higher pressure = lower efficiency
      const pressureDeviation = Math.abs(curr.pressure - thresholds.optimalPressure) / thresholds.optimalPressure;
      
      // Slippage formula: base slippage + pressure-induced slippage
      // At optimal pressure: ~2-5% base slippage
      // Each 1% pressure deviation adds ~0.5% slippage
      const baseSlippage = 3;
      const pressureSlippage = pressureDeviation * 50; // 10% deviation = 5% additional slippage
      const speedFactor = Math.min(curr.speed / 30, 1.5); // Higher speed increases slippage
      
      const currentSlippage = Math.min(100, (baseSlippage + pressureSlippage) * speedFactor);
      totalSlippage += currentSlippage;
      slippageReadings++;
    }

    const avgSlippage = slippageReadings > 0 ? totalSlippage / slippageReadings : 0;
    
    // Estimate remaining life based on total distance and critical threshold
    const lifeUsed = (totalDistance / thresholds.advanceCritical) * 100;
    const estimatedLifeRemaining = Math.max(0, 100 - lifeUsed);
    
    // Calculate wear rate (km per hour of operation)
    const periodDuration = telemetryData.length > 1
      ? (new Date(telemetryData[telemetryData.length - 1].timestamp).getTime() - 
         new Date(telemetryData[0].timestamp).getTime()) / (1000 * 60 * 60)
      : 1;
    const wearRate = totalDistance / Math.max(periodDuration, 0.1);
    
    // Efficiency: inverse of slippage (100% efficiency = 0% slippage)
    const efficiency = Math.max(0, 100 - avgSlippage);

    return {
      totalDistance: Math.round(totalDistance * 10) / 10,
      slippageIndex: Math.round(avgSlippage * 10) / 10,
      estimatedLifeRemaining: Math.round(estimatedLifeRemaining * 10) / 10,
      wearRate: Math.round(wearRate * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
    };
  }, [telemetryData, thresholds]);

  // Generate time-series data for charts
  const chartData = useMemo(() => {
    if (!telemetryData || telemetryData.length < 2) return [];

    let cumulativeDistance = 0;
    const data: Array<{
      timestamp: string;
      time: string;
      advance: number;
      slippage: number;
      pressure: number;
      speed: number;
    }> = [];

    for (let i = 0; i < telemetryData.length; i++) {
      const curr = telemetryData[i];
      
      if (i > 0) {
        const prev = telemetryData[i - 1];
        const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / (1000 * 60 * 60);
        const avgSpeed = (prev.speed + curr.speed) / 2;
        cumulativeDistance += avgSpeed * timeDiff;
      }

      // Calculate instantaneous slippage
      const pressureDeviation = Math.abs(curr.pressure - thresholds.optimalPressure) / thresholds.optimalPressure;
      const baseSlippage = 3;
      const pressureSlippage = pressureDeviation * 50;
      const speedFactor = Math.min(curr.speed / 30, 1.5);
      const slippage = Math.min(100, (baseSlippage + pressureSlippage) * speedFactor);

      data.push({
        timestamp: curr.timestamp,
        time: new Date(curr.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        advance: Math.round(cumulativeDistance * 10) / 10,
        slippage: Math.round(slippage * 10) / 10,
        pressure: curr.pressure,
        speed: curr.speed,
      });
    }

    return data;
  }, [telemetryData, thresholds]);

  // Check for alerts
  const checkAlerts = useCallback(() => {
    if (!wearCalculation || !thresholds.alertsEnabled) return;

    const newAlerts: WearAlert[] = [];

    // Check advance/distance alerts
    if (wearCalculation.totalDistance >= thresholds.advanceCritical * 0.9) {
      newAlerts.push({
        type: 'advance',
        level: wearCalculation.totalDistance >= thresholds.advanceCritical ? 'critical' : 'warning',
        message: `Avanço ${wearCalculation.totalDistance >= thresholds.advanceCritical ? 'crítico' : 'próximo do limite'}: ${wearCalculation.totalDistance.toFixed(1)} km`,
        value: wearCalculation.totalDistance,
        threshold: thresholds.advanceCritical,
        timestamp: new Date(),
      });
    }

    // Check slippage alerts
    if (wearCalculation.slippageIndex >= thresholds.slippageCritical) {
      newAlerts.push({
        type: 'slippage',
        level: 'critical',
        message: `Patinagem crítica: ${wearCalculation.slippageIndex.toFixed(1)}%`,
        value: wearCalculation.slippageIndex,
        threshold: thresholds.slippageCritical,
        timestamp: new Date(),
      });
    } else if (wearCalculation.slippageIndex >= thresholds.slippageWarning) {
      newAlerts.push({
        type: 'slippage',
        level: 'warning',
        message: `Patinagem elevada: ${wearCalculation.slippageIndex.toFixed(1)}%`,
        value: wearCalculation.slippageIndex,
        threshold: thresholds.slippageWarning,
        timestamp: new Date(),
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
      
      newAlerts.filter(a => a.level === 'critical').forEach(alert => {
        toast.error(alert.message, { duration: 5000 });
      });
    }
  }, [wearCalculation, thresholds]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Latest telemetry reading
  const latestReading = telemetryData?.[telemetryData.length - 1] || null;

  return {
    telemetryData: telemetryData || [],
    wearCalculation,
    chartData,
    latestReading,
    alerts,
    clearAlerts,
    checkAlerts,
    isLoading,
    refetch,
    thresholds,
  };
}
