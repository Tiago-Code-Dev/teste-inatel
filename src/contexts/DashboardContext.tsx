import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './TenantContext';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { useRealtimeMachines } from '@/hooks/useRealtimeMachines';
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry';

export interface DashboardMachine {
  id: string;
  name: string;
  model: string;
  unit_id: string;
  status: string;
  last_telemetry_at: string | null;
  image_url: string | null;
}

export interface DashboardAlert {
  id: string;
  machine_id: string;
  type: string;
  severity: string;
  status: string;
  message: string;
  reason: string | null;
  opened_at: string;
  machines?: { name: string; model: string } | null;
}

export interface DashboardStats {
  totalMachines: number;
  machinesOperational: number;
  machinesWarning: number;
  machinesCritical: number;
  machinesOffline: number;
  activeAlerts: number;
  criticalAlerts: number;
  openOccurrences: number;
  fleetHealthScore: number;
}

export interface MachineTelemetryData {
  machineId: string;
  pressure: number[];
  speed: number[];
  latestPressure: number;
  latestSpeed: number;
  lastUpdated: Date;
}

interface DashboardContextType {
  // Data
  machines: DashboardMachine[];
  alerts: DashboardAlert[];
  stats: DashboardStats;
  
  // Telemetry
  telemetryByMachine: Map<string, MachineTelemetryData>;
  getMachineTelemetry: (machineId: string) => MachineTelemetryData | undefined;
  isTelemetryConnected: boolean;
  
  // Loading states
  isLoading: boolean;
  isMachinesLoading: boolean;
  isAlertsLoading: boolean;
  isTelemetryLoading: boolean;
  
  // Error states
  machinesError: Error | null;
  alertsError: Error | null;
  
  // Actions
  refetch: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DEFAULT_STATS: DashboardStats = {
  totalMachines: 0,
  machinesOperational: 0,
  machinesWarning: 0,
  machinesCritical: 0,
  machinesOffline: 0,
  activeAlerts: 0,
  criticalAlerts: 0,
  openOccurrences: 0,
  fleetHealthScore: 0,
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { selectedUnitId } = useTenant();
  const queryClient = useQueryClient();

  // Enable realtime subscriptions
  useRealtimeAlerts();
  useRealtimeMachines();

  // Fetch machines
  const {
    data: machines = [],
    isLoading: isMachinesLoading,
    error: machinesError,
    refetch: refetchMachines,
  } = useQuery({
    queryKey: ['machines-dashboard', selectedUnitId],
    queryFn: async () => {
      let query = supabase
        .from('machines')
        .select('*')
        .order('status', { ascending: true })
        .order('name');

      if (selectedUnitId) {
        query = query.eq('unit_id', selectedUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DashboardMachine[];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Get machine IDs for telemetry subscription
  const machineIds = useMemo(() => machines.map(m => m.id), [machines]);

  // Live telemetry for all machines
  const {
    telemetryByMachine,
    getMachineTelemetry,
    isLoading: isTelemetryLoading,
    isConnected: isTelemetryConnected,
  } = useLiveTelemetry({
    machineIds,
    maxDataPoints: 30,
    enabled: machineIds.length > 0,
  });

  // Fetch alerts
  const {
    data: alerts = [],
    isLoading: isAlertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['alerts-dashboard', selectedUnitId],
    queryFn: async () => {
      let query = supabase
        .from('alerts')
        .select(`*, machines (name, model)`)
        .neq('status', 'resolved')
        .order('opened_at', { ascending: false })
        .limit(50);

      if (selectedUnitId) {
        // Filter through machines table via inner join
        query = supabase
          .from('alerts')
          .select(`*, machines!inner (name, model, unit_id)`)
          .neq('status', 'resolved')
          .eq('machines.unit_id', selectedUnitId)
          .order('opened_at', { ascending: false })
          .limit(50);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DashboardAlert[];
    },
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // 30 seconds
  });

  // Fetch occurrences count
  const { data: occurrencesCount = 0 } = useQuery({
    queryKey: ['occurrences-count', selectedUnitId],
    queryFn: async () => {
      let query = supabase
        .from('occurrences')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'closed')
        .neq('status', 'resolved');

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000,
  });

  // Calculate stats with telemetry health bonus
  const stats = useMemo((): DashboardStats => {
    const totalMachines = machines.length;
    const machinesOperational = machines.filter(m => m.status === 'operational').length;
    const machinesWarning = machines.filter(m => m.status === 'warning').length;
    const machinesCritical = machines.filter(m => m.status === 'critical').length;
    const machinesOffline = machines.filter(m => m.status === 'offline').length;
    
    const activeAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

    // Calculate fleet health score (0-100)
    const healthyMachines = machinesOperational;
    const warningWeight = 0.5;
    const criticalWeight = 0;
    const offlineWeight = 0;
    
    const weightedScore = totalMachines > 0
      ? ((healthyMachines + (machinesWarning * warningWeight) + (machinesCritical * criticalWeight) + (machinesOffline * offlineWeight)) / totalMachines) * 100
      : 100;

    // Penalty for critical alerts
    const alertPenalty = Math.min(criticalAlerts * 5, 30);
    
    // Bonus for live telemetry connection
    const telemetryBonus = isTelemetryConnected ? 2 : 0;
    
    const fleetHealthScore = Math.max(0, Math.min(100, Math.round(weightedScore - alertPenalty + telemetryBonus)));

    return {
      totalMachines,
      machinesOperational,
      machinesWarning,
      machinesCritical,
      machinesOffline,
      activeAlerts,
      criticalAlerts,
      openOccurrences: occurrencesCount,
      fleetHealthScore,
    };
  }, [machines, alerts, occurrencesCount, isTelemetryConnected]);

  const refetch = () => {
    refetchMachines();
    refetchAlerts();
    queryClient.invalidateQueries({ queryKey: ['occurrences-count'] });
    queryClient.invalidateQueries({ queryKey: ['telemetry-sparklines'] });
  };

  const isLoading = isMachinesLoading || isAlertsLoading;

  return (
    <DashboardContext.Provider
      value={{
        machines,
        alerts,
        stats,
        telemetryByMachine,
        getMachineTelemetry,
        isTelemetryConnected,
        isLoading,
        isMachinesLoading,
        isAlertsLoading,
        isTelemetryLoading,
        machinesError: machinesError as Error | null,
        alertsError: alertsError as Error | null,
        refetch,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
