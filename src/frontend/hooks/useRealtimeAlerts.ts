import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeAlert {
  id: string;
  machine_id: string;
  type: string;
  severity: string;
  status: string;
  message: string;
}

export function useRealtimeAlerts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('[Realtime] Setting up alerts subscription...');
    
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          console.log('[Realtime] Alert change:', payload.eventType, payload);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['alerts-dashboard'] });
          
          // Show toast for new alerts
          if (payload.eventType === 'INSERT') {
            const alert = payload.new as RealtimeAlert;
            const severityLabel = {
              critical: '🔴 Crítico',
              high: '🟠 Alto',
              medium: '🟡 Médio',
              low: '🟢 Baixo'
            }[alert.severity] || alert.severity;
            
            toast.warning(`Novo Alerta: ${severityLabel}`, {
              description: alert.message,
              duration: 5000,
            });
          }
          
          if (payload.eventType === 'UPDATE') {
            const alert = payload.new as RealtimeAlert;
            if (alert.status === 'resolved') {
              toast.success('Alerta resolvido', {
                description: alert.message,
                duration: 3000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Alerts subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Cleaning up alerts subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
