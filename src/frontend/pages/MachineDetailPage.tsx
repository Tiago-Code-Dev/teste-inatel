import { MainLayout } from '@/components/layout/MainLayout';
import { TireTimeline } from '@/components/shared/TireTimeline';
import { TelemetryChart } from '@/components/shared/TelemetryChart';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DetailPageSkeleton } from '@/components/shared/PageSkeletons';
import { machines, tires, generateTelemetryHistory, tireTimeline } from '@/data/mockData';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Gauge, 
  Activity, 
  Clock, 
  CircleDot,
  AlertTriangle,
  Truck,
  Calendar
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MachineDetailPage = () => {
  const { id } = useParams();
  
  // Find machine
  const machine = machines.find(m => m.id === id) || machines[0];
  const machineTires = tires.filter(t => t.machineId === machine.id);
  const telemetryData = generateTelemetryHistory(machine.id, 1);
  
  const lastReading = telemetryData[telemetryData.length - 1];
  const timeAgo = formatDistanceToNow(machine.lastTelemetryAt, {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <MainLayout 
      title={machine.name} 
      subtitle={machine.model}
    >
      {/* Back Link */}
      <Link 
        to="/machines" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para máquinas
      </Link>

      {/* Header Card */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{machine.name}</h1>
              <p className="text-muted-foreground">{machine.model}</p>
            </div>
          </div>
          <StatusBadge status={machine.status} size="lg" pulse={machine.status === 'critical'} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Gauge className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Pressão Atual</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {lastReading ? `${lastReading.pressure.toFixed(1)} PSI` : '--'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Velocidade</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {lastReading ? `${lastReading.speed.toFixed(0)} km/h` : '--'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CircleDot className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Pneus</span>
            </div>
            <p className="text-2xl font-bold">{machineTires.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Última Leitura</span>
            </div>
            <p className="text-sm font-medium">{timeAgo}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="telemetry" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="telemetry">Telemetria</TabsTrigger>
          <TabsTrigger value="tires">Pneus</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="telemetry" className="space-y-6">
          {/* Pressure Chart */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Pressão</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">15min</Button>
                <Button variant="default" size="sm">1h</Button>
                <Button variant="outline" size="sm">24h</Button>
              </div>
            </div>
            <TelemetryChart 
              data={telemetryData} 
              type="pressure"
              thresholds={{ target: 28, min: 22, max: 35 }}
            />
          </div>

          {/* Speed Chart */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Velocidade</h3>
            </div>
            <TelemetryChart 
              data={telemetryData} 
              type="speed"
              thresholds={{ max: 40 }}
            />
          </div>
        </TabsContent>

        <TabsContent value="tires" className="space-y-4">
          {machineTires.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {machineTires.map((tire) => {
                const pressurePercent = tire.currentPressure 
                  ? ((tire.currentPressure / tire.recommendedPressure) * 100).toFixed(0)
                  : null;
                const isLow = tire.currentPressure && tire.currentPressure < tire.recommendedPressure * 0.85;
                
                return (
                  <Link 
                    key={tire.id}
                    to={`/tires/${tire.id}`}
                    className="card-interactive p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${isLow ? 'bg-status-critical/10' : 'bg-primary/10'}`}>
                          <CircleDot className={`w-6 h-6 ${isLow ? 'text-status-critical' : 'text-primary'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{tire.position}</h4>
                          <p className="text-sm text-muted-foreground">{tire.serial}</p>
                        </div>
                      </div>
                      {isLow && (
                        <AlertTriangle className="w-5 h-5 text-status-critical" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Pressão</p>
                        <p className={`text-lg font-bold ${isLow ? 'text-status-critical' : ''}`}>
                          {tire.currentPressure?.toFixed(1) || '--'} PSI
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Recomendado</p>
                        <p className="text-lg font-bold">{tire.recommendedPressure} PSI</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Instalado em {format(tire.installedAt, 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card-elevated p-8 text-center">
              <CircleDot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground mb-1">Nenhum pneu cadastrado</h3>
              <p className="text-sm text-muted-foreground">
                Esta máquina não possui pneus vinculados
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts">
          <div className="card-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4">Histórico de Eventos</h3>
            <TireTimeline events={tireTimeline} />
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default MachineDetailPage;
