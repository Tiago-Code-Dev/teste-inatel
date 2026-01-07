import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CircleDot, Gauge, Thermometer, AlertTriangle, Wrench, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TireDeformationData, DeformationThresholds } from '@/hooks/useTireDeformation';
import { DeformationChart } from './DeformationChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TireDeformationDetailSheetProps {
  tire: TireDeformationData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thresholds: DeformationThresholds;
  onAdjustPressure?: (tireId: string) => void;
  onRequestReplacement?: (tireId: string) => void;
}

export function TireDeformationDetailSheet({
  tire,
  open,
  onOpenChange,
  thresholds,
  onAdjustPressure,
  onRequestReplacement,
}: TireDeformationDetailSheetProps) {
  if (!tire) return null;

  const statusConfig = {
    optimal: {
      label: 'Normal',
      color: 'bg-status-normal text-white',
      description: 'Pneu em condições ideais',
    },
    warning: {
      label: 'Atenção',
      color: 'bg-status-warning text-black',
      description: 'Deformação acima do ideal',
    },
    critical: {
      label: 'Crítico',
      color: 'bg-status-critical text-white',
      description: 'Deformação crítica detectada',
    },
  };

  const config = statusConfig[tire.status];

  // Calculate trend
  const recentHistory = tire.history.slice(-5);
  const firstValue = recentHistory[0]?.deformation || 0;
  const lastValue = recentHistory[recentHistory.length - 1]?.deformation || 0;
  const trend = lastValue - firstValue;
  const TrendIcon = trend > 0.5 ? TrendingUp : trend < -0.5 ? TrendingDown : Minus;
  const trendLabel = trend > 0.5 ? 'Aumentando' : trend < -0.5 ? 'Diminuindo' : 'Estável';
  const trendColor = trend > 0.5 ? 'text-status-critical' : trend < -0.5 ? 'text-status-normal' : 'text-muted-foreground';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <CircleDot className="w-5 h-5" />
              {tire.tireSerial}
            </SheetTitle>
            <Badge className={config.color}>{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </SheetHeader>

        <div className="space-y-4">
          {/* Current Status Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Status Atual</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Deformação Atual</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    tire.status === 'optimal' && 'text-status-normal',
                    tire.status === 'warning' && 'text-status-warning',
                    tire.status === 'critical' && 'text-status-critical'
                  )}>
                    {tire.currentDeformation.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tendência</p>
                  <div className={cn('flex items-center gap-1 text-lg font-semibold', trendColor)}>
                    <TrendIcon className="w-5 h-5" />
                    {trendLabel}
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Máxima</p>
                  <p className="font-semibold">{tire.maxDeformation.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Média</p>
                  <p className="font-semibold">{tire.avgDeformation.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Limite</p>
                  <p className="font-semibold">{thresholds.criticalLevel}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Telemetry Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Telemetria</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Pressão</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{tire.pressure.toFixed(0)} psi</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      (Ideal: {tire.recommendedPressure} psi)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Temperatura</span>
                  </div>
                  <span className={cn(
                    'font-semibold',
                    tire.temperature > 40 && 'text-status-warning',
                    tire.temperature > 50 && 'text-status-critical'
                  )}>
                    {tire.temperature.toFixed(0)}°C
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Máquina</span>
                  <span className="font-medium">{tire.machineName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Posição</span>
                  <span className="font-medium">{tire.position}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Última Atualização</span>
                  <span className="font-medium">
                    {format(tire.lastUpdated, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deformation Chart */}
          <DeformationChart 
            data={tire.history} 
            thresholds={thresholds}
            title="Histórico de Deformação"
          />

          {/* Actions */}
          <div className="space-y-2 pb-4">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onAdjustPressure?.(tire.tireId)}
            >
              <Gauge className="w-4 h-4 mr-2" />
              Ajustar Pressão
            </Button>
            {tire.status === 'critical' && (
              <Button 
                className="w-full" 
                variant="destructive"
                onClick={() => onRequestReplacement?.(tire.tireId)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Solicitar Substituição
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
