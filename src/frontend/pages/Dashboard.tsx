import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { DashboardErrorBoundary, DashboardError, DashboardEmptyState } from '@/components/dashboard/DashboardErrorBoundary';
import { DashboardShimmer } from '@/components/dashboard/ShimmerSkeleton';
import { FleetHealthGauge } from '@/components/dashboard/FleetHealthGauge';
import { AlertTicker } from '@/components/dashboard/AlertTicker';
import { HeroSection, GlassPanel } from '@/components/dashboard/GlassComponents';
import { StatusSummaryGrid } from '@/components/dashboard/StatusSummaryCard';
import { GlassMachineCard } from '@/components/dashboard/GlassMachineCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { PullToRefreshIndicator } from '@/components/dashboard/PullToRefreshIndicator';
import { StaggeredList, StaggeredItem } from '@/components/dashboard/StaggeredList';
import { HapticButton } from '@/components/dashboard/HapticButton';
import { IntelligenceLayer } from '@/components/dashboard/IntelligenceLayer';
import { ConnectionIndicator } from '@/components/dashboard/TelemetrySparkline';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

function DashboardContent() {
  const { 
    machines, 
    alerts, 
    stats, 
    telemetryByMachine,
    isTelemetryConnected,
    isLoading, 
    machinesError, 
    alertsError,
    refetch 
  } = useDashboard();
  const navigate = useNavigate();

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const { 
    progress, 
    isRefreshing, 
    springY, 
    handlers: pullHandlers 
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  // Sort machines by criticality
  const sortedMachines = useMemo(() => [...machines].sort((a, b) => {
    const priority: Record<string, number> = { critical: 0, warning: 1, operational: 2, offline: 3 };
    return (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
  }), [machines]);

  // Recent alerts (top 5)
  const recentAlerts = useMemo(() => alerts.slice(0, 5), [alerts]);

  // Mock telemetry for demonstration (fallback when no real data)
  const getMockTelemetry = (machineId: string) => {
    const hash = machineId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return { 
      pressure: 26 + (hash % 6) + Math.random() * 2, 
      speed: 12 + (hash % 12) + Math.random() * 5 
    };
  };

  const handleStatusClick = (status: string) => {
    navigate(`/machines?status=${status}`);
  };

  // Loading state with shimmer
  if (isLoading) {
    return <DashboardShimmer />;
  }

  // Error state
  if (machinesError || alertsError) {
    return (
      <DashboardError 
        error={machinesError || alertsError}
        onRetry={refetch}
      />
    );
  }

  // Empty state
  if (machines.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Truck className="w-16 h-16 text-muted-foreground/50" />}
        title="Nenhuma máquina encontrada"
        description="Adicione máquinas à sua frota para começar a monitorar."
        action={
          <HapticButton onClick={() => navigate('/machines')}>
            Gerenciar Frota
          </HapticButton>
        }
      />
    );
  }

  return (
    <motion.div
      {...pullHandlers}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative space-y-6 touch-pan-y"
    >
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator 
        progress={progress} 
        isRefreshing={isRefreshing} 
        springY={springY}
      />

      {/* Alert Ticker */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="flex-1">
          <AlertTicker alerts={alerts} speed={5000} />
        </div>
        <ConnectionIndicator isConnected={isTelemetryConnected} />
      </motion.div>

      {/* Hero Section with Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <HeroSection>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Fleet Health Gauge */}
            <motion.div 
              className="shrink-0"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <FleetHealthGauge 
                score={stats.fleetHealthScore} 
                previousScore={stats.fleetHealthScore + (Math.random() > 0.5 ? -5 : 3)}
                size="lg"
              />
            </motion.div>

            {/* Quick Stats with staggered animation */}
            <StaggeredList 
              className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 w-full"
              staggerDelay={0.06}
              baseDelay={0.4}
              direction="up"
            >
              <QuickStatItem
                icon={<Truck className="w-5 h-5 text-primary" />}
                iconBg="bg-primary/20"
                value={stats.totalMachines}
                label="Máquinas"
              />
              <QuickStatItem
                icon={<Activity className="w-5 h-5 text-status-ok" />}
                iconBg="bg-status-ok/20"
                value={stats.machinesOperational}
                valueClass="text-status-ok"
                label="Operacionais"
              />
              <QuickStatItem
                icon={<AlertTriangle className={`w-5 h-5 ${stats.criticalAlerts > 0 ? 'text-status-critical' : 'text-status-warning'}`} />}
                iconBg={stats.criticalAlerts > 0 ? 'bg-status-critical/20' : 'bg-status-warning/20'}
                value={stats.activeAlerts}
                valueClass={stats.criticalAlerts > 0 ? 'text-status-critical' : undefined}
                label="Alertas Ativos"
              />
              <QuickStatItem
                icon={<FileText className="w-5 h-5 text-primary" />}
                iconBg="bg-primary/20"
                value={stats.openOccurrences}
                label="Ocorrências"
              />
              <QuickStatItem
                icon={<Zap className="w-5 h-5 text-blue-500" />}
                iconBg="bg-blue-500/20"
                value={`${Math.round(stats.fleetHealthScore * 0.95)}%`}
                label="Eficiência"
              />
              <QuickStatItem
                icon={<Shield className="w-5 h-5 text-emerald-500" />}
                iconBg="bg-emerald-500/20"
                value={stats.machinesCritical === 0 ? '100%' : `${Math.round((1 - stats.machinesCritical / stats.totalMachines) * 100)}%`}
                label="Disponibilidade"
              />
            </StaggeredList>
          </div>
        </HeroSection>
      </motion.div>

      {/* Intelligence Layer - AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <IntelligenceLayer
          stats={stats}
          machines={machines}
          telemetryByMachine={telemetryByMachine}
        />
      </motion.div>

      {/* Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <StatusSummaryGrid 
          operational={stats.machinesOperational}
          warning={stats.machinesWarning}
          critical={stats.machinesCritical}
          offline={stats.machinesOffline}
          onStatusClick={handleStatusClick}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Machines List */}
        <div className="lg:col-span-2">
          <motion.div 
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-lg font-semibold text-foreground">
              Máquinas em Operação
            </h2>
            <Link 
              to="/machines" 
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline group"
            >
              Ver todas
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
          
          <StaggeredList
            className="grid sm:grid-cols-2 gap-4"
            staggerDelay={0.08}
            baseDelay={0.65}
            direction="up"
          >
            {sortedMachines.slice(0, 6).map((machine) => (
              <GlassMachineCard
                key={machine.id}
                machine={machine}
                telemetry={machine.status !== 'offline' ? getMockTelemetry(machine.id) : undefined}
                delay={0}
              />
            ))}
          </StaggeredList>
        </div>

        {/* Alerts Sidebar */}
        <div>
          <motion.div 
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-lg font-semibold text-foreground">
              Alertas Recentes
            </h2>
            <Link 
              to="/alerts" 
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline group"
            >
              Ver todos
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <GlassPanel className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alert, index) => (
                    <StaggeredItem 
                      key={alert.id}
                      index={index}
                      baseDelay={0.8}
                      staggerDelay={0.05}
                    >
                      <AlertCard 
                        alert={alert} 
                        compact 
                        delay={0}
                      />
                    </StaggeredItem>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 text-center"
                  >
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-status-ok" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum alerta ativo no momento
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>
          </motion.div>

          {/* Refresh Button with haptic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4"
          >
            <HapticButton 
              variant="ghost"
              className="w-full gap-2 bg-white/5 border border-white/10 hover:bg-white/10"
              onClick={refetch}
              hapticType="light"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar dados'}
            </HapticButton>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Quick stat item component
interface QuickStatItemProps {
  icon: React.ReactNode;
  iconBg: string;
  value: number | string;
  valueClass?: string;
  label: string;
}

function QuickStatItem({ icon, iconBg, value, valueClass, label }: QuickStatItemProps) {
  return (
    <motion.div
      className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer"
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold ${valueClass || ''}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

const Dashboard = () => {
  return (
    <DashboardProvider>
      <MainLayout 
        title="Dashboard" 
        subtitle="Visão geral do monitoramento de frota"
      >
        <DashboardErrorBoundary>
          <DashboardContent />
        </DashboardErrorBoundary>
      </MainLayout>
    </DashboardProvider>
  );
};

export default Dashboard;
