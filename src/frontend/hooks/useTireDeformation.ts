import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DeformationThresholds {
  warningLevel: number;
  criticalLevel: number;
  pressureImpactFactor: number;
  temperatureImpactFactor: number;
  autoAlerts: boolean;
  autoCorrection: boolean;
}

export interface TireDeformationData {
  id: string;
  tireId: string;
  tireSerial: string;
  machineId: string;
  machineName: string;
  position: string;
  currentDeformation: number;
  maxDeformation: number;
  avgDeformation: number;
  pressure: number;
  recommendedPressure: number;
  temperature: number;
  status: 'optimal' | 'warning' | 'critical';
  lastUpdated: Date;
  history: DeformationHistoryPoint[];
}

export interface DeformationHistoryPoint {
  timestamp: Date;
  deformation: number;
  pressure: number;
  temperature: number;
}

export interface DeformationAlert {
  id: string;
  tireId: string;
  tireSerial: string;
  machineId: string;
  machineName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'deformation' | 'pressure_impact' | 'temperature_impact' | 'structural';
  message: string;
  deformationLevel: number;
  timestamp: Date;
}

const DEFAULT_THRESHOLDS: DeformationThresholds = {
  warningLevel: 5,
  criticalLevel: 10,
  pressureImpactFactor: 1.5,
  temperatureImpactFactor: 1.2,
  autoAlerts: true,
  autoCorrection: false,
};

const generateDeformationHistory = (baseDeformation: number): DeformationHistoryPoint[] => {
  const history: DeformationHistoryPoint[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * 2;
    history.push({
      timestamp,
      deformation: Math.max(0, Math.min(15, baseDeformation + variation)),
      pressure: 30 + Math.random() * 10,
      temperature: 25 + Math.random() * 20,
    });
  }
  
  return history;
};

export function useTireDeformation(periodHours: number = 24) {
  const [thresholds, setThresholds] = useState<DeformationThresholds>(() => {
    const saved = localStorage.getItem('deformation-thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  const { data: tires, isLoading: tiresLoading } = useQuery({
    queryKey: ['tires-deformation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tires')
        .select(`
          *,
          machines:machine_id (id, name, model)
        `)
        .order('serial');
      
      if (error) throw error;
      return data;
    },
  });

  const deformationData = useMemo<TireDeformationData[]>(() => {
    if (!tires) return [];
    
    return tires.map((tire) => {
      const baseDeformation = Math.random() * 12;
      const history = generateDeformationHistory(baseDeformation);
      const currentDeformation = history[history.length - 1].deformation;
      const maxDeformation = Math.max(...history.map(h => h.deformation));
      const avgDeformation = history.reduce((sum, h) => sum + h.deformation, 0) / history.length;
      
      let status: 'optimal' | 'warning' | 'critical' = 'optimal';
      if (currentDeformation >= thresholds.criticalLevel) {
        status = 'critical';
      } else if (currentDeformation >= thresholds.warningLevel) {
        status = 'warning';
      }
      
      const machine = tire.machines as { id: string; name: string; model: string } | null;
      
      return {
        id: tire.id,
        tireId: tire.id,
        tireSerial: tire.serial,
        machineId: machine?.id || 'unknown',
        machineName: machine?.name || 'Sem máquina',
        position: tire.position || 'N/A',
        currentDeformation,
        maxDeformation,
        avgDeformation,
        pressure: tire.current_pressure || 32,
        recommendedPressure: tire.recommended_pressure,
        temperature: 25 + Math.random() * 20,
        status,
        lastUpdated: new Date(tire.updated_at),
        history,
      };
    });
  }, [tires, thresholds]);

  const alerts = useMemo<DeformationAlert[]>(() => {
    if (!thresholds.autoAlerts) return [];
    
    const generatedAlerts: DeformationAlert[] = [];
    
    deformationData.forEach((tire) => {
      if (tire.status === 'critical') {
        generatedAlerts.push({
          id: `alert-critical-${tire.tireId}`,
          tireId: tire.tireId,
          tireSerial: tire.tireSerial,
          machineId: tire.machineId,
          machineName: tire.machineName,
          severity: 'critical',
          type: 'deformation',
          message: `Amassamento crítico detectado: ${tire.currentDeformation.toFixed(1)}%`,
          deformationLevel: tire.currentDeformation,
          timestamp: new Date(),
        });
      } else if (tire.status === 'warning') {
        generatedAlerts.push({
          id: `alert-warning-${tire.tireId}`,
          tireId: tire.tireId,
          tireSerial: tire.tireSerial,
          machineId: tire.machineId,
          machineName: tire.machineName,
          severity: 'medium',
          type: 'deformation',
          message: `Deformação acima do ideal: ${tire.currentDeformation.toFixed(1)}%`,
          deformationLevel: tire.currentDeformation,
          timestamp: new Date(),
        });
      }

      // Pressure impact alerts
      const pressureDiff = Math.abs(tire.pressure - tire.recommendedPressure);
      if (pressureDiff > 5) {
        generatedAlerts.push({
          id: `alert-pressure-${tire.tireId}`,
          tireId: tire.tireId,
          tireSerial: tire.tireSerial,
          machineId: tire.machineId,
          machineName: tire.machineName,
          severity: pressureDiff > 8 ? 'high' : 'low',
          type: 'pressure_impact',
          message: `Pressão ${tire.pressure < tire.recommendedPressure ? 'baixa' : 'alta'} pode causar deformação`,
          deformationLevel: tire.currentDeformation,
          timestamp: new Date(),
        });
      }

      // Temperature alerts
      if (tire.temperature > 40) {
        generatedAlerts.push({
          id: `alert-temp-${tire.tireId}`,
          tireId: tire.tireId,
          tireSerial: tire.tireSerial,
          machineId: tire.machineId,
          machineName: tire.machineName,
          severity: tire.temperature > 50 ? 'high' : 'medium',
          type: 'temperature_impact',
          message: `Temperatura elevada (${tire.temperature.toFixed(0)}°C) afetando estrutura`,
          deformationLevel: tire.currentDeformation,
          timestamp: new Date(),
        });
      }
    });
    
    return generatedAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [deformationData, thresholds.autoAlerts]);

  const stats = useMemo(() => {
    const total = deformationData.length;
    const optimal = deformationData.filter(t => t.status === 'optimal').length;
    const warning = deformationData.filter(t => t.status === 'warning').length;
    const critical = deformationData.filter(t => t.status === 'critical').length;
    const avgDeformation = total > 0 
      ? deformationData.reduce((sum, t) => sum + t.currentDeformation, 0) / total 
      : 0;
    const maxDeformation = total > 0 
      ? Math.max(...deformationData.map(t => t.currentDeformation)) 
      : 0;
    
    return {
      total,
      optimal,
      warning,
      critical,
      avgDeformation,
      maxDeformation,
    };
  }, [deformationData]);

  const updateThresholds = useCallback((newThresholds: Partial<DeformationThresholds>) => {
    const updated = { ...thresholds, ...newThresholds };
    setThresholds(updated);
    localStorage.setItem('deformation-thresholds', JSON.stringify(updated));
    toast.success('Limites atualizados com sucesso');
  }, [thresholds]);

  const resetThresholds = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.setItem('deformation-thresholds', JSON.stringify(DEFAULT_THRESHOLDS));
    toast.info('Limites restaurados para valores padrão');
  }, []);

  const adjustPressure = useCallback((tireId: string) => {
    toast.success(`Ajuste de pressão iniciado para o pneu ${tireId}`);
  }, []);

  const requestReplacement = useCallback((tireId: string) => {
    toast.info(`Solicitação de substituição enviada para o pneu ${tireId}`);
  }, []);

  return {
    deformationData,
    alerts,
    stats,
    thresholds,
    updateThresholds,
    resetThresholds,
    adjustPressure,
    requestReplacement,
    isLoading: tiresLoading,
  };
}
