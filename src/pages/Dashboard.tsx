import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { MachineCard } from '@/components/shared/MachineCard';
import { AlertCard } from '@/components/shared/AlertCard';
import { dashboardStats, machines, alerts } from '@/data/mockData';
import { 
  Truck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2,
  XCircle,
  WifiOff,
  ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Sort machines by criticality
  const sortedMachines = [...machines].sort((a, b) => {
    const priority = { critical: 0, warning: 1, operational: 2, offline: 3 };
    return priority[a.status] - priority[b.status];
  });

  // Recent alerts (top 5)
  const recentAlerts = [...alerts]
    .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())
    .slice(0, 5);

  // Mock telemetry for each machine
  const getMockTelemetry = (machineId: string) => {
    const base = { pressure: 28, speed: 15 };
    if (machineId === 'machine-1') return { pressure: 18.5, speed: 52 };
    if (machineId === 'machine-2') return { pressure: 32, speed: 12 };
    return { pressure: base.pressure + Math.random() * 3, speed: base.speed + Math.random() * 8 };
  };

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle="Visão geral do monitoramento de frota"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Máquinas"
          value={dashboardStats.totalMachines}
          subtitle={`${dashboardStats.machinesOperational} operacionais`}
          icon={Truck}
        />
        <MetricCard
          title="Alertas Ativos"
          value={dashboardStats.activeAlerts}
          subtitle="Requer atenção"
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Críticos"
          value={dashboardStats.machinesCritical}
          subtitle="Ação imediata"
          icon={XCircle}
          variant="danger"
        />
        <MetricCard
          title="Ocorrências"
          value={dashboardStats.openOccurrences}
          subtitle="Em aberto"
          icon={FileText}
        />
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-status-ok/10 border border-status-ok/20">
          <CheckCircle2 className="w-5 h-5 text-status-ok" />
          <div>
            <p className="text-2xl font-bold text-status-ok">{dashboardStats.machinesOperational}</p>
            <p className="text-xs text-muted-foreground">Operacionais</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-status-warning/10 border border-status-warning/20">
          <AlertTriangle className="w-5 h-5 text-status-warning" />
          <div>
            <p className="text-2xl font-bold text-status-warning">{dashboardStats.machinesWarning}</p>
            <p className="text-xs text-muted-foreground">Atenção</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-status-critical/10 border border-status-critical/20">
          <XCircle className="w-5 h-5 text-status-critical" />
          <div>
            <p className="text-2xl font-bold text-status-critical">{dashboardStats.machinesCritical}</p>
            <p className="text-xs text-muted-foreground">Críticos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
          <WifiOff className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{dashboardStats.machinesOffline}</p>
            <p className="text-xs text-muted-foreground">Sem sinal</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Machines List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Máquinas em Operação</h2>
            <Link 
              to="/machines" 
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {sortedMachines.slice(0, 6).map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                telemetry={machine.status !== 'offline' ? getMockTelemetry(machine.id) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Alertas Recentes</h2>
            <Link 
              to="/alerts" 
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card-elevated divide-y divide-border">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} compact />
              ))
            ) : (
              <div className="p-6 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-status-ok" />
                <p className="text-sm text-muted-foreground">
                  Nenhum alerta ativo no momento
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
