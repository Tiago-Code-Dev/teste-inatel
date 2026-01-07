import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Unit {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

interface TenantContextType {
  /** All units the user has access to */
  units: Unit[];
  /** Currently selected unit (null = all units) */
  selectedUnitId: string | null;
  /** Select a specific unit or null for all */
  selectUnit: (unitId: string | null) => void;
  /** Check if user has access to a specific unit */
  hasUnitAccess: (unitId: string) => boolean;
  /** Loading state */
  isLoading: boolean;
  /** User's unit IDs from profile */
  userUnitIds: string[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(() => {
    // Restore from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedUnitId') || null;
    }
    return null;
  });

  // Fetch user's profile to get unit_ids
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('unit_ids')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const userUnitIds = profile?.unit_ids || [];

  // Fetch units the user has access to
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return data as Unit[];
    },
    enabled: !!user?.id,
  });

  // Persist selected unit to localStorage
  useEffect(() => {
    if (selectedUnitId) {
      localStorage.setItem('selectedUnitId', selectedUnitId);
    } else {
      localStorage.removeItem('selectedUnitId');
    }
  }, [selectedUnitId]);

  // Validate selected unit still exists in user's units
  useEffect(() => {
    if (selectedUnitId && units.length > 0) {
      const unitExists = units.some(u => u.id === selectedUnitId);
      if (!unitExists) {
        setSelectedUnitId(null);
      }
    }
  }, [selectedUnitId, units]);

  const selectUnit = useCallback((unitId: string | null) => {
    setSelectedUnitId(unitId);
    // Invalidate all queries that depend on unit filtering
    queryClient.invalidateQueries({ queryKey: ['machines'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['telemetry'] });
    queryClient.invalidateQueries({ queryKey: ['occurrences'] });
    queryClient.invalidateQueries({ queryKey: ['tires'] });
  }, [queryClient]);

  const hasUnitAccess = useCallback((unitId: string) => {
    return units.some(u => u.id === unitId);
  }, [units]);

  return (
    <TenantContext.Provider
      value={{
        units,
        selectedUnitId,
        selectUnit,
        hasUnitAccess,
        isLoading,
        userUnitIds,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
