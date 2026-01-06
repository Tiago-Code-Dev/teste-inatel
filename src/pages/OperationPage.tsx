import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { MachineCard } from '@/components/shared/MachineCard';
import { MetricCard } from '@/components/shared/MetricCard';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Truck, AlertTriangle, FileText, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Machine {
  id: string;
  name: string;
  model: string;
  unit_id: string;
  status: 'operational' | 'warning' | 'critical' | 'offline';
  last_telemetry_at: string;
}

interface Alert {
  id: string;
  severity: string;
  status: string;
}

const OperationPage = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const { data: machines, isLoading: machinesLoading, error: machinesError, refetch } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('status', { ascending: false });
      
      if (error) throw error;
      return data as Machine[];
    },
    staleTime: 10000, // 10 seconds
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('id, severity, status')
        .in('status', ['open', 'acknowledged']);
      
      if (error) throw error;
      return data as Alert[];
    },
  });

  const { data: occurrences } = useQuery({
    queryKey: ['occurrences-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('occurrences')
        .select('id, status')
        .in('status', ['open', 'in_progress', 'pending_upload']);
      
      if (error) throw error;
      return data;
    },
  });

  // Sort machines by criticality
  const sortedMachines = machines?.sort((a, b) => {
    const order = { critical: 0, warning: 1, offline: 2, operational: 3 };
    return order[a.status] - order[b.status];
  }) || [];

  const openAlerts = alerts?.filter(a => a.status === 'open').length || 0;
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;
  const openOccurrences = occurrences?.length || 0;

  // Mock telemetry data for display
  const getTelemetry = (machineId: string) => {
    // In real app, this would come from telemetry table
    const mockData: Record<string, { pressure: number; speed: number }> = {
      '11111111-1111-1111-1111-111111111111': { pressure: 18.5, speed: 12 },
      '22222222-2222-2222-2222-222222222222': { pressure: 32, speed: 8 },
      '33333333-3333-3333-3333-333333333333': { pressure: 28, speed: 15 },
      '44444444-4444-4444-4444-444444444444': { pressure: 30, speed: 10 },
      '66666666-6666-6666-6666-666666666666': { pressure: 27, speed: 5 },
    };
    return mockData[machineId];
  };

  if (machinesLoading) {
    return (
      <MobileLayout title="Operação" showFAB fabHref="/occurrences/new" alertCount={openAlerts}>
        <StateDisplay state="loading" className="h-[60vh]" />
      </MobileLayout>
    );
  }

  if (machinesError) {
    return (
      <MobileLayout title="Operação" alertCount={openAlerts}>
        <StateDisplay 
          state={isOnline ? 'error' : 'offline'} 
          className="h-[60vh]"
          action={{
            label: 'Tentar novamente',
            onClick: () => refetch(),
          }}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      title="Operação" 
      subtitle={`${sortedMachines.length} máquinas em operação`}
      showFAB 
      fabHref="/occurrences/new" 
      alertCount={openAlerts}
    >
      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Alertas Ativos"
            value={openAlerts}
            icon={AlertTriangle}
            trend={criticalAlerts > 0 ? 'down' : 'up'}
            trendValue={criticalAlerts > 0 ? `${criticalAlerts} críticos` : 'Nenhum crítico'}
            className={criticalAlerts > 0 ? 'border-status-critical/30' : ''}
          />
          <MetricCard
            title="Ocorrências"
            value={openOccurrences}
            icon={FileText}
            trend="neutral"
            trendValue="Em aberto"
          />
        </div>

        {/* Machines List */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Máquinas em Operação
          </h2>
          
          {sortedMachines.length === 0 ? (
            <StateDisplay 
              state="empty"
              title="Nenhuma máquina"
              description="Não há máquinas cadastradas no sistema"
            />
          ) : (
            <div className="space-y-3">
              {sortedMachines.map((machine) => (
                <MachineCard
                  key={machine.id}
                  machine={{
                    id: machine.id,
                    name: machine.name,
                    model: machine.model,
                    unitId: machine.unit_id,
                    status: machine.status,
                    lastTelemetryAt: new Date(machine.last_telemetry_at),
                  }}
                  telemetry={getTelemetry(machine.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default OperationPage;
