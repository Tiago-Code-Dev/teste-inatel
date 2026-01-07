import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface NotificationOptions {
  enableSound?: boolean;
  enableVibration?: boolean;
  enableBrowserNotifications?: boolean;
}

interface PendingNotification {
  id: string;
  title: string;
  body: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
  timestamp: Date;
}

const NOTIFICATION_SOUNDS = {
  critical: '/sounds/critical-alert.mp3',
  high: '/sounds/high-alert.mp3',
  medium: '/sounds/medium-alert.mp3',
  low: '/sounds/low-alert.mp3',
} as const;

export function usePushNotifications(options: NotificationOptions = {}) {
  const {
    enableSound = true,
    enableVibration = true,
    enableBrowserNotifications = true,
  } = options;

  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Verificar e solicitar permissão
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('[Push] Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }

    setPermission('denied');
    return false;
  }, []);

  // Reproduzir som de alerta
  const playSound = useCallback((severity: string) => {
    if (!enableSound) return;

    const soundUrl = NOTIFICATION_SOUNDS[severity as keyof typeof NOTIFICATION_SOUNDS];
    if (!soundUrl) return;

    try {
      // Usar Web Audio API fallback se áudio não existir
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Frequência baseada na severidade
      const frequency = severity === 'critical' ? 880 : 
                       severity === 'high' ? 660 : 
                       severity === 'medium' ? 440 : 330;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.warn('[Push] Audio playback failed:', err);
    }
  }, [enableSound]);

  // Vibrar dispositivo
  const vibrate = useCallback((severity: string) => {
    if (!enableVibration || !navigator.vibrate) return;

    const patterns: Record<string, number[]> = {
      critical: [200, 100, 200, 100, 200],
      high: [200, 100, 200],
      medium: [200],
      low: [100],
    };

    navigator.vibrate(patterns[severity] || [100]);
  }, [enableVibration]);

  // Mostrar notificação do browser
  const showBrowserNotification = useCallback(
    async (notification: PendingNotification) => {
      if (!enableBrowserNotifications || permission !== 'granted') return;

      try {
        const severityEmoji: Record<string, string> = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢',
        };

        const emoji = severityEmoji[notification.severity] || '🔔';

        new Notification(`${emoji} ${notification.title}`, {
          body: notification.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: notification.severity === 'critical',
        });
      } catch (err) {
        console.warn('[Push] Browser notification failed:', err);
      }
    },
    [enableBrowserNotifications, permission]
  );

  // Criar e disparar notificação
  const notify = useCallback(
    (notification: Omit<PendingNotification, 'id' | 'timestamp'>) => {
      const fullNotification: PendingNotification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      // Adicionar à lista de pendentes
      setPendingNotifications((prev) => [fullNotification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);

      // Reproduzir som
      playSound(notification.severity);

      // Vibrar
      vibrate(notification.severity);

      // Mostrar notificação do browser
      showBrowserNotification(fullNotification);

      return fullNotification.id;
    },
    [playSound, vibrate, showBrowserNotification]
  );

  // Marcar notificações como lidas
  const markAsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } else {
      setUnreadCount(0);
    }
  }, []);

  // Limpar notificações
  const clearNotifications = useCallback(() => {
    setPendingNotifications([]);
    setUnreadCount(0);
  }, []);

  // Subscrição realtime para alertas
  useEffect(() => {
    console.log('[Push] Setting up realtime subscription for alerts...');

    const channel = supabase
      .channel('push-notifications-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          console.log('[Push] New alert received:', payload.new);

          const alert = payload.new as {
            id: string;
            message: string;
            severity: string;
            type: string;
            machine_id: string;
          };

          // Verificar se deve notificar baseado na severidade
          const shouldNotify = ['critical', 'high'].includes(alert.severity);
          if (shouldNotify) {
            notify({
              title: `Novo Alerta ${alert.severity === 'critical' ? 'Crítico' : 'Alto'}`,
              body: alert.message,
              severity: alert.severity as PendingNotification['severity'],
              data: { alertId: alert.id, type: 'alert' },
            });
          }

          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ['alerts'] });
          queryClient.invalidateQueries({ queryKey: ['command-center-alerts'] });
        }
      )
      .subscribe((status) => {
        console.log('[Push] Subscription status:', status);
      });

    return () => {
      console.log('[Push] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [notify, queryClient]);

  // Solicitar permissão ao montar
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    permission,
    requestPermission,
    notify,
    markAsRead,
    clearNotifications,
    pendingNotifications,
    unreadCount,
    isSupported: 'Notification' in window,
  };
}
