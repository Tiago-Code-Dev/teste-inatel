import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TimelineEvent, AlertSeverity } from '@/types';
import { TimeRangeOption, EventTypeOption } from '@/components/timeline';
import { subHours, subDays } from 'date-fns';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface UseTireTimelineOptions {
  tireId: string;
  initialTimeRange?: TimeRangeOption;
}

interface TireTimelineResult {
  events: TimelineEvent[];
  filteredEvents: TimelineEvent[];
  isLoading: boolean;
  error: Error | null;
  isOffline: boolean;
  timeRange: TimeRangeOption;
  customRange: { from: Date; to: Date } | undefined;
  eventTypeFilter: EventTypeOption[];
  eventCounts: Record<EventTypeOption, number>;
  setTimeRange: (range: TimeRangeOption, custom?: { from: Date; to: Date }) => void;
  setEventTypeFilter: (types: EventTypeOption[]) => void;
  refetch: () => void;
  isRefetching: boolean;
}

function getDateRangeFromOption(option: TimeRangeOption, customRange?: { from: Date; to: Date }): { from: Date; to: Date } {
  const now = new Date();
  
  switch (option) {
    case '6h':
      return { from: subHours(now, 6), to: now };
    case '24h':
      return { from: subHours(now, 24), to: now };
    case '7d':
      return { from: subDays(now, 7), to: now };
    case '30d':
      return { from: subDays(now, 30), to: now };
    case 'custom':
      return customRange || { from: subDays(now, 7), to: now };
    default:
      return { from: subDays(now, 7), to: now };
  }
}

export function useTireTimeline({ tireId, initialTimeRange = '7d' }: UseTireTimelineOptions): TireTimelineResult {
  const isOnline = useOnlineStatus();
  const [timeRange, setTimeRangeState] = useState<TimeRangeOption>(initialTimeRange);
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeOption[]>([]);

  const dateRange = useMemo(() => 
    getDateRangeFromOption(timeRange, customRange), 
    [timeRange, customRange]
  );

  // Fetch alerts for this tire
  const { 
    data: alertsData, 
    isLoading: alertsLoading, 
    error: alertsError, 
    refetch: refetchAlerts,
    isRefetching: alertsRefetching 
  } = useQuery({
    queryKey: ['tire-alerts', tireId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('tire_id', tireId)
        .gte('opened_at', dateRange.from.toISOString())
        .lte('opened_at', dateRange.to.toISOString())
        .order('opened_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isOnline && !!tireId,
  });

  // Fetch occurrences for this tire
  const { 
    data: occurrencesData, 
    isLoading: occurrencesLoading, 
    error: occurrencesError, 
    refetch: refetchOccurrences,
    isRefetching: occurrencesRefetching 
  } = useQuery({
    queryKey: ['tire-occurrences', tireId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('occurrences')
        .select('*')
        .eq('tire_id', tireId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isOnline && !!tireId,
  });

  // Fetch critical telemetry readings for this tire
  const { 
    data: telemetryData, 
    isLoading: telemetryLoading, 
    error: telemetryError, 
    refetch: refetchTelemetry,
    isRefetching: telemetryRefetching 
  } = useQuery({
    queryKey: ['tire-telemetry-critical', tireId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      // Get tire to check recommended pressure
      const { data: tireData } = await supabase
        .from('tires')
        .select('recommended_pressure')
        .eq('id', tireId)
        .maybeSingle();

      const recommendedPressure = tireData?.recommended_pressure || 28;
      const criticalThreshold = recommendedPressure * 0.85;

      const { data, error } = await supabase
        .from('telemetry')
        .select('*')
        .eq('tire_id', tireId)
        .lt('pressure', criticalThreshold)
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: isOnline && !!tireId,
  });

  // Convert database records to timeline events
  const events = useMemo<TimelineEvent[]>(() => {
    const timelineEvents: TimelineEvent[] = [];

    // Convert alerts to timeline events
    alertsData?.forEach(alert => {
      timelineEvents.push({
        id: `alert-${alert.id}`,
        type: 'alert',
        title: alert.message,
        description: alert.reason || 'Alerta gerado pelo sistema',
        timestamp: new Date(alert.opened_at),
        severity: alert.severity as AlertSeverity,
      });
    });

    // Convert occurrences to timeline events
    occurrencesData?.forEach(occurrence => {
      timelineEvents.push({
        id: `occurrence-${occurrence.id}`,
        type: 'occurrence',
        title: 'Ocorrência registrada',
        description: occurrence.description,
        timestamp: new Date(occurrence.created_at),
      });
    });

    // Convert critical telemetry to timeline events
    telemetryData?.forEach(reading => {
      timelineEvents.push({
        id: `telemetry-${reading.id}`,
        type: 'alert', // Use alert type for critical telemetry
        title: 'Telemetria crítica detectada',
        description: `Pressão registrada em ${Number(reading.pressure).toFixed(1)} PSI - abaixo do limite seguro`,
        timestamp: new Date(reading.timestamp),
        severity: 'critical',
      });
    });

    return timelineEvents;
  }, [alertsData, occurrencesData, telemetryData]);

  // Calculate event counts for filters
  const eventCounts = useMemo<Record<EventTypeOption, number>>(() => {
    const counts: Record<EventTypeOption, number> = {
      all: events.length,
      alert: 0,
      occurrence: 0,
      maintenance: 0,
      installation: 0,
      removal: 0,
      telemetry_critical: 0,
      info: 0,
    };

    events.forEach(event => {
      if (event.id.startsWith('telemetry-')) {
        counts.telemetry_critical++;
      } else if (event.type in counts) {
        counts[event.type as EventTypeOption]++;
      }
    });

    return counts;
  }, [events]);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (eventTypeFilter.length === 0 || eventTypeFilter.includes('all')) {
      return events;
    }
    
    return events.filter(event => {
      // Handle the mapping between filter options and event types
      if (eventTypeFilter.includes('telemetry_critical')) {
        if (event.id.startsWith('telemetry-')) return true;
      }
      return eventTypeFilter.includes(event.type as EventTypeOption);
    });
  }, [events, eventTypeFilter]);

  const setTimeRange = useCallback((range: TimeRangeOption, custom?: { from: Date; to: Date }) => {
    setTimeRangeState(range);
    if (range === 'custom' && custom) {
      setCustomRange(custom);
    }
  }, []);

  const refetch = useCallback(() => {
    refetchAlerts();
    refetchOccurrences();
    refetchTelemetry();
  }, [refetchAlerts, refetchOccurrences, refetchTelemetry]);

  const isLoading = alertsLoading || occurrencesLoading || telemetryLoading;
  const isRefetching = alertsRefetching || occurrencesRefetching || telemetryRefetching;
  const error = alertsError || occurrencesError || telemetryError;

  return {
    events,
    filteredEvents,
    isLoading,
    error: error as Error | null,
    isOffline: !isOnline,
    timeRange,
    customRange,
    eventTypeFilter,
    eventCounts,
    setTimeRange,
    setEventTypeFilter,
    refetch,
    isRefetching,
  };
}
