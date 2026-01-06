import { MainLayout } from '@/components/layout/MainLayout';
import { TireTimeline } from '@/components/shared/TireTimeline';
import { tires, tireTimeline, machines } from '@/data/mockData';
import { CircleDot, Truck, Calendar, Gauge, AlertTriangle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const lifecycleLabels: Record<string, { label: string; className: string }> = {
  new: { label: 'Novo', className: 'bg-status-ok/15 text-status-ok' },
  in_use: { label: 'Em uso', className: 'bg-primary/15 text-primary' },
  maintenance: { label: 'Manutenção', className: 'bg-status-warning/15 text-status-warning' },
  retired: { label: 'Descartado', className: 'bg-muted text-muted-foreground' },
};

const TiresPage = () => {
  const tiresWithMachines = tires.map(tire => {
    const machine = machines.find(m => m.id === tire.machineId);
    return { ...tire, machine };
  });

  return (
    <MainLayout 
      title="Pneus" 
      subtitle={`${tires.length} pneus cadastrados`}
    >
      {/* Tires Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tiresWithMachines.map((tire) => {
          const isLow = tire.currentPressure && tire.currentPressure < tire.recommendedPressure * 0.85;
          const lifecycle = lifecycleLabels[tire.lifecycleStatus];

          return (
            <div 
              key={tire.id}
              className={cn(
                'card-elevated p-5',
                isLow && 'border-status-critical/50'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl',
                    isLow ? 'bg-status-critical/10' : 'bg-primary/10'
                  )}>
                    <CircleDot className={cn(
                      'w-6 h-6',
                      isLow ? 'text-status-critical' : 'text-primary'
                    )} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{tire.serial}</h4>
                    <p className="text-sm text-muted-foreground">{tire.position}</p>
                  </div>
                </div>
                <Badge className={cn('font-medium', lifecycle.className)}>
                  {lifecycle.label}
                </Badge>
              </div>

              {/* Pressure Info */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 mb-4">
                <Gauge className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Pressão atual</span>
                    {isLow && <AlertTriangle className="w-4 h-4 text-status-critical" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      'text-xl font-bold',
                      isLow ? 'text-status-critical' : 'text-foreground'
                    )}>
                      {tire.currentPressure?.toFixed(1) || '--'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {tire.recommendedPressure} PSI
                    </span>
                  </div>
                </div>
              </div>

              {/* Machine Link */}
              {tire.machine && (
                <Link 
                  to={`/machines/${tire.machine.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  {tire.machine.name}
                </Link>
              )}

              {/* Install Date */}
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Instalado em {format(tire.installedAt, 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Section */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Histórico do Pneu</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
        <TireTimeline events={tireTimeline} />
      </div>
    </MainLayout>
  );
};

export default TiresPage;
