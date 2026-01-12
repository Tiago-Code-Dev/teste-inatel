import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Circle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';

interface PresenceUser {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  online_at: string;
  current_page?: string;
}

interface TeamPresenceProps {
  className?: string;
  compact?: boolean;
  maxVisible?: number;
}

export function TeamPresence({ className, compact = false, maxVisible = 5 }: TeamPresenceProps) {
  const { user } = useAuth();
  const [presenceState, setPresenceState] = useState<Record<string, PresenceUser>>({});
  const [isConnected, setIsConnected] = useState(false);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user || !profile) return;

    const roomChannel = supabase.channel('command-center-presence', {
      config: {
        presence: { key: user.id },
      },
    });

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = roomChannel.presenceState();
        const flatState: Record<string, PresenceUser> = {};
        
        Object.entries(newState).forEach(([key, presences]) => {
          if (presences.length > 0) {
            const presence = presences[0] as unknown as PresenceUser;
            if (presence.id && presence.name) {
              flatState[key] = presence;
            }
          }
        });
        
        setPresenceState(flatState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (newPresences.length > 0) {
          const presence = newPresences[0] as unknown as PresenceUser;
          if (presence.id && presence.name) {
            setPresenceState(prev => ({
              ...prev,
              [key]: presence,
            }));
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setPresenceState(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await roomChannel.track({
            id: user.id,
            name: profile.name,
            email: profile.email,
            avatar_url: profile.avatar_url,
            online_at: new Date().toISOString(),
            current_page: '/command-center',
          });
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [user, profile]);

  const onlineUsers = Object.values(presenceState).filter(u => u.id !== user?.id);
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const overflowCount = Math.max(0, onlineUsers.length - maxVisible);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full',
                'bg-status-ok/10 text-status-ok',
                className
              )}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-status-ok"
              />
              <span className="text-xs font-medium">
                {onlineUsers.length + 1} online
              </span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-2">
            <div className="space-y-1">
              <p className="text-xs font-medium">Equipe online:</p>
              <p className="text-xs text-muted-foreground">Você</p>
              {onlineUsers.map(u => (
                <p key={u.id} className="text-xs text-muted-foreground">{u.name}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Equipe Online</span>
        </div>
        <motion.div
          animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            'flex items-center gap-1.5 text-xs',
            isConnected ? 'text-status-ok' : 'text-muted-foreground'
          )}
        >
          <Circle className="w-2 h-2 fill-current" />
          {onlineUsers.length + 1} online
        </motion.div>
      </div>

      {/* User avatars */}
      <div className="flex items-center -space-x-2">
        {/* Current user (always first) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <Avatar className="w-9 h-9 border-2 border-background ring-2 ring-primary/30">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {profile?.name?.slice(0, 2).toUpperCase() || 'EU'}
                  </AvatarFallback>
                </Avatar>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-ok rounded-full border-2 border-background"
                />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs font-medium">Você</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Other online users */}
        <AnimatePresence mode="popLayout">
          {visibleUsers.map((presenceUser, index) => (
            <TooltipProvider key={presenceUser.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <Avatar className="w-9 h-9 border-2 border-background hover:z-10 transition-transform hover:scale-110">
                      <AvatarImage src={presenceUser.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {presenceUser.name?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-status-ok rounded-full border-2 border-background" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs font-medium">{presenceUser.name}</p>
                  {presenceUser.current_page && (
                    <p className="text-xs text-muted-foreground">em {presenceUser.current_page}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </AnimatePresence>

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-muted border-2 border-background text-xs font-medium"
          >
            +{overflowCount}
          </motion.div>
        )}
      </div>

      {/* Empty state */}
      {onlineUsers.length === 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Você é o único online no momento
        </p>
      )}
    </div>
  );
}
