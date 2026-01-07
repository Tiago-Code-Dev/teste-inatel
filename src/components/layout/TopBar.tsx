import { Bell, Menu, Search, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { UnitSelector } from './UnitSelector';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onMenuClick?: () => void;
}

export function TopBar({ title, subtitle, showBackButton, onMenuClick }: TopBarProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertCount] = useState(7); // Would come from context/API

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate sync updates
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const formatLastSync = useCallback(() => {
    const seconds = Math.floor((Date.now() - lastSync.getTime()) / 1000);
    if (seconds < 10) return 'Agora';
    if (seconds < 60) return `${seconds}s atrás`;
    return `${Math.floor(seconds / 60)}min atrás`;
  }, [lastSync]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastSync(new Date());
    setIsRefreshing(false);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 px-4 lg:px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden active:scale-95 transition-transform"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      {/* Unit Selector */}
      <UnitSelector />

      {/* Search */}
      <div className="hidden md:flex relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar máquinas, pneus..."
          className="pl-9 w-64 bg-muted/50 border-transparent focus:border-primary transition-colors"
        />
      </div>

      {/* Sync status */}
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
          isRefreshing && "opacity-70 cursor-not-allowed"
        )}
      >
        {isOnline ? (
          <>
            <RefreshCw className={cn("w-4 h-4 text-status-ok", isRefreshing && "animate-spin")} />
            <span className="text-xs text-muted-foreground">
              {isRefreshing ? 'Atualizando...' : `Sincronizado: ${formatLastSync()}`}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-status-warning" />
            <span className="text-xs text-status-warning">Offline</span>
          </>
        )}
      </button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative active:scale-95 transition-transform">
        <Bell className="w-5 h-5" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] font-semibold bg-status-critical text-white border-2 border-background rounded-full">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </Button>
    </header>
  );
}
