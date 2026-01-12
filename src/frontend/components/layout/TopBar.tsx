import { Menu, Search, WifiOff, RefreshCw, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { UnitSelector } from './UnitSelector';
import { NotificationCenter, useGlobalContext } from '@/components/global';

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
  const { setCommandPaletteOpen } = useGlobalContext();

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

      {/* Command Palette Trigger */}
      <Button
        variant="outline"
        className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground h-9 px-3"
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline">Buscar...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Mobile search button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden active:scale-95 transition-transform"
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Search className="w-5 h-5" />
      </Button>

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
      <NotificationCenter />
    </header>
  );
}
