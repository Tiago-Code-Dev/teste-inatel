import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CalibrationStatus = 'optimal' | 'adjusting' | 'warning' | 'critical' | 'pending';

export interface TireCalibrationData {
  id: string;
  tireId: string;
  serial: string;
  position: string;
  machineId: string;
  machineName: string;
  currentPressure: number;
  recommendedPressure: number;
  temperature: number;
  status: CalibrationStatus;
  lastCalibration: string;
  autoAdjustEnabled: boolean;
  pressureHistory: { timestamp: string; pressure: number; temperature: number }[];
}

export interface CalibrationAlert {
  id: string;
  tireId: string;
  serial: string;
  machineName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'pressure_low' | 'pressure_high' | 'temperature_high' | 'calibration_needed';
  message: string;
  currentValue: number;
  recommendedValue: number;
  timestamp: string;
  isResolved: boolean;
}

export interface CalibrationThresholds {
  pressureLowerLimit: number;
  pressureUpperLimit: number;
  temperatureLowerLimit: number;
  temperatureUpperLimit: number;
  autoAdjustEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface CalibrationStats {
  totalTires: number;
  optimal: number;
  adjusting: number;
  warning: number;
  critical: number;
  avgPressure: number;
  avgTemperature: number;
  activeAlerts: number;
}

const DEFAULT_THRESHOLDS: CalibrationThresholds = {
  pressureLowerLimit: 25,
  pressureUpperLimit: 40,
  temperatureLowerLimit: 20,
  temperatureUpperLimit: 80,
  autoAdjustEnabled: true,
  notificationsEnabled: true
};

// Generate pressure history data
const generatePressureHistory = (currentPressure: number, hours: number = 24) => {
  const history: { timestamp: string; pressure: number; temperature: number }[] = [];
  const now = Date.now();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString();
    const variance = (Math.random() - 0.5) * 4;
    const pressure = Math.max(20, Math.min(45, currentPressure + variance));
    const temperature = 30 + Math.random() * 40;
    
    history.push({
      timestamp,
      pressure: Math.round(pressure * 10) / 10,
      temperature: Math.round(temperature * 10) / 10
    });
  }
  
  return history;
};

// Calculate calibration status
const getCalibrationStatus = (
  pressure: number, 
  recommended: number, 
  thresholds: CalibrationThresholds
): CalibrationStatus => {
  const deviation = Math.abs(pressure - recommended);
  const percentDeviation = (deviation / recommended) * 100;
  
  if (pressure < thresholds.pressureLowerLimit || pressure > thresholds.pressureUpperLimit) {
    return 'critical';
  }
  if (percentDeviation > 15) {
    return 'warning';
  }
  if (percentDeviation > 5) {
    return 'adjusting';
  }
  return 'optimal';
};

export const useTireCalibration = () => {
  const [thresholds, setThresholds] = useState<CalibrationThresholds>(() => {
    const saved = localStorage.getItem('tirewatch-calibration-thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  const [simulatedAdjustments, setSimulatedAdjustments] = useState<Record<string, number>>({});

  // Fetch tires with machines
  const { data: tiresData = [], isLoading } = useQuery({
    queryKey: ['tires-calibration'],
    queryFn: async () => {
      const { data: tires, error } = await supabase
        .from('tires')
        .select(`
          id,
          serial,
          position,
          current_pressure,
          recommended_pressure,
          machine_id,
          machines (
            id,
            name
          )
        `)
        .not('machine_id', 'is', null);
      
      if (error) throw error;
      return tires || [];
    }
  });

  // Transform to calibration data
  const calibrationData = useMemo((): TireCalibrationData[] => {
    return tiresData.map((tire: any) => {
      const currentPressure = simulatedAdjustments[tire.id] ?? tire.current_pressure ?? (25 + Math.random() * 15);
      const recommendedPressure = tire.recommended_pressure ?? 32;
      const temperature = 35 + Math.random() * 35;
      const status = getCalibrationStatus(currentPressure, recommendedPressure, thresholds);
      
      return {
        id: `cal-${tire.id}`,
        tireId: tire.id,
        serial: tire.serial,
        position: tire.position || 'N/A',
        machineId: tire.machine_id,
        machineName: tire.machines?.name || 'Desconhecida',
        currentPressure: Math.round(currentPressure * 10) / 10,
        recommendedPressure,
        temperature: Math.round(temperature * 10) / 10,
        status,
        lastCalibration: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        autoAdjustEnabled: thresholds.autoAdjustEnabled,
        pressureHistory: generatePressureHistory(currentPressure)
      };
    });
  }, [tiresData, thresholds, simulatedAdjustments]);

  // Generate alerts
  const alerts = useMemo((): CalibrationAlert[] => {
    const alertsList: CalibrationAlert[] = [];
    
    calibrationData.forEach(tire => {
      if (tire.status === 'critical' || tire.status === 'warning') {
        const isLow = tire.currentPressure < tire.recommendedPressure;
        const deviation = Math.abs(tire.currentPressure - tire.recommendedPressure);
        
        alertsList.push({
          id: `alert-${tire.tireId}`,
          tireId: tire.tireId,
          serial: tire.serial,
          machineName: tire.machineName,
          severity: tire.status === 'critical' ? 'critical' : 'high',
          type: isLow ? 'pressure_low' : 'pressure_high',
          message: isLow 
            ? `Pressão baixa detectada (${tire.currentPressure} psi)` 
            : `Pressão alta detectada (${tire.currentPressure} psi)`,
          currentValue: tire.currentPressure,
          recommendedValue: tire.recommendedPressure,
          timestamp: new Date().toISOString(),
          isResolved: false
        });
      }
      
      if (tire.temperature > thresholds.temperatureUpperLimit) {
        alertsList.push({
          id: `alert-temp-${tire.tireId}`,
          tireId: tire.tireId,
          serial: tire.serial,
          machineName: tire.machineName,
          severity: tire.temperature > 90 ? 'critical' : 'medium',
          type: 'temperature_high',
          message: `Temperatura elevada (${tire.temperature}°C)`,
          currentValue: tire.temperature,
          recommendedValue: thresholds.temperatureUpperLimit,
          timestamp: new Date().toISOString(),
          isResolved: false
        });
      }
    });
    
    return alertsList.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [calibrationData, thresholds]);

  // Calculate stats
  const stats = useMemo((): CalibrationStats => {
    const optimal = calibrationData.filter(t => t.status === 'optimal').length;
    const adjusting = calibrationData.filter(t => t.status === 'adjusting').length;
    const warning = calibrationData.filter(t => t.status === 'warning').length;
    const critical = calibrationData.filter(t => t.status === 'critical').length;
    
    const avgPressure = calibrationData.length > 0
      ? calibrationData.reduce((sum, t) => sum + t.currentPressure, 0) / calibrationData.length
      : 0;
    
    const avgTemperature = calibrationData.length > 0
      ? calibrationData.reduce((sum, t) => sum + t.temperature, 0) / calibrationData.length
      : 0;

    return {
      totalTires: calibrationData.length,
      optimal,
      adjusting,
      warning,
      critical,
      avgPressure: Math.round(avgPressure * 10) / 10,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      activeAlerts: alerts.filter(a => !a.isResolved).length
    };
  }, [calibrationData, alerts]);

  // Chart data for pressure trends
  const pressureTrendData = useMemo(() => {
    if (calibrationData.length === 0) return [];
    
    const firstTire = calibrationData[0];
    return firstTire.pressureHistory.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      pressure: point.pressure,
      temperature: point.temperature,
      lowerLimit: thresholds.pressureLowerLimit,
      upperLimit: thresholds.pressureUpperLimit
    }));
  }, [calibrationData, thresholds]);

  const updateThresholds = useCallback((newThresholds: Partial<CalibrationThresholds>) => {
    const updated = { ...thresholds, ...newThresholds };
    setThresholds(updated);
    localStorage.setItem('tirewatch-calibration-thresholds', JSON.stringify(updated));
  }, [thresholds]);

  const getTireCalibration = useCallback((tireId: string) => {
    return calibrationData.find(t => t.tireId === tireId);
  }, [calibrationData]);

  const calibrateTire = useCallback(async (tireId: string, targetPressure?: number) => {
    const tire = calibrationData.find(t => t.tireId === tireId);
    if (!tire) return;
    
    const target = targetPressure ?? tire.recommendedPressure;
    
    // Simulate gradual adjustment
    const current = tire.currentPressure;
    const step = (target - current) / 5;
    
    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setSimulatedAdjustments(prev => ({
        ...prev,
        [tireId]: current + (step * i)
      }));
    }
    
    setSimulatedAdjustments(prev => ({
      ...prev,
      [tireId]: target
    }));
  }, [calibrationData]);

  const calibrateAll = useCallback(async () => {
    const tiresNeedingCalibration = calibrationData.filter(
      t => t.status !== 'optimal'
    );
    
    for (const tire of tiresNeedingCalibration) {
      await calibrateTire(tire.tireId);
    }
  }, [calibrationData, calibrateTire]);

  return {
    // Data
    calibrationData,
    alerts,
    stats,
    pressureTrendData,
    
    // Settings
    thresholds,
    updateThresholds,
    
    // Actions
    getTireCalibration,
    calibrateTire,
    calibrateAll,
    
    // Loading
    isLoading
  };
};
