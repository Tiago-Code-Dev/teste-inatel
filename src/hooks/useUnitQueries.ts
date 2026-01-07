import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook for fetching machines with automatic unit filtering.
 * RLS already filters by unit, but we also apply client-side filter 
 * for selectedUnitId when user wants to see only one unit.
 */
export function useMachinesWithUnit() {
  const { selectedUnitId } = useTenant();

  return useQuery({
    queryKey: ['machines', selectedUnitId],
    queryFn: async () => {
      let query = supabase
        .from('machines')
        .select('*')
        .order('name');

      // Apply unit filter if a specific unit is selected
      if (selectedUnitId) {
        query = query.eq('unit_id', selectedUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Hook for fetching alerts with automatic unit filtering through machines.
 */
export function useAlertsWithUnit() {
  const { selectedUnitId } = useTenant();

  return useQuery({
    queryKey: ['alerts', selectedUnitId],
    queryFn: async () => {
      let query = supabase
        .from('alerts')
        .select(`*, machines!inner(id, name, unit_id)`)
        .neq('status', 'resolved')
        .order('opened_at', { ascending: false });

      // Apply unit filter if a specific unit is selected
      if (selectedUnitId) {
        query = query.eq('machines.unit_id', selectedUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Hook for fetching telemetry with automatic unit filtering through machines.
 */
export function useTelemetryWithUnit(machineId?: string | null) {
  const { selectedUnitId } = useTenant();

  return useQuery({
    queryKey: ['telemetry', selectedUnitId, machineId],
    queryFn: async () => {
      let query = supabase
        .from('telemetry')
        .select(`*, machines!inner(id, name, unit_id)`)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (machineId) {
        query = query.eq('machine_id', machineId);
      }

      // Apply unit filter if a specific unit is selected
      if (selectedUnitId) {
        query = query.eq('machines.unit_id', selectedUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Hook for fetching occurrences with automatic unit filtering through machines.
 */
export function useOccurrencesWithUnit() {
  const { selectedUnitId } = useTenant();

  return useQuery({
    queryKey: ['occurrences', selectedUnitId],
    queryFn: async () => {
      let query = supabase
        .from('occurrences')
        .select(`*, machines!inner(id, name, unit_id)`)
        .order('created_at', { ascending: false });

      // Apply unit filter if a specific unit is selected
      if (selectedUnitId) {
        query = query.eq('machines.unit_id', selectedUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Hook for fetching tires with automatic unit filtering through machines.
 */
export function useTiresWithUnit() {
  const { selectedUnitId } = useTenant();

  return useQuery({
    queryKey: ['tires', selectedUnitId],
    queryFn: async () => {
      // Tires can be unassigned (machine_id = null) or assigned
      // We need a different approach for unit filtering
      const { data, error } = await supabase
        .from('tires')
        .select(`*, machines(id, name, unit_id)`)
        .order('serial');

      if (error) throw error;

      // Client-side filter for unit when machine is assigned
      if (selectedUnitId && data) {
        return data.filter(tire => {
          // Include unassigned tires (inventory)
          if (!tire.machine_id) return true;
          // Filter by unit for assigned tires
          return tire.machines?.unit_id === selectedUnitId;
        });
      }

      return data || [];
    },
  });
}
