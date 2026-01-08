import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Smartphone,
  Truck,
  Activity,
  AlertTriangle,
  MapPin,
  BarChart3,
  Settings,
  ChevronDown,
  Gauge,
  DollarSign,
  CircleDot,
  Droplets,
  Target,
  Scale,
  TrendingUp,
  FileText,
  Users,
  LogOut,
  Command,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { currentUser } from '@/data/mockData';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  title: string;
  icon: typeof LayoutDashboard;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    title: 'Visão Geral',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Centro de Operações', href: '/command-center', icon: Command },
      { name: 'Gestão de Equipe', href: '/team-operations', icon: Users },
    ],
  },
  {
    title: 'Ativos',
    icon: Smartphone,
    items: [
      { name: 'Dispositivos', href: '/devices', icon: Smartphone },
      { name: 'Máquinas', href: '/machines', icon: Truck },
      { name: 'Pneus', href: '/tires', icon: CircleDot },
      { name: 'Frota', href: '/fleet', icon: Truck },
    ],
  },
  {
    title: 'Monitoramento',
    icon: Activity,
    items: [
      { name: 'Telemetria', href: '/telemetry', icon: Activity },
      { name: 'Alertas', href: '/alerts', icon: AlertTriangle },
      { name: 'Ocorrências', href: '/occurrences', icon: FileText },
      { name: 'Geolocalização', href: '/geolocation', icon: MapPin },
    ],
  },
  {
    title: 'Análise',
    icon: BarChart3,
    items: [
      { name: 'Business Intelligence', href: '/bi', icon: BarChart3 },
      { name: 'Analytics Avançado', href: '/analytics', icon: TrendingUp },
      { name: 'Custos', href: '/costs', icon: DollarSign },
      { name: 'Desgaste', href: '/wear', icon: Gauge },
      { name: 'Calibração', href: '/calibration', icon: Target },
      { name: 'Deformação', href: '/deformation', icon: CircleDot },
      { name: 'Carga', href: '/load', icon: Scale },
      { name: 'Fluido & Lastro', href: '/fluid', icon: Droplets },
    ],
  },
];

function NavGroupAccordion({ group }: { group: NavGroup }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(
    group.defaultOpen || group.items.some(item => 
      location.pathname === item.href || 
      (item.href !== '/' && location.pathname.startsWith(item.href))
    )
  );

  const hasActiveItem = group.items.some(item => 
    location.pathname === item.href || 
    (item.href !== '/' && location.pathname.startsWith(item.href))
  );

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent',
          hasActiveItem ? 'text-primary' : 'text-sidebar-foreground',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-label={`${group.title} menu`}
      >
        <div className="flex items-center gap-3">
          <group.icon className="w-4 h-4" aria-hidden="true" />
          <span>{group.title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="motion-reduce:transition-none"
        >
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden motion-reduce:transition-none"
          >
            <div className="pl-4 space-y-1 pt-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive 
                        ? 'bg-primary text-primary-foreground font-medium shadow-glow-primary' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside 
      className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Pular para conteúdo principal
      </a>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary" aria-hidden="true">
          <CircleDot className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">TireWatch</h1>
          <p className="text-xs text-muted-foreground">Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {navGroups.map((group) => (
          <NavGroupAccordion key={group.title} group={group} />
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground transition-colors',
            'hover:bg-sidebar-accent',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Configurações"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span>Configurações</span>
        </Link>
      </div>

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
          <button 
            className="p-2 rounded-lg hover:bg-background/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
