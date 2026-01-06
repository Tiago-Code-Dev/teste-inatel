import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://mwvtdxdzvxzmswpkeoko.supabase.co';

interface TelemetryPayload {
  machineId: string;
  tireId?: string;
  pressure: number;
  speed: number;
  timestamp?: string;
}

interface AlertActionPayload {
  action: 'assign' | 'acknowledge' | 'resolve' | 'reopen';
  assignedTo?: string;
  comment?: string;
}

interface CreateOccurrencePayload {
  alertId?: string;
  machineId: string;
  tireId?: string;
  description: string;
  isOfflineCreated?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dnRkeGR6dnh6bXN3cGtlb2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDczNDgsImV4cCI6MjA4MzI4MzM0OH0.6Ht9A2OTYoPpOWcsRf9LEdYoviRSdSoX1i1Uyzv69ig',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

// Telemetry API
export async function ingestTelemetry(readings: TelemetryPayload[]): Promise<ApiResponse<{ processed: number; alerts_generated: number }>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/telemetry-ingest`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ readings }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to ingest telemetry' };
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Telemetry ingest error:', error);
    return { data: null, error: 'Network error' };
  }
}

// Alerts API
export async function fetchAlerts(params?: {
  severity?: string;
  type?: string;
  status?: string;
  machineId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<any>> {
  try {
    const headers = await getAuthHeaders();
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const url = `${SUPABASE_URL}/functions/v1/alerts?${searchParams.toString()}`;
    const response = await fetch(url, { method: 'GET', headers });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to fetch alerts' };
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Alerts fetch error:', error);
    return { data: null, error: 'Network error' };
  }
}

// Alert Actions API
export async function performAlertAction(
  alertId: string, 
  action: AlertActionPayload
): Promise<ApiResponse<any>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/alert-actions?alertId=${alertId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(action),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to perform alert action' };
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Alert action error:', error);
    return { data: null, error: 'Network error' };
  }
}

// Machine Timeline API
export async function fetchMachineTimeline(
  machineId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    eventTypes?: string[];
    limit?: number;
  }
): Promise<ApiResponse<any>> {
  try {
    const headers = await getAuthHeaders();
    const searchParams = new URLSearchParams({ machineId });
    
    if (params) {
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.eventTypes) searchParams.append('eventTypes', params.eventTypes.join(','));
      if (params.limit) searchParams.append('limit', String(params.limit));
    }
    
    const url = `${SUPABASE_URL}/functions/v1/machine-timeline?${searchParams.toString()}`;
    const response = await fetch(url, { method: 'GET', headers });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to fetch timeline' };
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Timeline fetch error:', error);
    return { data: null, error: 'Network error' };
  }
}

// Occurrences API
export async function fetchOccurrences(params?: {
  machineId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<any>> {
  try {
    const headers = await getAuthHeaders();
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const url = `${SUPABASE_URL}/functions/v1/occurrences?${searchParams.toString()}`;
    const response = await fetch(url, { method: 'GET', headers });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to fetch occurrences' };
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Occurrences fetch error:', error);
    return { data: null, error: 'Network error' };
  }
}

export async function createOccurrence(payload: CreateOccurrencePayload): Promise<ApiResponse<any>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/occurrences`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to create occurrence' };
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Create occurrence error:', error);
    return { data: null, error: 'Network error' };
  }
}

export async function updateOccurrence(
  occurrenceId: string,
  payload: { status?: string; description?: string }
): Promise<ApiResponse<any>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/occurrences/${occurrenceId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to update occurrence' };
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Update occurrence error:', error);
    return { data: null, error: 'Network error' };
  }
}

// Export all API functions
export const apiClient = {
  telemetry: {
    ingest: ingestTelemetry,
  },
  alerts: {
    fetch: fetchAlerts,
    action: performAlertAction,
  },
  machines: {
    timeline: fetchMachineTimeline,
  },
  occurrences: {
    fetch: fetchOccurrences,
    create: createOccurrence,
    update: updateOccurrence,
  },
};
