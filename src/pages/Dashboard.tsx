import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { DashboardErrorBoundary, DashboardError, DashboardEmptyState } from '@/components/dashboard/DashboardErrorBoundary';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { StatusSummaryGrid } from '@/components/dashboard/StatusSummaryCard';
import { MachineCard } from '@/components/dashboard/MachineCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  AlertTriangle, 
  FileText, 
  XCircle,
  CheckCircle2,
  ChevronRight,
  Heart,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
  const sortedMachines = [...machines].sort((a, b) => {
    const priority: Record<string, number> = { critical: 0, warning: 1, operational: 2, offline: 3 };
    return (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
  });

  // Recent alerts (top 5)
  const recentAlerts = alerts.slice(0, 5);

  // Mock telemetry for demonstration (will be replaced with real data in Phase 2)
  const getMockTelemetry = (machineId: string) => {
    const base = { pressure: 28, speed: 15 };
    // Simulate variation based on machine id hash
    const hash = machineId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return { 
      pressure: base.pressure + (hash % 5) - 2 + Math.random() * 2, 
      speed: base.speed + (hash % 10) + Math.random() * 5 
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
      {/* Hero Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Saúde da Frota"
          value={`${stats.fleetHealthScore}%`}
          subtitle={stats.fleetHealthScore >= 80 ? 'Excelente' : stats.fleetHealthScore >= 60 ? 'Atenção' : 'Crítico'}
          icon={Heart}
          variant={stats.fleetHealthScore >= 80 ? 'success' : stats.fleetHealthScore >= 60 ? 'warning' : 'danger'}
          delay={0}
        />
        <MetricCard
          title="Máquinas"
          value={stats.totalMachines}
          subtitle={`${stats.machinesOperational} operacionais`}
          icon={Truck}
          delay={0.05}
        />
        <MetricCard
          title="Alertas Ativos"
          value={stats.activeAlerts}
          subtitle={stats.criticalAlerts > 0 ? `${stats.criticalAlerts} críticos` : 'Nenhum crítico'}
          icon={AlertTriangle}
          variant={stats.criticalAlerts > 0 ? 'danger' : stats.activeAlerts > 0 ? 'warning' : 'success'}
          delay={0.1}
        />
        <MetricCard
          title="Ocorrências"
          value={stats.openOccurrences}
          subtitle="Em aberto"
          icon={FileText}
          delay={0.15}
        />
      </div>

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
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  telemetry={machine.status !== 'offline' ? getMockTelemetry(machine.id) : undefined}
                  delay={0.2 + index * 0.05}
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
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card-elevated divide-y divide-border overflow-hidden"
          >
            <AnimatePresence mode="popLayout">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert, index) => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    compact 
                    delay={0.3 + index * 0.05}
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
          </motion.div>

          {/* Refresh Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
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
