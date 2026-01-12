import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, subHours } from 'date-fns';

export interface BIThresholds {
  costAlertThreshold: number;
  efficiencyMinThreshold: number;
  downtimeMaxHours: number;
  alertsMaxCount: number;
  autoNotifications: boolean;
}

export interface KPIData {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: 'performance' | 'cost' | 'efficiency' | 'alerts';
}

export interface BIChartData {
  timestamp: Date;
  label: string;
  operatingHours: number;
  downtime: number;
  fuelCost: number;
  maintenanceCost: number;
  partsCost: number;
  totalCost: number;
  efficiency: number;
  alertsCount: number;
}

export interface BIAlert {
  id: string;
  type: 'cost' | 'performance' | 'efficiency' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  value: number;
  threshold: number;
  machineId?: string;
  machineName?: string;
  timestamp: Date;
}

export interface MachinePerformance {
  id: string;
  name: string;
  model: string;
  operatingHours: number;
  downtime: number;
  efficiency: number;
  totalCost: number;
  costPerHour: number;
  alertsCount: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

const DEFAULT_THRESHOLDS: BIThresholds = {
  costAlertThreshold: 5000,
  efficiencyMinThreshold: 70,
  downtimeMaxHours: 48,
  alertsMaxCount: 10,
  autoNotifications: true,
};

const generateTimeSeriesData = (days: number): BIChartData[] => {
  const data: BIChartData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const baseOperating = 18 + Math.random() * 6;
    const downtime = Math.random() * 4;
    const fuelCost = 200 + Math.random() * 150;
    const maintenanceCost = Math.random() > 0.7 ? 100 + Math.random() * 400 : 0;
    const partsCost = Math.random() > 0.85 ? 50 + Math.random() * 200 : 0;
    
    data.push({
      timestamp: date,
      label: format(date, 'dd/MM'),
      operatingHours: baseOperating,
      downtime,
      fuelCost,
      maintenanceCost,
      partsCost,
      totalCost: fuelCost + maintenanceCost + partsCost,
      efficiency: Math.min(100, (baseOperating / (baseOperating + downtime)) * 100),
      alertsCount: Math.floor(Math.random() * 5),
    });
  }
  
  return data;
};

export function useBusinessIntelligence(periodDays: number = 7) {
  const [thresholds, setThresholds] = useState<BIThresholds>(() => {
    const saved = localStorage.getItem('bi-thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  const { data: machines, isLoading: machinesLoading } = useQuery({
    queryKey: ['bi-machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['bi-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('opened_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: telemetry, isLoading: telemetryLoading } = useQuery({
    queryKey: ['bi-telemetry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telemetry')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      return data;
    },
  });

  const chartData = useMemo(() => generateTimeSeriesData(periodDays), [periodDays]);

  const machinePerformance = useMemo<MachinePerformance[]>(() => {
    if (!machines) return [];
    
    return machines.map((machine) => {
      const operatingHours = 100 + Math.random() * 150;
      const downtime = Math.random() * 30;
      const efficiency = (operatingHours / (operatingHours + downtime)) * 100;
      const totalCost = 1000 + Math.random() * 4000;
      const alertsCount = Math.floor(Math.random() * 8);
      
      let status: 'excellent' | 'good' | 'average' | 'poor' = 'good';
      if (efficiency >= 90) status = 'excellent';
      else if (efficiency >= 75) status = 'good';
      else if (efficiency >= 60) status = 'average';
      else status = 'poor';
      
      return {
        id: machine.id,
        name: machine.name,
        model: machine.model,
        operatingHours,
        downtime,
        efficiency,
        totalCost,
        costPerHour: totalCost / operatingHours,
        alertsCount,
        status,
      };
    });
  }, [machines]);

  const kpis = useMemo<KPIData[]>(() => {
    const totalOperatingHours = chartData.reduce((sum, d) => sum + d.operatingHours, 0);
    const totalDowntime = chartData.reduce((sum, d) => sum + d.downtime, 0);
    const totalCost = chartData.reduce((sum, d) => sum + d.totalCost, 0);
    const avgEfficiency = chartData.reduce((sum, d) => sum + d.efficiency, 0) / chartData.length;
    const totalAlerts = alerts?.length || 0;
    const criticalAlerts = alerts?.filter(a => a.severity === 'critical' || a.severity === 'high').length || 0;
    
    return [
      {
        id: 'operating-hours',
        title: 'Horas de Operação',
        value: totalOperatingHours,
        unit: 'h',
        trend: 'up',
        trendValue: 8.5,
        category: 'performance',
      },
      {
        id: 'downtime',
        title: 'Tempo de Inatividade',
        value: totalDowntime,
        unit: 'h',
        trend: totalDowntime > thresholds.downtimeMaxHours ? 'up' : 'down',
        trendValue: -12.3,
        category: 'performance',
      },
      {
        id: 'total-cost',
        title: 'Custo Total',
        value: totalCost,
        unit: 'R$',
        trend: totalCost > thresholds.costAlertThreshold * periodDays ? 'up' : 'stable',
        trendValue: 5.2,
        category: 'cost',
      },
      {
        id: 'cost-per-hour',
        title: 'Custo por Hora',
        value: totalCost / totalOperatingHours,
        unit: 'R$/h',
        trend: 'down',
        trendValue: -3.1,
        category: 'cost',
      },
      {
        id: 'efficiency',
        title: 'Eficiência Operacional',
        value: avgEfficiency,
        unit: '%',
        trend: avgEfficiency >= thresholds.efficiencyMinThreshold ? 'up' : 'down',
        trendValue: avgEfficiency >= thresholds.efficiencyMinThreshold ? 4.7 : -2.1,
        category: 'efficiency',
      },
      {
        id: 'active-alerts',
        title: 'Alertas Ativos',
        value: totalAlerts,
        unit: '',
        trend: totalAlerts > thresholds.alertsMaxCount ? 'up' : 'stable',
        trendValue: totalAlerts > thresholds.alertsMaxCount ? 15 : 0,
        category: 'alerts',
      },
      {
        id: 'critical-alerts',
        title: 'Alertas Críticos',
        value: criticalAlerts,
        unit: '',
        trend: criticalAlerts > 0 ? 'up' : 'down',
        trendValue: criticalAlerts > 0 ? 25 : -50,
        category: 'alerts',
      },
      {
        id: 'machines-count',
        title: 'Máquinas Monitoradas',
        value: machines?.length || 0,
        unit: '',
        trend: 'stable',
        trendValue: 0,
        category: 'performance',
      },
    ];
  }, [chartData, alerts, machines, thresholds, periodDays]);

  const biAlerts = useMemo<BIAlert[]>(() => {
    const generatedAlerts: BIAlert[] = [];
    
    // Cost alerts
    const totalCost = chartData.reduce((sum, d) => sum + d.totalCost, 0);
    if (totalCost > thresholds.costAlertThreshold * periodDays) {
      generatedAlerts.push({
        id: 'cost-exceeded',
        type: 'cost',
        severity: 'high',
        title: 'Custo Operacional Elevado',
        message: `Custo total de R$ ${totalCost.toFixed(2)} excedeu o limite de R$ ${(thresholds.costAlertThreshold * periodDays).toFixed(2)}`,
        value: totalCost,
        threshold: thresholds.costAlertThreshold * periodDays,
        timestamp: new Date(),
      });
    }
    
    // Efficiency alerts
    const avgEfficiency = chartData.reduce((sum, d) => sum + d.efficiency, 0) / chartData.length;
    if (avgEfficiency < thresholds.efficiencyMinThreshold) {
      generatedAlerts.push({
        id: 'efficiency-low',
        type: 'efficiency',
        severity: 'medium',
        title: 'Eficiência Abaixo do Esperado',
        message: `Eficiência média de ${avgEfficiency.toFixed(1)}% está abaixo do mínimo de ${thresholds.efficiencyMinThreshold}%`,
        value: avgEfficiency,
        threshold: thresholds.efficiencyMinThreshold,
        timestamp: new Date(),
      });
    }
    
    // Machine-specific alerts
    machinePerformance.filter(m => m.status === 'poor').forEach(machine => {
      generatedAlerts.push({
        id: `machine-poor-${machine.id}`,
        type: 'performance',
        severity: 'critical',
        title: 'Desempenho Crítico de Máquina',
        message: `${machine.name} com eficiência de apenas ${machine.efficiency.toFixed(1)}%`,
        value: machine.efficiency,
        threshold: 60,
        machineId: machine.id,
        machineName: machine.name,
        timestamp: new Date(),
      });
    });
    
    // Maintenance cost spikes
    const maintenanceDays = chartData.filter(d => d.maintenanceCost > 300);
    if (maintenanceDays.length > periodDays * 0.3) {
      generatedAlerts.push({
        id: 'maintenance-frequent',
        type: 'maintenance',
        severity: 'medium',
        title: 'Manutenções Frequentes',
        message: `${maintenanceDays.length} dias com custos de manutenção elevados no período`,
        value: maintenanceDays.length,
        threshold: Math.floor(periodDays * 0.3),
        timestamp: new Date(),
      });
    }
    
    return generatedAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [chartData, machinePerformance, thresholds, periodDays]);

  const updateThresholds = useCallback((newThresholds: Partial<BIThresholds>) => {
    const updated = { ...thresholds, ...newThresholds };
    setThresholds(updated);
    localStorage.setItem('bi-thresholds', JSON.stringify(updated));
    toast.success('Configurações de BI atualizadas');
  }, [thresholds]);

  const resetThresholds = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.setItem('bi-thresholds', JSON.stringify(DEFAULT_THRESHOLDS));
    toast.info('Configurações restauradas para valores padrão');
  }, []);

  const exportReport = useCallback((format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const headers = ['Data', 'Horas Operação', 'Inatividade', 'Custo Combustível', 'Custo Manutenção', 'Custo Peças', 'Custo Total', 'Eficiência', 'Alertas'];
      const rows = chartData.map(d => [
        d.label,
        d.operatingHours.toFixed(1),
        d.downtime.toFixed(1),
        d.fuelCost.toFixed(2),
        d.maintenanceCost.toFixed(2),
        d.partsCost.toFixed(2),
        d.totalCost.toFixed(2),
        d.efficiency.toFixed(1),
        d.alertsCount,
      ]);
      
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-bi-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Relatório CSV exportado com sucesso');
    } else {
      toast.info('Exportação PDF em desenvolvimento');
    }
  }, [chartData]);

  return {
    kpis,
    chartData,
    biAlerts,
    machinePerformance,
    thresholds,
    updateThresholds,
    resetThresholds,
    exportReport,
    isLoading: machinesLoading || alertsLoading || telemetryLoading,
  };
}
