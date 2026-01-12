import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  Home,
  AlertTriangle,
  FileText,
  Settings,
  Truck,
  Target,
  Gauge,
  TrendingUp,
  CircleDollarSign,
  Map,
  Wrench,
  BarChart3,
  Activity,
  Users,
  Bell,
  LogOut,
  Plus,
  Command as CommandIcon,
  Loader2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: 'machine' | 'alert' | 'occurrence' | 'tire';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  severity?: string;
}

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home, shortcut: 'D' },
  { name: 'Centro de Operações', href: '/command-center', icon: Target, shortcut: 'C' },
  { name: 'Máquinas', href: '/machines', icon: Truck, shortcut: 'M' },
  { name: 'Alertas', href: '/alerts', icon: AlertTriangle, shortcut: 'A' },
  { name: 'Ocorrências', href: '/occurrences', icon: FileText, shortcut: 'O' },
  { name: 'Pneus', href: '/tires', icon: Gauge, shortcut: 'P' },
  { name: 'Telemetria', href: '/telemetry', icon: Activity },
  { name: 'Desgaste', href: '/wear', icon: TrendingUp },
  { name: 'Geolocalização', href: '/geolocation', icon: Map },
  { name: 'Custos', href: '/costs', icon: CircleDollarSign },
  { name: 'Frota', href: '/fleet', icon: Truck },
  { name: 'Calibração', href: '/calibration', icon: Wrench },
  { name: 'Business Intelligence', href: '/bi', icon: BarChart3 },
];

const quickActions = [
  { name: 'Nova Ocorrência', href: '/occurrences/new', icon: Plus, variant: 'primary' as const },
  { name: 'Ver Alertas Críticos', href: '/command-center?severity=critical', icon: AlertTriangle, variant: 'destructive' as const },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [query, setQuery] = useState('');

  // Busca global - machines, alerts, occurrences
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['command-palette-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return { machines: [], alerts: [], occurrences: [] };

      const searchTerm = `%${query}%`;

      const [machinesResult, alertsResult, occurrencesResult] = await Promise.all([
        supabase
          .from('machines')
          .select('id, name, model, status')
          .or(`name.ilike.${searchTerm},model.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from('alerts')
          .select('id, message, severity, status, machines(name)')
          .ilike('message', searchTerm)
          .limit(5),
        supabase
          .from('occurrences')
          .select('id, description, status, machines(name)')
          .ilike('description', searchTerm)
          .limit(5),
      ]);

      return {
        machines: machinesResult.data || [],
        alerts: alertsResult.data || [],
        occurrences: occurrencesResult.data || [],
      };
    },
    enabled: query.length >= 2,
    staleTime: 10000,
  });

  // Alertas críticos recentes
  const { data: criticalAlerts } = useQuery({
    queryKey: ['command-palette-critical-alerts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('alerts')
        .select('id, message, severity, machines(name)')
        .eq('severity', 'critical')
        .neq('status', 'resolved')
        .order('opened_at', { ascending: false })
        .limit(3);
      return data || [];
    },
    staleTime: 30000,
  });

  // Processar resultados da busca
  const processedResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];

    if (searchResults?.machines) {
      searchResults.machines.forEach((machine: any) => {
        results.push({
          id: machine.id,
          type: 'machine',
          title: machine.name,
          subtitle: machine.model,
          icon: <Truck className="w-4 h-4" />,
          href: `/machines/${machine.id}`,
        });
      });
    }

    if (searchResults?.alerts) {
      searchResults.alerts.forEach((alert: any) => {
        results.push({
          id: alert.id,
          type: 'alert',
          title: alert.message.substring(0, 50),
          subtitle: (alert.machines as any)?.name,
          icon: <AlertTriangle className="w-4 h-4" />,
          href: `/command-center?alertId=${alert.id}`,
          severity: alert.severity,
        });
      });
    }

    if (searchResults?.occurrences) {
      searchResults.occurrences.forEach((occ: any) => {
        results.push({
          id: occ.id,
          type: 'occurrence',
          title: occ.description.substring(0, 50),
          subtitle: (occ.machines as any)?.name,
          icon: <FileText className="w-4 h-4" />,
          href: `/occurrences/${occ.id}`,
        });
      });
    }

    return results;
  }, [searchResults]);

  // Navegação com teclado
  const handleSelect = useCallback(
    (href?: string, action?: () => void) => {
      if (action) {
        action();
      } else if (href) {
        navigate(href);
      }
      onOpenChange(false);
      setQuery('');
    },
    [navigate, onOpenChange]
  );

  // Atalhos de teclado
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘K ou Ctrl+K para abrir
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }

      // Atalhos de navegação quando o palette está aberto
      if (open && (e.metaKey || e.ctrlKey)) {
        const item = navigationItems.find(
          (nav) => nav.shortcut?.toLowerCase() === e.key.toLowerCase()
        );
        if (item) {
          e.preventDefault();
          handleSelect(item.href);
        }
      }

      // ESC para fechar
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange, handleSelect]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-status-critical text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-status-warning text-black';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-2xl">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <CommandInput
            placeholder="Buscar máquinas, alertas, ocorrências ou navegar..."
            value={query}
            onValueChange={setQuery}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <CommandList className="max-h-[400px]">
          <CommandEmpty className="py-6 text-center text-sm">
            {query.length >= 2
              ? 'Nenhum resultado encontrado.'
              : 'Digite pelo menos 2 caracteres para buscar...'}
          </CommandEmpty>

          {/* Resultados da busca */}
          {processedResults.length > 0 && (
            <CommandGroup heading="Resultados da Busca">
              {processedResults.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`${result.type} ${result.title} ${result.subtitle || ''}`}
                  onSelect={() => handleSelect(result.href, result.action)}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  {result.severity && (
                    <Badge className={getSeverityColor(result.severity)} variant="secondary">
                      {result.severity}
                    </Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Alertas críticos (quando não há busca) */}
          {!query && criticalAlerts && criticalAlerts.length > 0 && (
            <>
              <CommandGroup heading="⚠️ Atenção Imediata">
                {criticalAlerts.map((alert: any) => (
                  <CommandItem
                    key={alert.id}
                    value={`alert critical ${alert.message}`}
                    onSelect={() => handleSelect(`/command-center?alertId=${alert.id}`)}
                    className="flex items-center gap-3 py-2 text-destructive"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="flex-1 truncate text-sm">{alert.message.substring(0, 40)}</span>
                    <Badge className="bg-status-critical text-white">crítico</Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Ações rápidas */}
          {!query && (
            <CommandGroup heading="Ações Rápidas">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.name}
                  value={action.name}
                  onSelect={() => handleSelect(action.href)}
                  className="flex items-center gap-3 py-2"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      action.variant === 'destructive'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-sm">{action.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Navegação */}
          {(!query || processedResults.length === 0) && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Navegação">
                {navigationItems.slice(0, query ? navigationItems.length : 6).map((item) => (
                  <CommandItem
                    key={item.name}
                    value={item.name}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-3 py-2"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{item.name}</span>
                    {item.shortcut && (
                      <CommandShortcut className="text-xs">
                        ⌘{item.shortcut}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Ações do sistema */}
          {!query && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Sistema">
                <CommandItem
                  value="settings"
                  onSelect={() => handleSelect('/settings')}
                  className="flex items-center gap-3 py-2"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">Configurações</span>
                </CommandItem>
                <CommandItem
                  value="logout"
                  onSelect={() => handleSelect(undefined, signOut)}
                  className="flex items-center gap-3 py-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="flex-1 text-sm">Sair</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer com atalhos */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
              selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">esc</kbd>
              fechar
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CommandIcon className="h-3 w-3" />
            <span>K para abrir</span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}
