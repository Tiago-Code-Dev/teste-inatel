import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { CircleDot, Truck, Calendar, Gauge, AlertTriangle, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { TireCardSkeleton } from '@/components/shared/PageSkeletons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
const lifecycleLabels: Record<string, { label: string; className: string }> = {
  new: { label: 'Novo', className: 'bg-status-ok/15 text-status-ok' },
  in_use: { label: 'Em uso', className: 'bg-primary/15 text-primary' },
  maintenance: { label: 'Manutenção', className: 'bg-status-warning/15 text-status-warning' },
  retired: { label: 'Descartado', className: 'bg-muted text-muted-foreground' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    }
  },
};

interface TireWithMachine {
  id: string;
  serial: string;
  position: string | null;
  lifecycle_status: string;
  current_pressure: number | null;
  recommended_pressure: number;
  installed_at: string | null;
  machine_id: string | null;
  machines: { id: string; name: string; model: string } | null;
}

// TireCardSkeleton is now imported from PageSkeletons

function TireCard({ tire, index }: { tire: TireWithMachine; index: number }) {
  const isLow = tire.current_pressure && tire.current_pressure < tire.recommended_pressure * 0.85;
  const lifecycle = lifecycleLabels[tire.lifecycle_status] || lifecycleLabels.in_use;
  const pressurePercent = tire.current_pressure 
    ? Math.min(100, (tire.current_pressure / tire.recommended_pressure) * 100)
    : 0;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/tires/${tire.id}/history`}
        className={cn(
          'card-interactive p-5 block group',
          isLow && 'border-status-critical/50 ring-1 ring-status-critical/20'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl transition-colors',
                isLow ? 'bg-status-critical/10' : 'bg-primary/10'
              )}
              animate={isLow ? { 
                scale: [1, 1.05, 1],
                boxShadow: ['0 0 0 0 rgba(239,68,68,0)', '0 0 0 8px rgba(239,68,68,0.15)', '0 0 0 0 rgba(239,68,68,0)']
              } : {}}
              transition={{ repeat: isLow ? Infinity : 0, duration: 2 }}
            >
              <CircleDot className={cn(
                'w-6 h-6',
                isLow ? 'text-status-critical' : 'text-primary'
              )} />
            </motion.div>
            <div>
              <h4 className="font-semibold text-foreground">{tire.serial}</h4>
              <p className="text-sm text-muted-foreground">{tire.position || 'Posição não definida'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('font-medium', lifecycle.className)}>
              {lifecycle.label}
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Pressure Info with Visual Gauge */}
        <div className={cn(
          'p-4 rounded-xl mb-4 transition-colors',
          isLow ? 'bg-status-critical/5' : 'bg-muted/50'
        )}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Gauge className={cn(
                'w-8 h-8',
                isLow ? 'text-status-critical' : 'text-muted-foreground'
              )} />
              {isLow && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <AlertTriangle className="w-4 h-4 text-status-critical" />
                </motion.div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Pressão atual</span>
                <span className={cn(
                  'text-xs font-medium',
                  isLow ? 'text-status-critical' : 'text-muted-foreground'
                )}>
                  {pressurePercent.toFixed(0)}%
                </span>
              </div>
              {/* Pressure Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    isLow ? 'bg-status-critical' : 'bg-primary'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${pressurePercent}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={cn(
                  'text-xl font-bold tabular-nums',
                  isLow ? 'text-status-critical' : 'text-foreground'
                )}>
                  {tire.current_pressure?.toFixed(1) || '--'}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {tire.recommended_pressure} PSI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Link */}
        {tire.machines && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="w-4 h-4" />
            <span className="truncate">{tire.machines.name}</span>
          </div>
        )}

        {/* Install Date */}
        {tire.installed_at && (
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Instalado em {format(new Date(tire.installed_at), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        )}
      </Link>
    </motion.div>
  );
}

const TiresPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tires, isLoading, error, refetch } = useQuery({
    queryKey: ['tires-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tires')
        .select('*, machines(id, name, model)')
        .order('serial', { ascending: true });

      if (error) throw error;
      return data as TireWithMachine[];
    },
  });

  const filteredTires = useMemo(() => {
    if (!tires) return [];
    if (!searchQuery.trim()) return tires;
    
    const query = searchQuery.toLowerCase();
    return tires.filter(tire => 
      tire.serial.toLowerCase().includes(query) ||
      tire.position?.toLowerCase().includes(query) ||
      tire.machines?.name.toLowerCase().includes(query)
    );
  }, [tires, searchQuery]);

  const stats = useMemo(() => {
    if (!tires) return { total: 0, lowPressure: 0, inMaintenance: 0 };
    return {
      total: tires.length,
      lowPressure: tires.filter(t => t.current_pressure && t.current_pressure < t.recommended_pressure * 0.85).length,
      inMaintenance: tires.filter(t => t.lifecycle_status === 'maintenance').length,
    };
  }, [tires]);

  const content = (
    <div className={cn('space-y-6', isMobile && 'p-4 pb-24')}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pneu por serial, posição ou máquina..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Stats */}
      {!isLoading && tires && (
        <motion.div 
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary tabular-nums">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total de Pneus</p>
          </div>
          <div className={cn(
            'p-4 rounded-xl',
            stats.lowPressure > 0 
              ? 'bg-status-critical/5 border border-status-critical/10' 
              : 'bg-status-ok/5 border border-status-ok/10'
          )}>
            <p className={cn(
              'text-2xl font-bold tabular-nums',
              stats.lowPressure > 0 ? 'text-status-critical' : 'text-status-ok'
            )}>
              {stats.lowPressure}
            </p>
            <p className="text-xs text-muted-foreground">Baixa Pressão</p>
          </div>
          <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/10">
            <p className="text-2xl font-bold text-status-warning tabular-nums">{stats.inMaintenance}</p>
            <p className="text-xs text-muted-foreground">Manutenção</p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <TireCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <StateDisplay
          state="error"
          title="Erro ao carregar pneus"
          description="Não foi possível carregar a lista de pneus."
          action={{ label: 'Tentar novamente', onClick: () => refetch() }}
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTires.length === 0 && (
        <StateDisplay
          state="empty"
          title={searchQuery ? 'Nenhum pneu encontrado' : 'Nenhum pneu cadastrado'}
          description={searchQuery 
            ? 'Tente buscar por outro termo.' 
            : 'Cadastre pneus para acompanhar seu histórico de vida.'
          }
        />
      )}

      {/* Tires Grid */}
      {!isLoading && !error && filteredTires.length > 0 && (
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredTires.map((tire, index) => (
            <TireCard key={tire.id} tire={tire} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  );

  // Use MainLayout for both mobile and desktop for consistent navigation

  return (
    <MainLayout 
      title="Pneus" 
      subtitle={`${stats.total} pneus cadastrados`}
    >
      {content}
    </MainLayout>
  );
};

export default TiresPage;
