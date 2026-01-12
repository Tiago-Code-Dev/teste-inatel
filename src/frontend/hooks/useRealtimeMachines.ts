import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeMachine {
  id: string;
  name: string;
  status: string;
}

export function useRealtimeMachines() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('[Realtime] Setting up machines subscription...');
    
    const channel = supabase
      .channel('machines-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'machines'
        },
        (payload) => {
          console.log('[Realtime] Machine change:', payload);
          
          const oldMachine = payload.old as Partial<RealtimeMachine>;
          const newMachine = payload.new as RealtimeMachine;
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['machines-dashboard'] });
          
          // Show toast for status changes
          if (oldMachine.status !== newMachine.status) {
            const statusLabels: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' }> = {
              operational: { label: 'Operacional', type: 'success' },
              warning: { label: 'Atenção', type: 'warning' },
              critical: { label: 'Crítico', type: 'error' },
              offline: { label: 'Offline', type: 'info' }
            };
            
            const status = statusLabels[newMachine.status] || { label: newMachine.status, type: 'info' as const };
            
            if (status.type === 'error') {
              toast.error(`Máquina ${newMachine.name}: ${status.label}`, {
                duration: 5000
              });
            } else if (status.type === 'warning') {
              toast.warning(`Máquina ${newMachine.name}: ${status.label}`, {
                duration: 4000
              });
            } else {
              toast.info(`Máquina ${newMachine.name}: ${status.label}`, {
                duration: 3000
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Machines subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Cleaning up machines subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
