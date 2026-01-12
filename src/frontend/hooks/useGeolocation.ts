import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TerrainType = 'asphalt' | 'dirt' | 'gravel' | 'mud' | 'sand' | 'mixed';
export type ClimateCondition = 'sunny' | 'cloudy' | 'rainy' | 'foggy' | 'snow' | 'storm';
export type PerformanceStatus = 'optimal' | 'warning' | 'critical';

export interface GeoLocationData {
  id: string;
  machineId: string;
  machineName: string;
  tireId: string;
  tireSerial: string;
  latitude: number;
  longitude: number;
  terrainType: TerrainType;
  climate: ClimateCondition;
  timestamp: string;
  performanceScore: number;
  pressure: number;
  temperature: number;
  wearLevel: number;
  speed: number;
}

export interface GeoAlert {
  id: string;
  machineId: string;
  tireId: string;
  severity: 'low' | 'medium' | 'high';
  type: 'terrain' | 'climate' | 'performance' | 'wear';
  message: string;
  recommendation: string;
  location: { lat: number; lng: number };
  timestamp: string;
}

export interface GeoThresholds {
  terrainWearMultiplier: {
    asphalt: number;
    dirt: number;
    gravel: number;
    mud: number;
    sand: number;
    mixed: number;
  };
  climateImpact: {
    sunny: number;
    cloudy: number;
    rainy: number;
    foggy: number;
    snow: number;
    storm: number;
  };
  criticalPerformanceScore: number;
  warningPerformanceScore: number;
  criticalWearLevel: number;
  warningWearLevel: number;
}

const DEFAULT_THRESHOLDS: GeoThresholds = {
  terrainWearMultiplier: {
    asphalt: 1.0,
    dirt: 1.5,
    gravel: 1.8,
    mud: 2.0,
    sand: 1.7,
    mixed: 1.4,
  },
  climateImpact: {
    sunny: 1.0,
    cloudy: 1.0,
    rainy: 1.3,
    foggy: 1.1,
    snow: 1.5,
    storm: 1.8,
  },
  criticalPerformanceScore: 40,
  warningPerformanceScore: 60,
  criticalWearLevel: 80,
  warningWearLevel: 60,
};

// Mock data for demonstration
const generateMockGeoData = (machineId?: string): GeoLocationData[] => {
  const terrains: TerrainType[] = ['asphalt', 'dirt', 'gravel', 'mud', 'sand', 'mixed'];
  const climates: ClimateCondition[] = ['sunny', 'cloudy', 'rainy', 'foggy', 'snow', 'storm'];
  
  const machines = [
    { id: 'machine-1', name: 'Trator CAT 140M', baseLocation: { lat: -22.4167, lng: -45.4500 } },
    { id: 'machine-2', name: 'Escavadeira Komatsu PC200', baseLocation: { lat: -22.4200, lng: -45.4450 } },
    { id: 'machine-3', name: 'Carregadeira 966H', baseLocation: { lat: -22.4120, lng: -45.4550 } },
    { id: 'machine-4', name: 'Motoniveladora 12M', baseLocation: { lat: -22.4250, lng: -45.4400 } },
  ];

  const filteredMachines = machineId 
    ? machines.filter(m => m.id === machineId) 
    : machines;

  return filteredMachines.flatMap((machine, machineIndex) => {
    return Array.from({ length: 4 }, (_, tireIndex) => {
      const randomOffset = () => (Math.random() - 0.5) * 0.01;
      const performanceScore = Math.floor(Math.random() * 60) + 40;
      const wearLevel = Math.floor(Math.random() * 50) + 20;
      
      return {
        id: `geo-${machine.id}-tire-${tireIndex}`,
        machineId: machine.id,
        machineName: machine.name,
        tireId: `tire-${machine.id}-${tireIndex}`,
        tireSerial: `SN-${(machineIndex + 1) * 1000 + tireIndex + 1}`,
        latitude: machine.baseLocation.lat + randomOffset(),
        longitude: machine.baseLocation.lng + randomOffset(),
        terrainType: terrains[Math.floor(Math.random() * terrains.length)],
        climate: climates[Math.floor(Math.random() * 3)], // More likely to be sunny/cloudy/rainy
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        performanceScore,
        pressure: 100 + Math.random() * 20,
        temperature: 25 + Math.random() * 30,
        wearLevel,
        speed: Math.random() * 30,
      };
    });
  });
};

export const useGeoThresholds = () => {
  const [thresholds, setThresholds] = useState<GeoThresholds>(() => {
    const saved = localStorage.getItem('tirewatch-geo-thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  const updateThresholds = useCallback((newThresholds: Partial<GeoThresholds>) => {
    const updated = { ...thresholds, ...newThresholds };
    setThresholds(updated);
    localStorage.setItem('tirewatch-geo-thresholds', JSON.stringify(updated));
  }, [thresholds]);

  const resetThresholds = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.setItem('tirewatch-geo-thresholds', JSON.stringify(DEFAULT_THRESHOLDS));
  }, []);

  return { thresholds, updateThresholds, resetThresholds };
};

export const useMapboxToken = () => {
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('mapbox-public-token') || '';
  });

  const saveToken = useCallback((newToken: string) => {
    setToken(newToken);
    localStorage.setItem('mapbox-public-token', newToken);
  }, []);

  const clearToken = useCallback(() => {
    setToken('');
    localStorage.removeItem('mapbox-public-token');
  }, []);

  return { token, saveToken, clearToken, hasToken: token.length > 0 };
};

export const useGeolocation = (machineId?: string) => {
  const { thresholds } = useGeoThresholds();
  const [alerts, setAlerts] = useState<GeoAlert[]>([]);

  // Fetch machines from database
  const { data: machines = [], isLoading: machinesLoading } = useQuery({
    queryKey: ['machines-geo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, model, status')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // For now, use mock geolocation data since we don't have GPS data in the database
  const geoData = useMemo(() => generateMockGeoData(machineId), [machineId]);

  const getPerformanceStatus = useCallback((score: number): PerformanceStatus => {
    if (score <= thresholds.criticalPerformanceScore) return 'critical';
    if (score <= thresholds.warningPerformanceScore) return 'warning';
    return 'optimal';
  }, [thresholds]);

  const getTerrainImpact = useCallback((terrain: TerrainType): number => {
    return thresholds.terrainWearMultiplier[terrain];
  }, [thresholds]);

  const getClimateImpact = useCallback((climate: ClimateCondition): number => {
    return thresholds.climateImpact[climate];
  }, [thresholds]);

  const checkAlerts = useCallback(() => {
    const newAlerts: GeoAlert[] = [];

    geoData.forEach((data) => {
      const terrainImpact = getTerrainImpact(data.terrainType);
      const climateImpact = getClimateImpact(data.climate);
      const adjustedWear = data.wearLevel * terrainImpact * climateImpact;

      // Terrain-based alert
      if (terrainImpact >= 1.5) {
        newAlerts.push({
          id: `alert-terrain-${data.id}`,
          machineId: data.machineId,
          tireId: data.tireId,
          severity: terrainImpact >= 1.8 ? 'high' : 'medium',
          type: 'terrain',
          message: `Desgaste acelerado em terreno de ${getTerrainLabel(data.terrainType)}`,
          recommendation: 'Considere ajustar a pressão do pneu ou reduzir velocidade',
          location: { lat: data.latitude, lng: data.longitude },
          timestamp: new Date().toISOString(),
        });
      }

      // Climate-based alert
      if (climateImpact >= 1.3) {
        newAlerts.push({
          id: `alert-climate-${data.id}`,
          machineId: data.machineId,
          tireId: data.tireId,
          severity: climateImpact >= 1.5 ? 'high' : 'medium',
          type: 'climate',
          message: `Condição climática adversa: ${getClimateLabel(data.climate)}`,
          recommendation: 'Reduza a velocidade e aumente intervalos de inspeção',
          location: { lat: data.latitude, lng: data.longitude },
          timestamp: new Date().toISOString(),
        });
      }

      // Performance-based alert
      if (data.performanceScore <= thresholds.warningPerformanceScore) {
        newAlerts.push({
          id: `alert-perf-${data.id}`,
          machineId: data.machineId,
          tireId: data.tireId,
          severity: data.performanceScore <= thresholds.criticalPerformanceScore ? 'high' : 'medium',
          type: 'performance',
          message: `Desempenho do pneu abaixo do esperado: ${data.performanceScore}%`,
          recommendation: 'Agende inspeção preventiva ou considere substituição',
          location: { lat: data.latitude, lng: data.longitude },
          timestamp: new Date().toISOString(),
        });
      }

      // Wear-based alert
      if (adjustedWear >= thresholds.warningWearLevel) {
        newAlerts.push({
          id: `alert-wear-${data.id}`,
          machineId: data.machineId,
          tireId: data.tireId,
          severity: adjustedWear >= thresholds.criticalWearLevel ? 'high' : 'medium',
          type: 'wear',
          message: `Nível de desgaste elevado: ${Math.round(adjustedWear)}%`,
          recommendation: adjustedWear >= thresholds.criticalWearLevel 
            ? 'Substitua o pneu imediatamente' 
            : 'Programe substituição em breve',
          location: { lat: data.latitude, lng: data.longitude },
          timestamp: new Date().toISOString(),
        });
      }
    });

    setAlerts(newAlerts);
  }, [geoData, thresholds, getTerrainImpact, getClimateImpact]);

  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const stats = useMemo(() => {
    const total = geoData.length;
    const critical = geoData.filter(d => getPerformanceStatus(d.performanceScore) === 'critical').length;
    const warning = geoData.filter(d => getPerformanceStatus(d.performanceScore) === 'warning').length;
    const optimal = total - critical - warning;
    const avgPerformance = geoData.reduce((acc, d) => acc + d.performanceScore, 0) / (total || 1);

    return { total, critical, warning, optimal, avgPerformance };
  }, [geoData, getPerformanceStatus]);

  return {
    geoData,
    machines,
    alerts,
    stats,
    isLoading: machinesLoading,
    checkAlerts,
    clearAlerts,
    getPerformanceStatus,
    getTerrainImpact,
    getClimateImpact,
  };
};

// Utility functions for labels
export const getTerrainLabel = (terrain: TerrainType): string => {
  const labels: Record<TerrainType, string> = {
    asphalt: 'Asfalto',
    dirt: 'Terra',
    gravel: 'Cascalho',
    mud: 'Lama',
    sand: 'Areia',
    mixed: 'Misto',
  };
  return labels[terrain];
};

export const getClimateLabel = (climate: ClimateCondition): string => {
  const labels: Record<ClimateCondition, string> = {
    sunny: 'Ensolarado',
    cloudy: 'Nublado',
    rainy: 'Chuvoso',
    foggy: 'Neblina',
    snow: 'Neve',
    storm: 'Tempestade',
  };
  return labels[climate];
};

export const getTerrainIcon = (terrain: TerrainType): string => {
  const icons: Record<TerrainType, string> = {
    asphalt: '🛣️',
    dirt: '🏜️',
    gravel: '🪨',
    mud: '💧',
    sand: '🏖️',
    mixed: '🔀',
  };
  return icons[terrain];
};

export const getClimateIcon = (climate: ClimateCondition): string => {
  const icons: Record<ClimateCondition, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    foggy: '🌫️',
    snow: '❄️',
    storm: '⛈️',
  };
  return icons[climate];
};
