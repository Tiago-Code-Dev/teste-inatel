import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type VehicleStatus = 'operational' | 'maintenance' | 'inactive' | 'critical';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export interface VehicleTelemetry {
  latitude: number;
  longitude: number;
  speed: number;
  fuelLevel: number;
  engineTemp: number;
  odometer: number;
  lastUpdate: string;
}

export interface VehicleMaintenance {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  partsReplaced: string[];
  nextDue: string;
}

export interface VehicleAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  plate: string;
  status: VehicleStatus;
  telemetry: VehicleTelemetry;
  lastMaintenance: VehicleMaintenance | null;
  activeAlerts: number;
  operatingHours: number;
}

export interface ExternalIntegration {
  id: string;
  name: string;
  type: 'telemetry' | 'maintenance' | 'alerts' | 'fuel';
  status: IntegrationStatus;
  lastSync: string;
  apiEndpoint?: string;
  description: string;
}

export interface FleetStats {
  totalVehicles: number;
  operational: number;
  inMaintenance: number;
  inactive: number;
  critical: number;
  totalOperatingHours: number;
  activeAlerts: number;
  avgFuelLevel: number;
}

export interface FleetFilters {
  status: VehicleStatus | 'all';
  alertSeverity: AlertSeverity | 'all';
  search: string;
}

// Generate mock vehicles based on machines
const generateMockVehicles = (machines: any[]): Vehicle[] => {
  const statuses: VehicleStatus[] = ['operational', 'operational', 'operational', 'maintenance', 'inactive', 'critical'];
  
  return machines.map((machine, index) => ({
    id: machine.id,
    name: machine.name,
    model: machine.model,
    plate: `ABC-${1000 + index}`,
    status: statuses[index % statuses.length],
    telemetry: {
      latitude: -22.9 + Math.random() * 0.2,
      longitude: -43.2 + Math.random() * 0.2,
      speed: Math.floor(Math.random() * 80),
      fuelLevel: Math.floor(30 + Math.random() * 70),
      engineTemp: Math.floor(70 + Math.random() * 30),
      odometer: Math.floor(10000 + Math.random() * 50000),
      lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString()
    },
    lastMaintenance: {
      id: `maint-${machine.id}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: ['Preventiva', 'Corretiva', 'Revisão'][Math.floor(Math.random() * 3)],
      description: 'Manutenção de rotina',
      cost: Math.floor(500 + Math.random() * 2000),
      partsReplaced: ['Filtro de óleo', 'Pastilhas de freio'].slice(0, Math.floor(Math.random() * 3)),
      nextDue: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    activeAlerts: Math.floor(Math.random() * 3),
    operatingHours: Math.floor(100 + Math.random() * 500)
  }));
};

// Generate mock alerts
const generateMockAlerts = (vehicles: Vehicle[]): VehicleAlert[] => {
  const alertTypes = [
    { type: 'fuel_low', message: 'Nível de combustível baixo', severity: 'medium' as AlertSeverity },
    { type: 'engine_temp', message: 'Temperatura do motor alta', severity: 'high' as AlertSeverity },
    { type: 'maintenance_due', message: 'Manutenção preventiva necessária', severity: 'low' as AlertSeverity },
    { type: 'engine_failure', message: 'Falha crítica no motor', severity: 'critical' as AlertSeverity },
    { type: 'speed_limit', message: 'Velocidade acima do limite', severity: 'medium' as AlertSeverity },
  ];
  
  const alerts: VehicleAlert[] = [];
  
  vehicles.forEach(vehicle => {
    const numAlerts = vehicle.activeAlerts;
    for (let i = 0; i < numAlerts; i++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      alerts.push({
        id: `alert-${vehicle.id}-${i}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        severity: alertType.severity,
        type: alertType.type,
        message: alertType.message,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        isResolved: false
      });
    }
  });
  
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

// Mock integrations
const mockIntegrations: ExternalIntegration[] = [
  {
    id: 'int-1',
    name: 'Sistema de Telemetria GPS',
    type: 'telemetry',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    apiEndpoint: 'https://api.telemetry.example.com/v1',
    description: 'Integração com sistema de rastreamento GPS em tempo real'
  },
  {
    id: 'int-2',
    name: 'Sistema de Manutenção',
    type: 'maintenance',
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    apiEndpoint: 'https://api.maintenance.example.com/v2',
    description: 'Integração com sistema de gestão de manutenção preventiva'
  },
  {
    id: 'int-3',
    name: 'Central de Alertas',
    type: 'alerts',
    status: 'syncing',
    lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    apiEndpoint: 'https://api.alerts.example.com/v1',
    description: 'Sistema de alertas e notificações em tempo real'
  },
  {
    id: 'int-4',
    name: 'Gestão de Combustível',
    type: 'fuel',
    status: 'disconnected',
    lastSync: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    apiEndpoint: 'https://api.fuel.example.com/v1',
    description: 'Integração com sistema de gestão de abastecimento'
  }
];

export const useFleetManagement = () => {
  const { data: machines = [], isLoading } = useQuery({
    queryKey: ['machines-fleet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, model, status')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const [filters, setFilters] = useState<FleetFilters>({
    status: 'all',
    alertSeverity: 'all',
    search: ''
  });

  const [integrations, setIntegrations] = useState<ExternalIntegration[]>(mockIntegrations);

  // Generate mock data
  const vehicles = useMemo(() => {
    if (!machines.length) return [];
    return generateMockVehicles(machines);
  }, [machines]);

  const alerts = useMemo(() => {
    return generateMockAlerts(vehicles);
  }, [vehicles]);

  // Calculate fleet stats
  const stats = useMemo((): FleetStats => {
    const operational = vehicles.filter(v => v.status === 'operational').length;
    const inMaintenance = vehicles.filter(v => v.status === 'maintenance').length;
    const inactive = vehicles.filter(v => v.status === 'inactive').length;
    const critical = vehicles.filter(v => v.status === 'critical').length;
    const totalOperatingHours = vehicles.reduce((sum, v) => sum + v.operatingHours, 0);
    const avgFuelLevel = vehicles.length > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + v.telemetry.fuelLevel, 0) / vehicles.length)
      : 0;

    return {
      totalVehicles: vehicles.length,
      operational,
      inMaintenance,
      inactive,
      critical,
      totalOperatingHours,
      activeAlerts: alerts.filter(a => !a.isResolved).length,
      avgFuelLevel
    };
  }, [vehicles, alerts]);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesStatus = filters.status === 'all' || vehicle.status === filters.status;
      const matchesSearch = !filters.search || 
        vehicle.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [vehicles, filters]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSeverity = filters.alertSeverity === 'all' || alert.severity === filters.alertSeverity;
      return matchesSeverity && !alert.isResolved;
    });
  }, [alerts, filters]);

  const updateFilters = useCallback((newFilters: Partial<FleetFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const getVehicle = useCallback((id: string) => {
    return vehicles.find(v => v.id === id);
  }, [vehicles]);

  const getVehicleAlerts = useCallback((vehicleId: string) => {
    return alerts.filter(a => a.vehicleId === vehicleId);
  }, [alerts]);

  const testIntegration = useCallback(async (integrationId: string) => {
    // Simulate API test
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId ? { ...int, status: 'syncing' } : int
    ));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId 
        ? { ...int, status: 'connected', lastSync: new Date().toISOString() } 
        : int
    ));
  }, []);

  const toggleIntegration = useCallback((integrationId: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId 
        ? { ...int, status: int.status === 'connected' ? 'disconnected' : 'connected' } 
        : int
    ));
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    // In real app, this would call an API
    console.log('Resolving alert:', alertId);
  }, []);

  return {
    // Data
    vehicles: filteredVehicles,
    allVehicles: vehicles,
    alerts: filteredAlerts,
    allAlerts: alerts,
    integrations,
    stats,
    
    // Filters
    filters,
    updateFilters,
    
    // Actions
    getVehicle,
    getVehicleAlerts,
    testIntegration,
    toggleIntegration,
    resolveAlert,
    
    // Loading
    isLoading
  };
};
