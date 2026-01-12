import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FluidThresholds {
  fluidLevelMin: number;
  fluidLevelMax: number;
  fluidLevelCriticalLow: number;
  fluidLevelCriticalHigh: number;
  temperatureMax: number;
  temperatureCritical: number;
  pressureMin: number;
  pressureMax: number;
  enablePredictiveAlerts: boolean;
  predictiveThreshold: number;
}

export interface FluidReading {
  id: string;
  timestamp: string;
  fluidLevel: number;
  temperature: number;
  pressure: number;
  machineId: string;
}

export interface FluidAlert {
  id: string;
  type: 'fluid_level' | 'temperature' | 'pressure';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
}

export interface FluidCalculation {
  currentLevel: number;
  currentTemperature: number;
  currentPressure: number;
  fluidStatus: 'ideal' | 'low' | 'high' | 'critical_low' | 'critical_high';
  temperatureStatus: 'normal' | 'elevated' | 'critical';
  pressureStatus: 'normal' | 'low' | 'high';
  fluidWearPercent: number;
  estimatedRefillDays: number;
  efficiency: number;
}

const DEFAULT_THRESHOLDS: FluidThresholds = {
  fluidLevelMin: 40,
  fluidLevelMax: 90,
  fluidLevelCriticalLow: 25,
  fluidLevelCriticalHigh: 95,
  temperatureMax: 45,
  temperatureCritical: 55,
  pressureMin: 1.5,
  pressureMax: 4.0,
  enablePredictiveAlerts: true,
  predictiveThreshold: 15,
};

const STORAGE_KEY = 'tirewatch-fluid-thresholds';

export function useFluidThresholds() {
  const [thresholds, setThresholds] = useState<FluidThresholds>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) } : DEFAULT_THRESHOLDS;
    } catch {
      return DEFAULT_THRESHOLDS;
    }
  });

  const updateThresholds = useCallback((newThresholds: Partial<FluidThresholds>) => {
    setThresholds(prev => {
      const updated = { ...prev, ...newThresholds };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetThresholds = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_THRESHOLDS));
  }, []);

  return { thresholds, updateThresholds, resetThresholds };
}

export function useFluidBallast(machineId?: string, periodHours: number = 24) {
  const { thresholds } = useFluidThresholds();
  const [alerts, setAlerts] = useState<FluidAlert[]>([]);

  // Fetch telemetry data and simulate fluid readings
  const { data: telemetryData, isLoading, error, refetch } = useQuery({
    queryKey: ['fluid-telemetry', machineId, periodHours],
    queryFn: async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - periodHours);

      let query = supabase
        .from('telemetry')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true });

      if (machineId) {
        query = query.eq('machine_id', machineId);
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Transform telemetry to fluid readings with simulated fluid level
  const fluidReadings: FluidReading[] = useMemo(() => {
    if (!telemetryData) return [];

    return telemetryData.map((reading, index) => {
      // Simulate fluid level based on pressure and operation time
      const baseFluidLevel = 75;
      const pressureEffect = (Number(reading.pressure) - 28) * 2;
      const timeDecay = index * 0.05; // Gradual decrease over time
      const randomVariation = (Math.random() - 0.5) * 5;
      
      const fluidLevel = Math.max(20, Math.min(100, 
        baseFluidLevel - pressureEffect - timeDecay + randomVariation
      ));

      // Simulate temperature based on speed and pressure
      const baseTemp = 25;
      const speedEffect = Number(reading.speed) * 0.3;
      const pressureTemp = Math.abs(Number(reading.pressure) - 28) * 0.5;
      const temperature = baseTemp + speedEffect + pressureTemp + (Math.random() * 3);

      return {
        id: reading.id,
        timestamp: reading.timestamp,
        fluidLevel: Math.round(fluidLevel * 10) / 10,
        temperature: Math.round(temperature * 10) / 10,
        pressure: Number(reading.pressure),
        machineId: reading.machine_id,
      };
    });
  }, [telemetryData]);

  // Calculate current fluid status
  const calculation: FluidCalculation | null = useMemo(() => {
    if (fluidReadings.length === 0) return null;

    const latest = fluidReadings[fluidReadings.length - 1];
    const { fluidLevel, temperature, pressure } = latest;

    // Determine fluid status
    let fluidStatus: FluidCalculation['fluidStatus'] = 'ideal';
    if (fluidLevel <= thresholds.fluidLevelCriticalLow) {
      fluidStatus = 'critical_low';
    } else if (fluidLevel >= thresholds.fluidLevelCriticalHigh) {
      fluidStatus = 'critical_high';
    } else if (fluidLevel < thresholds.fluidLevelMin) {
      fluidStatus = 'low';
    } else if (fluidLevel > thresholds.fluidLevelMax) {
      fluidStatus = 'high';
    }

    // Determine temperature status
    let temperatureStatus: FluidCalculation['temperatureStatus'] = 'normal';
    if (temperature >= thresholds.temperatureCritical) {
      temperatureStatus = 'critical';
    } else if (temperature >= thresholds.temperatureMax) {
      temperatureStatus = 'elevated';
    }

    // Determine pressure status
    let pressureStatus: FluidCalculation['pressureStatus'] = 'normal';
    if (pressure < thresholds.pressureMin) {
      pressureStatus = 'low';
    } else if (pressure > thresholds.pressureMax) {
      pressureStatus = 'high';
    }

    // Calculate fluid wear based on readings history
    const initialLevel = fluidReadings[0]?.fluidLevel || 100;
    const fluidWearPercent = Math.max(0, ((initialLevel - fluidLevel) / initialLevel) * 100);

    // Estimate days until refill needed
    const avgDailyDecrease = fluidReadings.length > 1 
      ? (fluidReadings[0].fluidLevel - fluidLevel) / (periodHours / 24)
      : 1;
    const remainingToMinimum = fluidLevel - thresholds.fluidLevelMin;
    const estimatedRefillDays = avgDailyDecrease > 0 
      ? Math.max(0, Math.round(remainingToMinimum / avgDailyDecrease))
      : 999;

    // Calculate efficiency based on all factors
    const fluidEfficiency = fluidStatus === 'ideal' ? 100 : fluidStatus === 'low' || fluidStatus === 'high' ? 70 : 40;
    const tempEfficiency = temperatureStatus === 'normal' ? 100 : temperatureStatus === 'elevated' ? 80 : 50;
    const pressureEfficiency = pressureStatus === 'normal' ? 100 : 70;
    const efficiency = Math.round((fluidEfficiency + tempEfficiency + pressureEfficiency) / 3);

    return {
      currentLevel: fluidLevel,
      currentTemperature: temperature,
      currentPressure: pressure,
      fluidStatus,
      temperatureStatus,
      pressureStatus,
      fluidWearPercent: Math.round(fluidWearPercent * 10) / 10,
      estimatedRefillDays,
      efficiency,
    };
  }, [fluidReadings, thresholds]);

  // Generate predictive alerts
  const checkPredictiveAlerts = useCallback((reading: FluidReading) => {
    if (!thresholds.enablePredictiveAlerts) return;

    const newAlerts: FluidAlert[] = [];
    const threshold = thresholds.predictiveThreshold / 100;

    // Check fluid level
    const fluidRange = thresholds.fluidLevelMax - thresholds.fluidLevelMin;
    const fluidWarningLow = thresholds.fluidLevelMin + fluidRange * threshold;
    const fluidWarningHigh = thresholds.fluidLevelMax - fluidRange * threshold;

    if (reading.fluidLevel <= thresholds.fluidLevelCriticalLow) {
      newAlerts.push({
        id: `fluid-critical-low-${Date.now()}`,
        type: 'fluid_level',
        severity: 'critical',
        message: `Nível de fluido crítico: ${reading.fluidLevel}%`,
        value: reading.fluidLevel,
        threshold: thresholds.fluidLevelCriticalLow,
        timestamp: reading.timestamp,
      });
    } else if (reading.fluidLevel < fluidWarningLow) {
      newAlerts.push({
        id: `fluid-warning-low-${Date.now()}`,
        type: 'fluid_level',
        severity: 'warning',
        message: `Nível de fluido baixo: ${reading.fluidLevel}%`,
        value: reading.fluidLevel,
        threshold: thresholds.fluidLevelMin,
        timestamp: reading.timestamp,
      });
    } else if (reading.fluidLevel >= thresholds.fluidLevelCriticalHigh) {
      newAlerts.push({
        id: `fluid-critical-high-${Date.now()}`,
        type: 'fluid_level',
        severity: 'critical',
        message: `Nível de fluido muito alto: ${reading.fluidLevel}%`,
        value: reading.fluidLevel,
        threshold: thresholds.fluidLevelCriticalHigh,
        timestamp: reading.timestamp,
      });
    }

    // Check temperature
    if (reading.temperature >= thresholds.temperatureCritical) {
      newAlerts.push({
        id: `temp-critical-${Date.now()}`,
        type: 'temperature',
        severity: 'critical',
        message: `Temperatura crítica: ${reading.temperature}°C`,
        value: reading.temperature,
        threshold: thresholds.temperatureCritical,
        timestamp: reading.timestamp,
      });
    } else if (reading.temperature >= thresholds.temperatureMax) {
      newAlerts.push({
        id: `temp-warning-${Date.now()}`,
        type: 'temperature',
        severity: 'warning',
        message: `Temperatura elevada: ${reading.temperature}°C`,
        value: reading.temperature,
        threshold: thresholds.temperatureMax,
        timestamp: reading.timestamp,
      });
    }

    // Check pressure
    if (reading.pressure < thresholds.pressureMin) {
      newAlerts.push({
        id: `pressure-low-${Date.now()}`,
        type: 'pressure',
        severity: 'warning',
        message: `Pressão baixa: ${reading.pressure} bar`,
        value: reading.pressure,
        threshold: thresholds.pressureMin,
        timestamp: reading.timestamp,
      });
    } else if (reading.pressure > thresholds.pressureMax) {
      newAlerts.push({
        id: `pressure-high-${Date.now()}`,
        type: 'pressure',
        severity: 'warning',
        message: `Pressão alta: ${reading.pressure} bar`,
        value: reading.pressure,
        threshold: thresholds.pressureMax,
        timestamp: reading.timestamp,
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
    }
  }, [thresholds]);

  // Check for alerts when new readings arrive
  useEffect(() => {
    if (fluidReadings.length > 0) {
      const latest = fluidReadings[fluidReadings.length - 1];
      checkPredictiveAlerts(latest);
    }
  }, [fluidReadings, checkPredictiveAlerts]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    if (fluidReadings.length === 0) {
      return { avgLevel: 0, minLevel: 0, maxLevel: 0, avgTemp: 0, avgPressure: 0 };
    }

    const levels = fluidReadings.map(r => r.fluidLevel);
    const temps = fluidReadings.map(r => r.temperature);
    const pressures = fluidReadings.map(r => r.pressure);

    return {
      avgLevel: Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) / 10,
      minLevel: Math.round(Math.min(...levels) * 10) / 10,
      maxLevel: Math.round(Math.max(...levels) * 10) / 10,
      avgTemp: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
      avgPressure: Math.round((pressures.reduce((a, b) => a + b, 0) / pressures.length) * 10) / 10,
    };
  }, [fluidReadings]);

  return {
    fluidReadings,
    calculation,
    alerts,
    stats,
    isLoading,
    error,
    refetch,
    dismissAlert,
    clearAlerts,
  };
}
