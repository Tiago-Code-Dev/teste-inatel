import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, subHours, format, differenceInMinutes, startOfDay, endOfDay, isWithinInterval, getHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type TimeRange = '24h' | '7d' | '30d' | '90d';
export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface AnalyticsMetrics {
  totalAlerts: number;
  resolvedAlerts: number;
  avgResolutionTimeMinutes: number;
  mttrMinutes: number; // Mean Time To Resolution
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  alertsByShift: Record<ShiftType, number>;
  alertsByHour: { hour: number; count: number }[];
  alertTrend: { date: string; count: number; resolved: number }[];
  slaCompliance: number;
  topMachines: { id: string; name: string; alertCount: number }[];
}

interface AlertRow {
  id: string;
  type: string;
  severity: string;
  status: string;
  opened_at: string;
  updated_at: string;
  machine_id: string;
  machines: { id: string; name: string; model: string } | null;
}

// Get shift from hour
function getShiftFromHour(hour: number): ShiftType {
  if (hour >= 6 && hour < 14) return 'morning';
  if (hour >= 14 && hour < 22) return 'afternoon';
  return 'night';
}

export function useAdvancedAnalytics(timeRange: TimeRange = '7d') {
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['advanced-analytics', timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '24h':
          startDate = subHours(now, 24);
          break;
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        case '90d':
          startDate = subDays(now, 90);
          break;
        default:
          startDate = subDays(now, 7);
      }

      const { data, error } = await supabase
        .from('alerts')
        .select(`
          id,
          type,
          severity,
          status,
          opened_at,
          updated_at,
          machine_id,
          machines (id, name, model)
        `)
        .gte('opened_at', startDate.toISOString())
        .order('opened_at', { ascending: true });

      if (error) throw error;
      return data as AlertRow[];
    },
    staleTime: 30000, // 30 seconds
  });

  const metrics = useMemo<AnalyticsMetrics>(() => {
    if (!alerts || alerts.length === 0) {
      return {
        totalAlerts: 0,
        resolvedAlerts: 0,
        avgResolutionTimeMinutes: 0,
        mttrMinutes: 0,
        alertsByType: {},
        alertsBySeverity: {},
        alertsByShift: { morning: 0, afternoon: 0, night: 0 },
        alertsByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
        alertTrend: [],
        slaCompliance: 100,
        topMachines: [],
      };
    }

    // Basic counts
    const totalAlerts = alerts.length;
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;

    // MTTR calculation
    const resolvedWithTime = alerts
      .filter(a => a.status === 'resolved')
      .map(a => differenceInMinutes(new Date(a.updated_at), new Date(a.opened_at)));
    
    const mttrMinutes = resolvedWithTime.length > 0
      ? Math.round(resolvedWithTime.reduce((a, b) => a + b, 0) / resolvedWithTime.length)
      : 0;

    // Alerts by type
    const alertsByType: Record<string, number> = {};
    alerts.forEach(a => {
      alertsByType[a.type] = (alertsByType[a.type] || 0) + 1;
    });

    // Alerts by severity
    const alertsBySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    alerts.forEach(a => {
      alertsBySeverity[a.severity] = (alertsBySeverity[a.severity] || 0) + 1;
    });

    // Alerts by shift
    const alertsByShift: Record<ShiftType, number> = { morning: 0, afternoon: 0, night: 0 };
    alerts.forEach(a => {
      const hour = getHours(new Date(a.opened_at));
      const shift = getShiftFromHour(hour);
      alertsByShift[shift]++;
    });

    // Alerts by hour
    const hourCounts = Array(24).fill(0);
    alerts.forEach(a => {
      const hour = getHours(new Date(a.opened_at));
      hourCounts[hour]++;
    });
    const alertsByHour = hourCounts.map((count, hour) => ({ hour, count }));

    // Alert trend (daily)
    const trendMap = new Map<string, { count: number; resolved: number }>();
    alerts.forEach(a => {
      const dateKey = format(new Date(a.opened_at), 'yyyy-MM-dd');
      const entry = trendMap.get(dateKey) || { count: 0, resolved: 0 };
      entry.count++;
      if (a.status === 'resolved') entry.resolved++;
      trendMap.set(dateKey, entry);
    });
    const alertTrend = Array.from(trendMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // SLA compliance (assuming 4h for high/critical, 24h for others)
    let slaCompliant = 0;
    alerts.filter(a => a.status === 'resolved').forEach(a => {
      const resolutionMinutes = differenceInMinutes(new Date(a.updated_at), new Date(a.opened_at));
      const slaMinutes = ['critical', 'high'].includes(a.severity) ? 240 : 1440;
      if (resolutionMinutes <= slaMinutes) slaCompliant++;
    });
    const slaCompliance = resolvedAlerts > 0 
      ? Math.round((slaCompliant / resolvedAlerts) * 100) 
      : 100;

    // Top machines by alert count
    const machineCounts = new Map<string, { id: string; name: string; count: number }>();
    alerts.forEach(a => {
      if (a.machines) {
        const key = a.machine_id;
        const entry = machineCounts.get(key) || { id: a.machine_id, name: a.machines.name, count: 0 };
        entry.count++;
        machineCounts.set(key, entry);
      }
    });
    const topMachines = Array.from(machineCounts.values())
      .map(m => ({ id: m.id, name: m.name, alertCount: m.count }))
      .sort((a, b) => b.alertCount - a.alertCount)
      .slice(0, 5);

    return {
      totalAlerts,
      resolvedAlerts,
      avgResolutionTimeMinutes: mttrMinutes,
      mttrMinutes,
      alertsByType,
      alertsBySeverity,
      alertsByShift,
      alertsByHour,
      alertTrend,
      slaCompliance,
      topMachines,
    };
  }, [alerts]);

  // Compare with previous period
  const { data: previousAlerts } = useQuery({
    queryKey: ['advanced-analytics-previous', timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      
      switch (timeRange) {
        case '24h':
          endDate = subHours(now, 24);
          startDate = subHours(now, 48);
          break;
        case '7d':
          endDate = subDays(now, 7);
          startDate = subDays(now, 14);
          break;
        case '30d':
          endDate = subDays(now, 30);
          startDate = subDays(now, 60);
          break;
        case '90d':
          endDate = subDays(now, 90);
          startDate = subDays(now, 180);
          break;
        default:
          endDate = subDays(now, 7);
          startDate = subDays(now, 14);
      }

      const { data, error } = await supabase
        .from('alerts')
        .select('id, severity, status, opened_at, updated_at')
        .gte('opened_at', startDate.toISOString())
        .lt('opened_at', endDate.toISOString());

      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });

  const comparison = useMemo(() => {
    if (!previousAlerts || previousAlerts.length === 0) {
      return {
        alertChange: 0,
        resolutionChange: 0,
        mttrChange: 0,
      };
    }

    const prevTotal = previousAlerts.length;
    const prevResolved = previousAlerts.filter(a => a.status === 'resolved').length;
    const prevMttr = previousAlerts
      .filter(a => a.status === 'resolved')
      .map(a => differenceInMinutes(new Date(a.updated_at), new Date(a.opened_at)));
    const prevAvgMttr = prevMttr.length > 0
      ? prevMttr.reduce((a, b) => a + b, 0) / prevMttr.length
      : 0;

    return {
      alertChange: prevTotal > 0 ? Math.round(((metrics.totalAlerts - prevTotal) / prevTotal) * 100) : 0,
      resolutionChange: prevResolved > 0 
        ? Math.round(((metrics.resolvedAlerts - prevResolved) / prevResolved) * 100) 
        : 0,
      mttrChange: prevAvgMttr > 0 
        ? Math.round(((metrics.mttrMinutes - prevAvgMttr) / prevAvgMttr) * 100) 
        : 0,
    };
  }, [previousAlerts, metrics]);

  return {
    metrics,
    comparison,
    isLoading,
    refetch,
    alerts,
  };
}

// Hook for team performance
export function useTeamPerformance(timeRange: TimeRange = '7d') {
  const { data, isLoading } = useQuery({
    queryKey: ['team-performance', timeRange],
    queryFn: async () => {
      // In a real app, this would join with user assignments
      // For now, we'll return mock team data
      return [
        { id: '1', name: 'Equipe A', resolved: 45, avgTime: 32, slaCompliance: 94 },
        { id: '2', name: 'Equipe B', resolved: 38, avgTime: 41, slaCompliance: 87 },
        { id: '3', name: 'Equipe C', resolved: 29, avgTime: 28, slaCompliance: 96 },
      ];
    },
    staleTime: 60000,
  });

  return { teamData: data || [], isLoading };
}
