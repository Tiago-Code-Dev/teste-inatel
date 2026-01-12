import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CostCategory = 'fuel' | 'maintenance' | 'parts' | 'labor' | 'other';
export type CostPeriod = '6h' | '24h' | '7d' | '30d' | 'custom';

export interface CostEntry {
  id: string;
  machineId: string;
  machineName: string;
  category: CostCategory;
  value: number;
  description: string;
  timestamp: string;
  operatingHours?: number;
}

export interface MachineCostSummary {
  machineId: string;
  machineName: string;
  model: string;
  status: string;
  totalCost: number;
  fuelCost: number;
  maintenanceCost: number;
  partsCost: number;
  laborCost: number;
  otherCost: number;
  operatingHours: number;
  costPerHour: number;
  isOverBudget: boolean;
}

export interface CostAlert {
  id: string;
  machineId: string;
  machineName: string;
  category: CostCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
}

export interface CostThresholds {
  fuelLimit: number;
  maintenanceLimit: number;
  partsLimit: number;
  totalLimit: number;
  costPerHourLimit: number;
}

export interface CostFilters {
  period: CostPeriod;
  machineId: string | null;
  category: CostCategory | 'all';
  showAlerts: boolean;
}

const DEFAULT_THRESHOLDS: CostThresholds = {
  fuelLimit: 5000,
  maintenanceLimit: 3000,
  partsLimit: 2000,
  totalLimit: 15000,
  costPerHourLimit: 150
};

const CATEGORY_LABELS: Record<CostCategory, string> = {
  fuel: 'Combustível',
  maintenance: 'Manutenção',
  parts: 'Peças',
  labor: 'Mão de Obra',
  other: 'Outros'
};

const CATEGORY_COLORS: Record<CostCategory, string> = {
  fuel: '#f59e0b',
  maintenance: '#3b82f6',
  parts: '#8b5cf6',
  labor: '#10b981',
  other: '#6b7280'
};

// Generate mock cost data
const generateMockCosts = (machines: any[]): CostEntry[] => {
  const costs: CostEntry[] = [];
  const categories: CostCategory[] = ['fuel', 'maintenance', 'parts', 'labor', 'other'];
  
  machines.forEach(machine => {
    // Generate 5-15 cost entries per machine
    const numEntries = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < numEntries; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const baseValue = category === 'fuel' ? 500 : category === 'maintenance' ? 300 : category === 'parts' ? 200 : 100;
      const value = baseValue + Math.random() * baseValue * 2;
      
      costs.push({
        id: `cost-${machine.id}-${i}`,
        machineId: machine.id,
        machineName: machine.name,
        category,
        value: Math.round(value * 100) / 100,
        description: `${CATEGORY_LABELS[category]} - ${machine.name}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        operatingHours: Math.floor(Math.random() * 50) + 10
      });
    }
  });
  
  return costs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const useCostManagement = () => {
  const { data: machines = [], isLoading: machinesLoading } = useQuery({
    queryKey: ['machines-cost'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, model, status')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });
  
  const [filters, setFilters] = useState<CostFilters>({
    period: '7d',
    machineId: null,
    category: 'all',
    showAlerts: true
  });
  
  const [thresholds, setThresholds] = useState<CostThresholds>(() => {
    const saved = localStorage.getItem('tirewatch-cost-thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  // Generate mock costs based on machines
  const allCosts = useMemo(() => {
    if (!machines.length) return [];
    return generateMockCosts(machines);
  }, [machines]);

  // Filter costs by period
  const filteredCosts = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (filters.period) {
      case '6h':
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return allCosts.filter(cost => {
      const costDate = new Date(cost.timestamp);
      const inPeriod = costDate >= startDate;
      const matchesMachine = !filters.machineId || cost.machineId === filters.machineId;
      const matchesCategory = filters.category === 'all' || cost.category === filters.category;
      
      return inPeriod && matchesMachine && matchesCategory;
    });
  }, [allCosts, filters]);

  // Calculate machine cost summaries
  const machineCostSummaries = useMemo((): MachineCostSummary[] => {
    const summaryMap = new Map<string, MachineCostSummary>();
    
    machines.forEach(machine => {
      summaryMap.set(machine.id, {
        machineId: machine.id,
        machineName: machine.name,
        model: machine.model,
        status: machine.status,
        totalCost: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        partsCost: 0,
        laborCost: 0,
        otherCost: 0,
        operatingHours: 0,
        costPerHour: 0,
        isOverBudget: false
      });
    });
    
    filteredCosts.forEach(cost => {
      const summary = summaryMap.get(cost.machineId);
      if (summary) {
        summary.totalCost += cost.value;
        summary.operatingHours += cost.operatingHours || 0;
        
        switch (cost.category) {
          case 'fuel':
            summary.fuelCost += cost.value;
            break;
          case 'maintenance':
            summary.maintenanceCost += cost.value;
            break;
          case 'parts':
            summary.partsCost += cost.value;
            break;
          case 'labor':
            summary.laborCost += cost.value;
            break;
          case 'other':
            summary.otherCost += cost.value;
            break;
        }
      }
    });
    
    // Calculate cost per hour and check budget
    summaryMap.forEach(summary => {
      summary.costPerHour = summary.operatingHours > 0 
        ? Math.round((summary.totalCost / summary.operatingHours) * 100) / 100 
        : 0;
      summary.isOverBudget = summary.totalCost > thresholds.totalLimit || 
        summary.costPerHour > thresholds.costPerHourLimit;
    });
    
    return Array.from(summaryMap.values()).sort((a, b) => b.totalCost - a.totalCost);
  }, [machines, filteredCosts, thresholds]);

  // Calculate overall totals
  const costTotals = useMemo(() => {
    const totals = {
      fuel: 0,
      maintenance: 0,
      parts: 0,
      labor: 0,
      other: 0,
      total: 0,
      operatingHours: 0,
      costPerHour: 0
    };
    
    machineCostSummaries.forEach(summary => {
      totals.fuel += summary.fuelCost;
      totals.maintenance += summary.maintenanceCost;
      totals.parts += summary.partsCost;
      totals.labor += summary.laborCost;
      totals.other += summary.otherCost;
      totals.total += summary.totalCost;
      totals.operatingHours += summary.operatingHours;
    });
    
    totals.costPerHour = totals.operatingHours > 0 
      ? Math.round((totals.total / totals.operatingHours) * 100) / 100 
      : 0;
    
    return totals;
  }, [machineCostSummaries]);

  // Generate cost alerts
  const costAlerts = useMemo((): CostAlert[] => {
    const alerts: CostAlert[] = [];
    
    machineCostSummaries.forEach(summary => {
      // Check fuel limit
      if (summary.fuelCost > thresholds.fuelLimit) {
        alerts.push({
          id: `alert-fuel-${summary.machineId}`,
          machineId: summary.machineId,
          machineName: summary.machineName,
          category: 'fuel',
          severity: summary.fuelCost > thresholds.fuelLimit * 1.5 ? 'critical' : 'high',
          message: `Custo de combustível excedeu o limite`,
          currentValue: summary.fuelCost,
          threshold: thresholds.fuelLimit,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check maintenance limit
      if (summary.maintenanceCost > thresholds.maintenanceLimit) {
        alerts.push({
          id: `alert-maintenance-${summary.machineId}`,
          machineId: summary.machineId,
          machineName: summary.machineName,
          category: 'maintenance',
          severity: summary.maintenanceCost > thresholds.maintenanceLimit * 1.5 ? 'critical' : 'high',
          message: `Custo de manutenção excedeu o limite`,
          currentValue: summary.maintenanceCost,
          threshold: thresholds.maintenanceLimit,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check parts limit
      if (summary.partsCost > thresholds.partsLimit) {
        alerts.push({
          id: `alert-parts-${summary.machineId}`,
          machineId: summary.machineId,
          machineName: summary.machineName,
          category: 'parts',
          severity: summary.partsCost > thresholds.partsLimit * 1.5 ? 'critical' : 'medium',
          message: `Custo de peças excedeu o limite`,
          currentValue: summary.partsCost,
          threshold: thresholds.partsLimit,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check total limit
      if (summary.totalCost > thresholds.totalLimit) {
        alerts.push({
          id: `alert-total-${summary.machineId}`,
          machineId: summary.machineId,
          machineName: summary.machineName,
          category: 'other',
          severity: 'critical',
          message: `Custo total excedeu o limite`,
          currentValue: summary.totalCost,
          threshold: thresholds.totalLimit,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check cost per hour limit
      if (summary.costPerHour > thresholds.costPerHourLimit) {
        alerts.push({
          id: `alert-cph-${summary.machineId}`,
          machineId: summary.machineId,
          machineName: summary.machineName,
          category: 'other',
          severity: 'high',
          message: `Custo por hora excedeu o limite`,
          currentValue: summary.costPerHour,
          threshold: thresholds.costPerHourLimit,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [machineCostSummaries, thresholds]);

  // Chart data for cost by category
  const costByCategoryData = useMemo(() => {
    return [
      { name: 'Combustível', value: costTotals.fuel, color: CATEGORY_COLORS.fuel },
      { name: 'Manutenção', value: costTotals.maintenance, color: CATEGORY_COLORS.maintenance },
      { name: 'Peças', value: costTotals.parts, color: CATEGORY_COLORS.parts },
      { name: 'Mão de Obra', value: costTotals.labor, color: CATEGORY_COLORS.labor },
      { name: 'Outros', value: costTotals.other, color: CATEGORY_COLORS.other }
    ].filter(item => item.value > 0);
  }, [costTotals]);

  // Chart data for cost by machine
  const costByMachineData = useMemo(() => {
    return machineCostSummaries
      .slice(0, 10)
      .map(summary => ({
        name: summary.machineName,
        fuel: summary.fuelCost,
        maintenance: summary.maintenanceCost,
        parts: summary.partsCost,
        labor: summary.laborCost,
        other: summary.otherCost,
        total: summary.totalCost
      }));
  }, [machineCostSummaries]);

  // Time series data for cost trends
  const costTrendData = useMemo(() => {
    const days = filters.period === '6h' ? 1 : filters.period === '24h' ? 1 : filters.period === '7d' ? 7 : 30;
    const data: { date: string; fuel: number; maintenance: number; parts: number; labor: number; other: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      const dayCosts = filteredCosts.filter(cost => {
        const costDate = new Date(cost.timestamp);
        return costDate.toDateString() === date.toDateString();
      });
      
      const dayData = {
        date: dateStr,
        fuel: 0,
        maintenance: 0,
        parts: 0,
        labor: 0,
        other: 0
      };
      
      dayCosts.forEach(cost => {
        dayData[cost.category] += cost.value;
      });
      
      data.push(dayData);
    }
    
    return data;
  }, [filteredCosts, filters.period]);

  const updateFilters = useCallback((newFilters: Partial<CostFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateThresholds = useCallback((newThresholds: Partial<CostThresholds>) => {
    const updated = { ...thresholds, ...newThresholds };
    setThresholds(updated);
    localStorage.setItem('tirewatch-cost-thresholds', JSON.stringify(updated));
  }, [thresholds]);

  const getMachineSummary = useCallback((machineId: string) => {
    return machineCostSummaries.find(s => s.machineId === machineId);
  }, [machineCostSummaries]);

  const getMachineCosts = useCallback((machineId: string) => {
    return filteredCosts.filter(c => c.machineId === machineId);
  }, [filteredCosts]);

  return {
    // Data
    costs: filteredCosts,
    machineCostSummaries,
    costTotals,
    costAlerts,
    machines,
    
    // Chart data
    costByCategoryData,
    costByMachineData,
    costTrendData,
    
    // Filters & Settings
    filters,
    thresholds,
    updateFilters,
    updateThresholds,
    
    // Helpers
    getMachineSummary,
    getMachineCosts,
    categoryLabels: CATEGORY_LABELS,
    categoryColors: CATEGORY_COLORS,
    
    // Loading state
    isLoading: machinesLoading
  };
};
