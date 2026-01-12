import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Wifi, WifiOff, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface LastUpdatedIndicatorProps {
  lastUpdated: Date | null;
  isOnline: boolean;
  isSyncing?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function LastUpdatedIndicator({
  lastUpdated,
  isOnline,
  isSyncing = false,
  onRefresh,
  className,
}: LastUpdatedIndicatorProps) {
  const [, forceUpdate] = useState({});

  // Update every 10 seconds to refresh "ago" text
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 10000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = () => {
    if (!lastUpdated) return 'Nunca';
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 5) return 'Agora';
    if (seconds < 60) return `Há ${seconds}s`;
    return formatDistanceToNow(lastUpdated, { addSuffix: false, locale: ptBR });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex items-center gap-2 text-xs',
        className
      )}
    >
      {/* Connection Status */}
      <AnimatePresence mode="wait">
        {!isOnline ? (
          <motion.div
            key="offline"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-status-warning/10 text-status-warning"
          >
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </motion.div>
        ) : isSyncing ? (
          <motion.div
            key="syncing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary"
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Sincronizando...</span>
          </motion.div>
        ) : (
          <motion.div
            key="online"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <Wifi className="w-3 h-3 text-status-ok" />
            <span>Atualizado {getTimeAgo()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh Button */}
      {onRefresh && isOnline && !isSyncing && (
        <button
          onClick={onRefresh}
          className="p-1 rounded-full hover:bg-muted transition-colors"
          title="Atualizar agora"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </motion.div>
  );
}
