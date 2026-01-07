// Custom hooks exports
export { useOnlineStatus } from './useOnlineStatus';
export { useTireTimeline } from './useTireTimeline';
export { useRealtimeAlerts } from './useRealtimeAlerts';
export { useRealtimeMachines } from './useRealtimeMachines';
export { useRealtimeOccurrences } from './useRealtimeOccurrences';
export { apiClient, ingestTelemetry, fetchAlerts, performAlertAction, fetchMachineTimeline, fetchOccurrences, createOccurrence, updateOccurrence } from './useApiClient';

// Multi-tenancy hooks
export { 
  useMachinesWithUnit, 
  useAlertsWithUnit, 
  useTelemetryWithUnit, 
  useOccurrencesWithUnit,
  useTiresWithUnit 
} from './useUnitQueries';

// Microinteraction hooks
export { usePullToRefresh } from './usePullToRefresh';

// Live telemetry hooks
export { useLiveTelemetry, useMachineTelemetry } from './useLiveTelemetry';

// AI Insights hooks
export { useAIInsights } from './useAIInsights';
