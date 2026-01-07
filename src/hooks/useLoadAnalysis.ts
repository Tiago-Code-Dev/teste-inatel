import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { subDays } from 'date-fns';

export interface LoadThresholds {
  maxLoadKg: number;
  warningPercent: number;
  criticalPercent: number;
  wearImpactFactor: number;
  autoAlerts: boolean;
}

export interface LoadHistoryPoint {
  timestamp: Date;
  loadKg: number;
  loadPercent: number;
  wearImpact: number;
  efficiency: number;
}

export interface TireLoadData {
  id: string;
  tireId: string;
  tireSerial: string;
  machineId: string;
  machineName: string;
  position: string;
  currentLoadKg: number;
  maxLoadKg: number;
  loadPercent: number;
  wearLevel: number;
  wearImpact: number;
  efficiency: number;
  status: 'normal' | 'warning' | 'overload';
  lastUpdated: Date;
  history: LoadHistoryPoint[];
}

export interface MachineLoadData {
  id: string;
  name: string;
  model: string;
  totalLoadKg: number;
  maxLoadKg: number;
  loadPercent: number;
  tiresAffected: number;
  efficiency: number;
  status: 'normal' | 'warning' | 'overload';
  recommendation: string | null;
}

export interface LoadAlert {
  id: string;
  tireId?: string;
  tireSerial?: string;
  machineId: string;
  machineName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'overload' | 'wear_impact' | 'efficiency_drop' | 'distribution';
  message: string;
  loadPercent: number;
  timestamp: Date;
}

const DEFAULT_THRESHOLDS: LoadThresholds = {
  maxLoadKg: 5000,
  warningPercent: 80,
  criticalPercent: 100,
  wearImpactFactor: 1.5,
  autoAlerts: true,
};

const generateLoadHistory = (baseLoad: number, maxLoad: number): LoadHistoryPoint[] => {
  const history: LoadHistoryPoint[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variation = (Math.random() - 0.3) * 1000;
    const loadKg = Math.max(0, Math.min(maxLoad * 1.3, baseLoad + variation));
    const loadPercent = (loadKg / maxLoad) * 100;
    const wearImpact = loadPercent > 100 ? (loadPercent - 100) * 0.5 : loadPercent * 0.1;
    const efficiency = Math.max(50, 100 - (loadPercent > 100 ? (loadPercent - 100) * 2 : 0));
    
    history.push({
      timestamp,
      loadKg,
      loadPercent,
      wearImpact,
      efficiency,
    });
  }
  
  return history;
};

export function useLoadAnalysis(periodHours: number = 24) {
  const [thresholds, setThresholds] = useState<LoadThresholds>(() => {
    const saved = localStorage.getItem('load-thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  const { data: tires, isLoading: tiresLoading } = useQuery({
    queryKey: ['load-tires'],
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

  const { data: machines, isLoading: machinesLoading } = useQuery({
    queryKey: ['load-machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const tireLoadData = useMemo<TireLoadData[]>(() => {
    if (!tires) return [];
    
    return tires.map((tire) => {
      const maxLoadKg = thresholds.maxLoadKg;
      const baseLoad = 2000 + Math.random() * 4000;
      const history = generateLoadHistory(baseLoad, maxLoadKg);
      const current = history[history.length - 1];
      
      let status: 'normal' | 'warning' | 'overload' = 'normal';
      if (current.loadPercent >= thresholds.criticalPercent) {
        status = 'overload';
      } else if (current.loadPercent >= thresholds.warningPercent) {
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
        currentLoadKg: current.loadKg,
        maxLoadKg,
        loadPercent: current.loadPercent,
        wearLevel: 10 + Math.random() * 40,
        wearImpact: current.wearImpact,
        efficiency: current.efficiency,
        status,
        lastUpdated: new Date(tire.updated_at),
        history,
      };
    });
  }, [tires, thresholds]);

  const machineLoadData = useMemo<MachineLoadData[]>(() => {
    if (!machines) return [];
    
    return machines.map((machine) => {
      const machineTires = tireLoadData.filter(t => t.machineId === machine.id);
      const totalLoadKg = machineTires.reduce((sum, t) => sum + t.currentLoadKg, 0);
      const maxLoadKg = thresholds.maxLoadKg * Math.max(1, machineTires.length);
      const loadPercent = (totalLoadKg / maxLoadKg) * 100;
      const tiresAffected = machineTires.filter(t => t.status !== 'normal').length;
      const avgEfficiency = machineTires.length > 0 
        ? machineTires.reduce((sum, t) => sum + t.efficiency, 0) / machineTires.length 
        : 100;
      
      let status: 'normal' | 'warning' | 'overload' = 'normal';
      if (loadPercent >= thresholds.criticalPercent) {
        status = 'overload';
      } else if (loadPercent >= thresholds.warningPercent) {
        status = 'warning';
      }
      
      let recommendation: string | null = null;
      if (status === 'overload') {
        recommendation = 'Redistribuir carga imediatamente ou reduzir peso total';
      } else if (status === 'warning') {
        recommendation = 'Monitorar carga e considerar redistribuição';
      } else if (tiresAffected > 0) {
        recommendation = 'Verificar distribuição de carga nos pneus afetados';
      }
      
      return {
        id: machine.id,
        name: machine.name,
        model: machine.model,
        totalLoadKg,
        maxLoadKg,
        loadPercent,
        tiresAffected,
        efficiency: avgEfficiency,
        status,
        recommendation,
      };
    });
  }, [machines, tireLoadData, thresholds]);

  const alerts = useMemo<LoadAlert[]>(() => {
    if (!thresholds.autoAlerts) return [];
    
    const generatedAlerts: LoadAlert[] = [];
    
    // Tire overload alerts
    tireLoadData.filter(t => t.status === 'overload').forEach(tire => {
      generatedAlerts.push({
        id: `overload-${tire.tireId}`,
        tireId: tire.tireId,
        tireSerial: tire.tireSerial,
        machineId: tire.machineId,
        machineName: tire.machineName,
        severity: 'critical',
        type: 'overload',
        message: `Sobrecarga detectada: ${tire.loadPercent.toFixed(0)}% da capacidade (${tire.currentLoadKg.toFixed(0)}kg)`,
        loadPercent: tire.loadPercent,
        timestamp: new Date(),
      });
    });
    
    // Warning alerts
    tireLoadData.filter(t => t.status === 'warning').forEach(tire => {
      generatedAlerts.push({
        id: `warning-${tire.tireId}`,
        tireId: tire.tireId,
        tireSerial: tire.tireSerial,
        machineId: tire.machineId,
        machineName: tire.machineName,
        severity: 'medium',
        type: 'overload',
        message: `Carga elevada: ${tire.loadPercent.toFixed(0)}% da capacidade`,
        loadPercent: tire.loadPercent,
        timestamp: new Date(),
      });
    });
    
    // Wear impact alerts
    tireLoadData.filter(t => t.wearImpact > 15).forEach(tire => {
      generatedAlerts.push({
        id: `wear-${tire.tireId}`,
        tireId: tire.tireId,
        tireSerial: tire.tireSerial,
        machineId: tire.machineId,
        machineName: tire.machineName,
        severity: 'high',
        type: 'wear_impact',
        message: `Impacto no desgaste elevado: ${tire.wearImpact.toFixed(1)}% adicional`,
        loadPercent: tire.loadPercent,
        timestamp: new Date(),
      });
    });
    
    // Machine efficiency alerts
    machineLoadData.filter(m => m.efficiency < 80).forEach(machine => {
      generatedAlerts.push({
        id: `efficiency-${machine.id}`,
        machineId: machine.id,
        machineName: machine.name,
        severity: machine.efficiency < 70 ? 'high' : 'medium',
        type: 'efficiency_drop',
        message: `Eficiência reduzida para ${machine.efficiency.toFixed(0)}% devido à carga`,
        loadPercent: machine.loadPercent,
        timestamp: new Date(),
      });
    });
    
    return generatedAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [tireLoadData, machineLoadData, thresholds.autoAlerts]);

  const stats = useMemo(() => {
    const totalTires = tireLoadData.length;
    const normal = tireLoadData.filter(t => t.status === 'normal').length;
    const warning = tireLoadData.filter(t => t.status === 'warning').length;
    const overload = tireLoadData.filter(t => t.status === 'overload').length;
    const avgLoadPercent = totalTires > 0 
      ? tireLoadData.reduce((sum, t) => sum + t.loadPercent, 0) / totalTires 
      : 0;
    const avgEfficiency = totalTires > 0
      ? tireLoadData.reduce((sum, t) => sum + t.efficiency, 0) / totalTires
      : 100;
    const totalWearImpact = tireLoadData.reduce((sum, t) => sum + t.wearImpact, 0);
    
    return {
      totalTires,
      normal,
      warning,
      overload,
      avgLoadPercent,
      avgEfficiency,
      totalWearImpact,
      machinesWithOverload: machineLoadData.filter(m => m.status === 'overload').length,
    };
  }, [tireLoadData, machineLoadData]);

  const updateThresholds = useCallback((newThresholds: Partial<LoadThresholds>) => {
    const updated = { ...thresholds, ...newThresholds };
    setThresholds(updated);
    localStorage.setItem('load-thresholds', JSON.stringify(updated));
    toast.success('Limites de carga atualizados');
  }, [thresholds]);

  const resetThresholds = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.setItem('load-thresholds', JSON.stringify(DEFAULT_THRESHOLDS));
    toast.info('Limites restaurados para valores padrão');
  }, []);

  const adjustLoad = useCallback((machineId: string) => {
    toast.success('Recomendação de ajuste de carga enviada');
  }, []);

  const requestMaintenance = useCallback((tireId: string) => {
    toast.info('Solicitação de manutenção preventiva enviada');
  }, []);

  return {
    tireLoadData,
    machineLoadData,
    alerts,
    stats,
    thresholds,
    updateThresholds,
    resetThresholds,
    adjustLoad,
    requestMaintenance,
    isLoading: tiresLoading || machinesLoading,
  };
}
