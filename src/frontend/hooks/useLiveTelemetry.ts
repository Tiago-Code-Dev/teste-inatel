import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TelemetryPoint {
  id: string;
  machine_id: string;
  tire_id: string | null;
  pressure: number;
  speed: number;
  timestamp: string;
  seq: number;
}

interface MachineTelemetryData {
  machineId: string;
  pressure: number[];
  speed: number[];
  latestPressure: number;
  latestSpeed: number;
  lastUpdated: Date;
}

interface UseLiveTelemetryOptions {
  machineIds: string[];
  maxDataPoints?: number;
  enabled?: boolean;
}

interface UseLiveTelemetryReturn {
  telemetryByMachine: Map<string, MachineTelemetryData>;
  isLoading: boolean;
  isConnected: boolean;
  error: Error | null;
  getMachineTelemetry: (machineId: string) => MachineTelemetryData | undefined;
}

// Default data points to keep in memory
const DEFAULT_MAX_DATA_POINTS = 30;

// Initial data generator for machines without telemetry
function generateInitialData(machineId: string, count: number): { pressure: number[]; speed: number[] } {
  const hash = machineId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePressure = 25 + (hash % 8);
  const baseSpeed = 10 + (hash % 20);
  
  const pressure: number[] = [];
  const speed: number[] = [];
  
  for (let i = 0; i < count; i++) {
    const wave = Math.sin((i + hash) / 4) * 2;
    const noise = (Math.random() - 0.5) * 1.5;
    
    pressure.push(basePressure + wave + noise);
    speed.push(baseSpeed + wave * 1.5 + noise * 2);
  }
  
  return { pressure, speed };
}

export function useLiveTelemetry({
  machineIds,
  maxDataPoints = DEFAULT_MAX_DATA_POINTS,
  enabled = true,
}: UseLiveTelemetryOptions): UseLiveTelemetryReturn {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [telemetryByMachine, setTelemetryByMachine] = useState<Map<string, MachineTelemetryData>>(new Map());
  const machineIdsRef = useRef(machineIds);

  // Update ref when machineIds change
  useEffect(() => {
    machineIdsRef.current = machineIds;
  }, [machineIds]);

  // Fetch initial telemetry data for all machines
  const { data: initialData, isLoading, error } = useQuery({
    queryKey: ['telemetry-sparklines', machineIds.sort().join(',')],
    queryFn: async () => {
      if (machineIds.length === 0) return new Map<string, TelemetryPoint[]>();

      // Fetch last N telemetry points for each machine
      const results = await Promise.all(
        machineIds.map(async (machineId) => {
          const { data, error } = await supabase
            .from('telemetry')
            .select('*')
            .eq('machine_id', machineId)
            .order('timestamp', { ascending: false })
            .limit(maxDataPoints);

          if (error) {
            console.error(`[Telemetry] Error fetching for ${machineId}:`, error);
            return { machineId, data: [] };
          }

          return { machineId, data: (data || []).reverse() as TelemetryPoint[] };
        })
      );

      const map = new Map<string, TelemetryPoint[]>();
      results.forEach(({ machineId, data }) => {
        map.set(machineId, data);
      });

      return map;
    },
    enabled: enabled && machineIds.length > 0,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Process initial data into sparkline format
  useEffect(() => {
    if (!initialData) return;

    const newTelemetryMap = new Map<string, MachineTelemetryData>();

    machineIds.forEach((machineId) => {
      const points = initialData.get(machineId) || [];
      
      if (points.length > 0) {
        // Use real data
        const pressureData = points.map(p => p.pressure);
        const speedData = points.map(p => p.speed);
        
        newTelemetryMap.set(machineId, {
          machineId,
          pressure: pressureData,
          speed: speedData,
          latestPressure: pressureData[pressureData.length - 1],
          latestSpeed: speedData[speedData.length - 1],
          lastUpdated: new Date(points[points.length - 1].timestamp),
        });
      } else {
        // Generate placeholder data for machines without telemetry
        const generated = generateInitialData(machineId, maxDataPoints);
        newTelemetryMap.set(machineId, {
          machineId,
          pressure: generated.pressure,
          speed: generated.speed,
          latestPressure: generated.pressure[generated.pressure.length - 1],
          latestSpeed: generated.speed[generated.speed.length - 1],
          lastUpdated: new Date(),
        });
      }
    });

    setTelemetryByMachine(newTelemetryMap);
  }, [initialData, machineIds, maxDataPoints]);

  // Real-time subscription for new telemetry
  useEffect(() => {
    if (!enabled || machineIds.length === 0) return;

    console.log('[Telemetry] Setting up real-time subscription for', machineIds.length, 'machines');

    const channel = supabase
      .channel('telemetry-live-sparklines')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
        },
        (payload) => {
          const newPoint = payload.new as TelemetryPoint;
          
          // Only process if this machine is in our list
          if (!machineIdsRef.current.includes(newPoint.machine_id)) return;

          console.log('[Telemetry] New reading for', newPoint.machine_id);

          setTelemetryByMachine((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(newPoint.machine_id);

            if (existing) {
              // Add new point and maintain max data points
              const newPressure = [...existing.pressure, newPoint.pressure].slice(-maxDataPoints);
              const newSpeed = [...existing.speed, newPoint.speed].slice(-maxDataPoints);

              newMap.set(newPoint.machine_id, {
                ...existing,
                pressure: newPressure,
                speed: newSpeed,
                latestPressure: newPoint.pressure,
                latestSpeed: newPoint.speed,
                lastUpdated: new Date(newPoint.timestamp),
              });
            } else {
              // First data point for this machine
              newMap.set(newPoint.machine_id, {
                machineId: newPoint.machine_id,
                pressure: [newPoint.pressure],
                speed: [newPoint.speed],
                latestPressure: newPoint.pressure,
                latestSpeed: newPoint.speed,
                lastUpdated: new Date(newPoint.timestamp),
              });
            }

            return newMap;
          });
        }
      )
      .subscribe((status) => {
        console.log('[Telemetry] Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('[Telemetry] Cleaning up subscription');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [enabled, machineIds.length, maxDataPoints]);

  const getMachineTelemetry = useCallback(
    (machineId: string) => telemetryByMachine.get(machineId),
    [telemetryByMachine]
  );

  return {
    telemetryByMachine,
    isLoading,
    isConnected,
    error: error as Error | null,
    getMachineTelemetry,
  };
}

// Hook for single machine telemetry
export function useMachineTelemetry(machineId: string | undefined, maxDataPoints = 30) {
  const machineIds = useMemo(
    () => (machineId ? [machineId] : []),
    [machineId]
  );

  const { telemetryByMachine, isLoading, isConnected, error } = useLiveTelemetry({
    machineIds,
    maxDataPoints,
    enabled: !!machineId,
  });

  const telemetry = machineId ? telemetryByMachine.get(machineId) : undefined;

  return {
    telemetry,
    pressure: telemetry?.pressure || [],
    speed: telemetry?.speed || [],
    latestPressure: telemetry?.latestPressure,
    latestSpeed: telemetry?.latestSpeed,
    isLoading,
    isConnected,
    error,
  };
}
