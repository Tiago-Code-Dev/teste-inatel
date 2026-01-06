import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Truck, AlertTriangle, FileText, User, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Operação', href: '/', icon: Truck },
  { name: 'Telemetria', href: '/telemetry', icon: Activity },
  { name: 'Alertas', href: '/alerts', icon: AlertTriangle, badge: true },
  { name: 'Perfil', href: '/profile', icon: User },
];

interface BottomNavProps {
  alertCount?: number;
}

export function BottomNav({ alertCount = 0 }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden safe-area-bottom">
      <div className="flex items-stretch justify-around h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-0.5 py-2 transition-colors relative',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge && alertCount > 0 && (
                  <Badge 
                    className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 text-[10px] bg-status-critical text-white border-0"
                  >
                    {alertCount > 99 ? '99+' : alertCount}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
