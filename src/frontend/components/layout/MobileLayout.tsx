import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { FAB } from './FAB';
import { TopBar } from './TopBar';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showFAB?: boolean;
  fabHref?: string;
  onFabClick?: () => void;
  alertCount?: number;
}

export function MobileLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  showFAB = false,
  fabHref,
  onFabClick,
  alertCount = 0,
}: MobileLayoutProps) {
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-status-warning/15 text-status-warning px-4 py-2 flex items-center justify-center gap-2 text-sm shrink-0">
          <WifiOff className="w-4 h-4" />
          <span>Modo offline - dados serão sincronizados quando conectar</span>
        </div>
      )}

      {/* Top Bar */}
      <TopBar 
        title={title} 
        subtitle={subtitle} 
        showBackButton={showBackButton}
      />

      {/* Main Content */}
      <main className={cn(
        'flex-1 overflow-auto',
        'pb-20 lg:pb-6', // Account for bottom nav on mobile
      )}>
        {children}
      </main>

      {/* FAB */}
      {showFAB && (
        <FAB href={fabHref} onClick={onFabClick} />
      )}

      {/* Bottom Navigation */}
      <BottomNav alertCount={alertCount} />
    </div>
  );
}
