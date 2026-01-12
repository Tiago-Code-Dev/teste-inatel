import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Weight, Gauge, TrendingDown, AlertTriangle, Wrench, RefreshCw, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TireLoadData, MachineLoadData, LoadThresholds } from '@/hooks/useLoadAnalysis';
import { LoadImpactChart } from './LoadImpactChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LoadDetailSheetProps {
  tire?: TireLoadData | null;
  machine?: MachineLoadData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thresholds: LoadThresholds;
  onAdjustLoad?: (id: string) => void;
  onRequestMaintenance?: (id: string) => void;
}

export function LoadDetailSheet({
  tire,
  machine,
  open,
  onOpenChange,
  thresholds,
  onAdjustLoad,
  onRequestMaintenance,
}: LoadDetailSheetProps) {
  if (!tire && !machine) return null;

  const isTire = !!tire;
  const data = tire || machine!;
  const status = isTire ? tire!.status : machine!.status;

  const statusConfig = {
    normal: {
      label: 'Normal',
      color: 'bg-status-normal text-white',
      description: 'Carga dentro dos limites ideais',
    },
    warning: {
      label: 'Atenção',
      color: 'bg-status-warning text-black',
      description: 'Carga elevada, monitorar',
    },
    overload: {
      label: 'Sobrecarga',
      color: 'bg-status-critical text-white',
      description: 'Carga excede limites seguros',
    },
  };

  const config = statusConfig[status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Weight className="w-5 h-5" />
              {isTire ? tire!.tireSerial : machine!.name}
            </SheetTitle>
            <Badge className={config.color}>{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </SheetHeader>

        <div className="space-y-4">
          {/* Current Status Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Status da Carga</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Carga Atual</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    status === 'normal' && 'text-status-normal',
                    status === 'warning' && 'text-status-warning',
                    status === 'overload' && 'text-status-critical'
                  )}>
                    {isTire ? `${tire!.loadPercent.toFixed(0)}%` : `${machine!.loadPercent.toFixed(0)}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isTire ? `${tire!.currentLoadKg.toFixed(0)}kg` : `${machine!.totalLoadKg.toFixed(0)}kg`}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Capacidade Máx.</p>
                  <p className="text-xl font-semibold text-foreground">
                    {isTire ? `${tire!.maxLoadKg.toFixed(0)}kg` : `${machine!.maxLoadKg.toFixed(0)}kg`}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Eficiência</p>
                  <p className={cn(
                    'font-semibold',
                    (isTire ? tire!.efficiency : machine!.efficiency) >= 80 ? 'text-status-normal' : 'text-status-warning'
                  )}>
                    {(isTire ? tire!.efficiency : machine!.efficiency).toFixed(0)}%
                  </p>
                </div>
                {isTire && (
                  <div>
                    <p className="text-xs text-muted-foreground">Impacto Desg.</p>
                    <p className="font-semibold text-status-warning">+{tire!.wearImpact.toFixed(1)}%</p>
                  </div>
                )}
                {!isTire && (
                  <div>
                    <p className="text-xs text-muted-foreground">Pneus Afetados</p>
                    <p className="font-semibold">{machine!.tiresAffected}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Limite Alerta</p>
                  <p className="font-semibold">{thresholds.warningPercent}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Detalhes</h3>
              <div className="space-y-3">
                {isTire && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Máquina</span>
                      <span className="font-medium">{tire!.machineName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Posição</span>
                      <span className="font-medium">{tire!.position}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nível de Desgaste</span>
                      <span className="font-medium">{tire!.wearLevel.toFixed(0)}%</span>
                    </div>
                  </>
                )}
                {!isTire && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Modelo</span>
                      <span className="font-medium">{machine!.model}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Carga Total</span>
                      <span className="font-medium">{machine!.totalLoadKg.toFixed(0)}kg</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chart (only for tire) */}
          {isTire && (
            <LoadImpactChart 
              data={tire!.history} 
              thresholds={thresholds}
              title="Histórico de Carga"
            />
          )}

          {/* Recommendation Card */}
          {(status !== 'normal' || (machine && machine.recommendation)) && (
            <Card className="bg-status-warning/10 border-status-warning/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-status-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Recomendação</h4>
                    <p className="text-sm text-muted-foreground">
                      {machine?.recommendation || (status === 'overload' 
                        ? 'Redistribuir carga imediatamente para evitar danos ao pneu'
                        : 'Monitorar carga e considerar ajustes preventivos')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-2 pb-4">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onAdjustLoad?.(isTire ? tire!.machineId : machine!.id)}
            >
              <Weight className="w-4 h-4 mr-2" />
              Ajustar Distribuição
            </Button>
            {status !== 'normal' && (
              <Button 
                className="w-full"
                onClick={() => onRequestMaintenance?.(isTire ? tire!.tireId : machine!.id)}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Solicitar Manutenção
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
