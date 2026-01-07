import { 
  LayoutDashboard, 
  Truck, 
  AlertTriangle, 
  FileText, 
  CircleDot,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Activity,
  Command,
  TrendingUp,
  Users,
  Droplets,
  MapPin,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { currentUser, dashboardStats } from '@/data/mockData';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Centro de Operações', href: '/command-center', icon: Command, badge: 3 },
  { name: 'Gestão de Equipe', href: '/team-operations', icon: Users },
  { name: 'Máquinas', href: '/machines', icon: Truck },
  { name: 'Telemetria', href: '/telemetry', icon: Activity },
  { name: 'Desgaste', href: '/wear', icon: TrendingUp },
  { name: 'Lastro Líquido', href: '/fluid', icon: Droplets },
  { name: 'Geolocalização', href: '/geolocation', icon: MapPin },
  { name: 'Equilíbrio', href: '/balance', icon: BarChart3 },
  { name: 'Custos', href: '/costs', icon: DollarSign },
  { name: 'Alertas', href: '/alerts', icon: AlertTriangle, badge: 7 },
  { name: 'Ocorrências', href: '/occurrences', icon: FileText, badge: 4 },
  { name: 'Pneus', href: '/tires', icon: CircleDot },
];

const secondaryNav = [
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
          <CircleDot className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">TireWatch</h1>
          <p className="text-xs text-muted-foreground">Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-2 px-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monitoramento
          </p>
        </div>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-glow-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'
              )} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge 
                  variant={isActive ? 'secondary' : 'default'}
                  className={cn(
                    'min-w-[1.5rem] h-5 flex items-center justify-center text-xs',
                    isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-status-critical text-white'
                  )}
                >
                  {item.badge}
                </Badge>
              )}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-primary-foreground/70" />
              )}
            </Link>
          );
        })}

        <div className="pt-6 mb-2 px-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sistema
          </p>
        </div>
        {secondaryNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-sidebar-foreground" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-sidebar-accent">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {currentUser.role === 'manager' ? 'Gestor' : currentUser.role}
            </p>
          </div>
          <button className="p-2 rounded-lg hover:bg-background/50 transition-colors">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>
  );
}
