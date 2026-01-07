import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { DashboardErrorBoundary, DashboardError, DashboardEmptyState } from '@/components/dashboard/DashboardErrorBoundary';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FleetHealthGauge } from '@/components/dashboard/FleetHealthGauge';
import { AlertTicker } from '@/components/dashboard/AlertTicker';
import { HeroSection, GlassPanel } from '@/components/dashboard/GlassComponents';
import { StatusSummaryGrid } from '@/components/dashboard/StatusSummaryCard';
import { GlassMachineCard } from '@/components/dashboard/GlassMachineCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
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
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

function DashboardContent() {
  const { 
    machines, 
    alerts, 
    stats, 
    isLoading, 
    machinesError, 
    alertsError,
    refetch 
  } = useDashboard();
  const navigate = useNavigate();

  // Sort machines by criticality
  const sortedMachines = useMemo(() => [...machines].sort((a, b) => {
    const priority: Record<string, number> = { critical: 0, warning: 1, operational: 2, offline: 3 };
    return (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
  }), [machines]);

  // Recent alerts (top 5)
  const recentAlerts = useMemo(() => alerts.slice(0, 5), [alerts]);

  // Mock telemetry for demonstration
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

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
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
          <Button onClick={() => navigate('/machines')}>
            Gerenciar Frota
          </Button>
        }
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Alert Ticker */}
      <AlertTicker alerts={alerts} speed={5000} />

      {/* Hero Section with Gauge */}
      <HeroSection>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Fleet Health Gauge */}
          <div className="shrink-0">
            <FleetHealthGauge 
              score={stats.fleetHealthScore} 
              previousScore={stats.fleetHealthScore + (Math.random() > 0.5 ? -5 : 3)}
              size="lg"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMachines}</p>
                <p className="text-xs text-muted-foreground">Máquinas</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-ok/20">
                <Activity className="w-5 h-5 text-status-ok" />
              </div>
              <div>
                <p className="text-2xl font-bold text-status-ok">{stats.machinesOperational}</p>
                <p className="text-xs text-muted-foreground">Operacionais</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                stats.criticalAlerts > 0 ? 'bg-status-critical/20' : 'bg-status-warning/20'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  stats.criticalAlerts > 0 ? 'text-status-critical' : 'text-status-warning'
                }`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${
                  stats.criticalAlerts > 0 ? 'text-status-critical' : 'text-foreground'
                }`}>
                  {stats.activeAlerts}
                </p>
                <p className="text-xs text-muted-foreground">Alertas Ativos</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.openOccurrences}</p>
                <p className="text-xs text-muted-foreground">Ocorrências</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.fleetHealthScore * 0.95)}%</p>
                <p className="text-xs text-muted-foreground">Eficiência</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.machinesCritical === 0 ? '100%' : `${Math.round((1 - stats.machinesCritical / stats.totalMachines) * 100)}%`}
                </p>
                <p className="text-xs text-muted-foreground">Disponibilidade</p>
              </div>
            </motion.div>
          </div>
        </div>
      </HeroSection>

      {/* Status Summary */}
      <StatusSummaryGrid 
        operational={stats.machinesOperational}
        warning={stats.machinesWarning}
        critical={stats.machinesCritical}
        offline={stats.machinesOffline}
        onStatusClick={handleStatusClick}
      />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Machines List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-semibold text-foreground"
            >
              Máquinas em Operação
            </motion.h2>
            <Link 
              to="/machines" 
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 gap-4">
              {sortedMachines.slice(0, 6).map((machine, index) => (
                <GlassMachineCard
                  key={machine.id}
                  machine={machine}
                  telemetry={machine.status !== 'offline' ? getMockTelemetry(machine.id) : undefined}
                  delay={0.4 + index * 0.08}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>

        {/* Alerts Sidebar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-semibold text-foreground"
            >
              Alertas Recentes
            </motion.h2>
            <Link 
              to="/alerts" 
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <GlassPanel className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert, index) => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    compact 
                    delay={0.5 + index * 0.05}
                  />
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

          {/* Refresh Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4"
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2 bg-white/5 border-white/10 hover:bg-white/10"
              onClick={refetch}
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar dados
            </Button>
          </motion.div>
        </div>
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
