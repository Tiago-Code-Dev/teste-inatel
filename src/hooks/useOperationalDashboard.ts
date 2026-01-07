import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subHours, subDays, differenceInHours, differenceInMinutes } from 'date-fns';

export interface KPIData {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: 'performance' | 'alerts' | 'maintenance' | 'resources';
}

export interface PerformanceDataPoint {
  timestamp: string;
  hour: string;
  uptime: number;
  downtime: number;
  efficiency: number;
  alertCount: number;
  resourceUsage: number;
}

export interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  open: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
  slaExpired: number;
  slaWarning: number;
}

export interface MachinePerformance {
  machineId: string;
  machineName: string;
  uptime: number;
  downtime: number;
  efficiency: number;
  alertCount: number;
  status: 'operational' | 'warning' | 'critical' | 'offline';
}

export interface DashboardFilters {
  period: '6h' | '24h' | '7d' | '30d' | 'custom';
  machineId: string | null;
  alertSeverity: string[];
  showResolved: boolean;
}

const DEFAULT_FILTERS: DashboardFilters = {
  period: '24h',
  machineId: null,
  alertSeverity: [],
  showResolved: false,
};

export const useOperationalDashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const getPeriodDate = useCallback((period: string): Date => {
    const now = new Date();
    switch (period) {
      case '6h': return subHours(now, 6);
      case '24h': return subHours(now, 24);
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      default: return subHours(now, 24);
    }
  }, []);

  // Fetch machines
  const { data: machines = [], isLoading: machinesLoading, refetch: refetchMachines } = useQuery({
    queryKey: ['machines-operational'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch alerts with period filter
  const { data: alerts = [], isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts-operational', filters.period],
    queryFn: async () => {
      const periodDate = getPeriodDate(filters.period);
      
      let query = supabase
        .from('alerts')
        .select(`*, machines (name, model)`)
        .gte('opened_at', periodDate.toISOString())
        .order('opened_at', { ascending: false });

      if (!filters.showResolved) {
        query = query.neq('status', 'resolved');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch telemetry for performance calculations
  const { data: telemetry = [], isLoading: telemetryLoading } = useQuery({
    queryKey: ['telemetry-operational', filters.period, filters.machineId],
    queryFn: async () => {
      const periodDate = getPeriodDate(filters.period);
      
      let query = supabase
        .from('telemetry')
        .select('*')
        .gte('timestamp', periodDate.toISOString())
        .order('timestamp', { ascending: true });

      if (filters.machineId) {
        query = query.eq('machine_id', filters.machineId);
      }

      const { data, error } = await query.limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate KPIs
  const kpis = useMemo((): KPIData[] => {
    const totalMachines = machines.length;
    const operationalMachines = machines.filter(m => m.status === 'operational').length;
    const criticalMachines = machines.filter(m => m.status === 'critical').length;
    
    const openAlerts = alerts.filter(a => a.status === 'open').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
    
    const uptimePercentage = totalMachines > 0 
      ? Math.round((operationalMachines / totalMachines) * 100) 
      : 0;
    
    const efficiencyScore = totalMachines > 0
      ? Math.round(((totalMachines - criticalMachines) / totalMachines) * 100)
      : 0;

    const resolutionRate = alerts.length > 0
      ? Math.round((resolvedAlerts / alerts.length) * 100)
      : 100;

    return [
      {
        id: 'uptime',
        title: 'Tempo de Operação',
        value: uptimePercentage,
        unit: '%',
        trend: uptimePercentage >= 90 ? 'up' : uptimePercentage >= 70 ? 'stable' : 'down',
        trendValue: uptimePercentage >= 90 ? 5 : uptimePercentage >= 70 ? 0 : -10,
        category: 'performance',
      },
      {
        id: 'efficiency',
        title: 'Eficiência Operacional',
        value: efficiencyScore,
        unit: '%',
        trend: efficiencyScore >= 85 ? 'up' : efficiencyScore >= 70 ? 'stable' : 'down',
        trendValue: efficiencyScore >= 85 ? 3 : efficiencyScore >= 70 ? 0 : -5,
        category: 'performance',
      },
      {
        id: 'alerts',
        title: 'Alertas Ativos',
        value: openAlerts,
        unit: '',
        trend: openAlerts <= 5 ? 'up' : openAlerts <= 15 ? 'stable' : 'down',
        trendValue: criticalAlerts,
        category: 'alerts',
      },
      {
        id: 'resolution',
        title: 'Taxa de Resolução',
        value: resolutionRate,
        unit: '%',
        trend: resolutionRate >= 80 ? 'up' : resolutionRate >= 60 ? 'stable' : 'down',
        trendValue: resolutionRate >= 80 ? 8 : resolutionRate >= 60 ? 0 : -12,
        category: 'maintenance',
      },
      {
        id: 'critical',
        title: 'Máquinas Críticas',
        value: criticalMachines,
        unit: '',
        trend: criticalMachines === 0 ? 'up' : criticalMachines <= 2 ? 'stable' : 'down',
        trendValue: criticalMachines,
        category: 'alerts',
      },
      {
        id: 'operational',
        title: 'Máquinas Operacionais',
        value: operationalMachines,
        unit: `/${totalMachines}`,
        trend: operationalMachines === totalMachines ? 'up' : 'stable',
        trendValue: totalMachines > 0 ? Math.round((operationalMachines / totalMachines) * 100) : 0,
        category: 'resources',
      },
    ];
  }, [machines, alerts]);

  // Calculate alert summary
  const alertSummary = useMemo((): AlertSummary => {
    const now = new Date();
    
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      open: alerts.filter(a => a.status === 'open').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
      inProgress: alerts.filter(a => a.status === 'in_progress').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      slaExpired: alerts.filter(a => {
        // Assume 4-hour SLA from alert creation
        const alertTime = new Date(a.opened_at);
        const hoursElapsed = differenceInHours(now, alertTime);
        return a.status !== 'resolved' && hoursElapsed > 4;
      }).length,
      slaWarning: alerts.filter(a => {
        const alertTime = new Date(a.opened_at);
        const hoursElapsed = differenceInHours(now, alertTime);
        return a.status !== 'resolved' && hoursElapsed >= 3 && hoursElapsed <= 4;
      }).length,
    };
  }, [alerts]);

  // Calculate performance chart data
  const performanceData = useMemo((): PerformanceDataPoint[] => {
    const hours = filters.period === '6h' ? 6 : filters.period === '24h' ? 24 : filters.period === '7d' ? 168 : 720;
    const interval = filters.period === '6h' ? 1 : filters.period === '24h' ? 2 : filters.period === '7d' ? 24 : 48;
    
    const data: PerformanceDataPoint[] = [];
    const now = new Date();

    for (let i = hours; i >= 0; i -= interval) {
      const timestamp = subHours(now, i);
      const hourLabel = timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      // Calculate metrics for this time window
      const windowStart = subHours(timestamp, interval);
      const windowAlerts = alerts.filter(a => {
        const alertTime = new Date(a.opened_at);
        return alertTime >= windowStart && alertTime <= timestamp;
      });

      const windowTelemetry = telemetry.filter(t => {
        const telemetryTime = new Date(t.timestamp);
        return telemetryTime >= windowStart && telemetryTime <= timestamp;
      });

      // Simulate uptime/downtime based on alerts
      const criticalAlerts = windowAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
      const baseUptime = 95 - (criticalAlerts * 5);
      const uptime = Math.max(60, Math.min(100, baseUptime + (Math.random() * 5 - 2.5)));
      const downtime = 100 - uptime;
      
      // Calculate efficiency
      const efficiency = Math.max(50, uptime - (windowAlerts.length * 2) + (Math.random() * 10 - 5));
      
      // Resource usage simulation
      const resourceUsage = 30 + (windowTelemetry.length / 10) + (Math.random() * 20);

      data.push({
        timestamp: timestamp.toISOString(),
        hour: hourLabel,
        uptime: Math.round(uptime * 10) / 10,
        downtime: Math.round(downtime * 10) / 10,
        efficiency: Math.round(efficiency * 10) / 10,
        alertCount: windowAlerts.length,
        resourceUsage: Math.round(Math.min(100, resourceUsage) * 10) / 10,
      });
    }

    return data;
  }, [alerts, telemetry, filters.period]);

  // Machine performance data
  const machinePerformance = useMemo((): MachinePerformance[] => {
    return machines.map(machine => {
      const machineAlerts = alerts.filter(a => a.machine_id === machine.id);
      const criticalAlerts = machineAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
      
      const status = machine.status as 'operational' | 'warning' | 'critical' | 'offline';
      
      // Calculate uptime based on status and alerts
      let uptime = 100;
      if (status === 'critical') uptime = 30;
      else if (status === 'warning') uptime = 70;
      else if (status === 'offline') uptime = 0;
      else uptime = Math.max(80, 100 - criticalAlerts * 5);

      const downtime = 100 - uptime;
      const efficiency = Math.max(40, uptime - (machineAlerts.length * 2));

      return {
        machineId: machine.id,
        machineName: machine.name,
        uptime: Math.round(uptime),
        downtime: Math.round(downtime),
        efficiency: Math.round(efficiency),
        alertCount: machineAlerts.length,
        status,
      };
    });
  }, [machines, alerts]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Refresh all data
  const refreshData = useCallback(() => {
    refetchMachines();
    refetchAlerts();
  }, [refetchMachines, refetchAlerts]);

  return {
    // Data
    kpis,
    alertSummary,
    performanceData,
    machinePerformance,
    machines,
    alerts,
    
    // State
    filters,
    updateFilters,
    resetFilters,
    
    // Loading states
    isLoading: machinesLoading || alertsLoading || telemetryLoading,
    
    // Actions
    refreshData,
  };
};
