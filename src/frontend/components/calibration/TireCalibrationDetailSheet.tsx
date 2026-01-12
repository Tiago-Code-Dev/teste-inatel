import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  CircleDot, Gauge, Thermometer, Clock, Zap, 
  RefreshCw, CheckCircle, History, Target
} from 'lucide-react';
import { TireCalibrationData, CalibrationStatus } from '@/hooks/useTireCalibration';
import { CalibrationChart } from './CalibrationChart';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface TireCalibrationDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tire: TireCalibrationData | null;
  onCalibrate: (tireId: string, targetPressure?: number) => Promise<void>;
  isCalibrating: boolean;
}

const STATUS_CONFIG: Record<CalibrationStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
}> = {
  optimal: { label: 'Calibrado', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  adjusting: { label: 'Ajustando', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  warning: { label: 'Atenção', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  critical: { label: 'Crítico', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  pending: { label: 'Pendente', color: 'text-gray-500', bgColor: 'bg-gray-500/10' }
};

export const TireCalibrationDetailSheet = ({
  isOpen,
  onClose,
  tire,
  onCalibrate,
  isCalibrating
}: TireCalibrationDetailSheetProps) => {
  const [manualPressure, setManualPressure] = useState<number>(32);

  if (!tire) return null;
  
  const config = STATUS_CONFIG[tire.status];
  const pressureDeviation = tire.currentPressure - tire.recommendedPressure;

  const chartData = tire.pressureHistory.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    pressure: point.pressure,
    temperature: point.temperature,
    lowerLimit: 25,
    upperLimit: 40
  }));

  const handleAutoCalibrate = async () => {
    await onCalibrate(tire.tireId);
  };

  const handleManualCalibrate = async () => {
    await onCalibrate(tire.tireId, manualPressure);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', config.bgColor)}>
              <CircleDot className={cn('h-6 w-6', config.color)} />
            </div>
            <div>
              <SheetTitle>{tire.serial}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {tire.machineName} • Posição {tire.position}
                </span>
                <Badge 
                  variant={tire.status === 'critical' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {config.label}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>
        
        <div className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className={cn('h-4 w-4', config.color)} />
                  <span className="text-xs text-muted-foreground">Pressão Atual</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn('text-2xl font-bold', config.color)}>
                    {tire.currentPressure}
                  </span>
                  <span className="text-sm text-muted-foreground">psi</span>
                </div>
                <span className={cn(
                  'text-xs',
                  pressureDeviation > 0 ? 'text-amber-500' : 
                  pressureDeviation < 0 ? 'text-blue-500' : 'text-emerald-500'
                )}>
                  {pressureDeviation > 0 ? '+' : ''}{pressureDeviation.toFixed(1)} do ideal
                </span>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className={cn(
                    'h-4 w-4',
                    tire.temperature > 70 ? 'text-red-500' : 'text-muted-foreground'
                  )} />
                  <span className="text-xs text-muted-foreground">Temperatura</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    'text-2xl font-bold',
                    tire.temperature > 70 && 'text-red-500'
                  )}>
                    {tire.temperature}
                  </span>
                  <span className="text-sm text-muted-foreground">°C</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {tire.temperature < 40 ? 'Normal' : tire.temperature < 70 ? 'Elevada' : 'Crítica'}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Pressure */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">Pressão Recomendada</span>
                </div>
                <span className="text-xl font-bold text-primary">
                  {tire.recommendedPressure} psi
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pressure Chart */}
          <CalibrationChart data={chartData} title="Histórico de Pressão (24h)" />

          {/* Auto Calibration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Calibração Automática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ajusta automaticamente para {tire.recommendedPressure} psi
              </p>
              <Button 
                className="w-full"
                onClick={handleAutoCalibrate}
                disabled={isCalibrating || tire.status === 'optimal'}
              >
                {isCalibrating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Calibrando...
                  </>
                ) : tire.status === 'optimal' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Já Calibrado
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Calibrar Automaticamente
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Calibration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Ajuste Manual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pressão alvo</span>
                  <span className="font-medium">{manualPressure} psi</span>
                </div>
                <Slider
                  value={[manualPressure]}
                  min={20}
                  max={45}
                  step={0.5}
                  onValueChange={([value]) => setManualPressure(value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20 psi</span>
                  <span>45 psi</span>
                </div>
              </div>
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleManualCalibrate}
                disabled={isCalibrating}
              >
                Ajustar para {manualPressure} psi
              </Button>
            </CardContent>
          </Card>

          {/* Last Calibration Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Última Calibração</span>
                </div>
                <span className="text-sm font-medium">
                  {format(new Date(tire.lastCalibration), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
