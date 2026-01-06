import { Bell, Menu, Search, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, subtitle, onMenuClick }: TopBarProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());

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

  const formatLastSync = () => {
    const seconds = Math.floor((Date.now() - lastSync.getTime()) / 1000);
    if (seconds < 10) return 'Agora';
    if (seconds < 60) return `${seconds}s atrás`;
    return `${Math.floor(seconds / 60)}min atrás`;
  };

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 px-4 lg:px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
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

      {/* Search */}
      <div className="hidden md:flex relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar máquinas, pneus..."
          className="pl-9 w-64 bg-muted/50 border-transparent focus:border-primary"
        />
      </div>

      {/* Sync status */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-status-ok" />
            <span className="text-xs text-muted-foreground">
              Sincronizado: {formatLastSync()}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-status-warning" />
            <span className="text-xs text-status-warning">Offline</span>
          </>
        )}
      </div>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] bg-status-critical text-white border-2 border-background">
          7
        </Badge>
      </Button>
    </header>
  );
}
