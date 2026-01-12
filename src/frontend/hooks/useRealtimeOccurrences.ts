import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeOccurrence {
  id: string;
  machine_id: string;
  status: string;
  description: string;
}

export function useRealtimeOccurrences() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('[Realtime] Setting up occurrences subscription...');
    
    const channel = supabase
      .channel('occurrences-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'occurrences'
        },
        (payload) => {
          console.log('[Realtime] Occurrence change:', payload.eventType, payload);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['occurrences-dashboard'] });
          
          // Show toast for new occurrences
          if (payload.eventType === 'INSERT') {
            const occurrence = payload.new as RealtimeOccurrence;
            toast.info('Nova ocorrência registrada', {
              description: occurrence.description.substring(0, 100),
              duration: 4000,
            });
          }
          
          if (payload.eventType === 'UPDATE') {
            const occurrence = payload.new as RealtimeOccurrence;
            if (occurrence.status === 'closed') {
              toast.success('Ocorrência fechada', {
                duration: 3000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Occurrences subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Cleaning up occurrences subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
