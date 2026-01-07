import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, RotateCcw, Save, Droplets, Thermometer, Gauge, Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { FluidThresholds, useFluidThresholds } from '@/hooks/useFluidBallast';
import { toast } from 'sonner';

interface FluidSettingsModalProps {
  trigger?: React.ReactNode;
}

export function FluidSettingsModal({ trigger }: FluidSettingsModalProps) {
  const { thresholds, updateThresholds, resetThresholds } = useFluidThresholds();
  const [open, setOpen] = useState(false);
  const [localThresholds, setLocalThresholds] = useState<FluidThresholds>(thresholds);

  useEffect(() => {
    setLocalThresholds(thresholds);
  }, [thresholds, open]);

  const handleSave = () => {
    updateThresholds(localThresholds);
    toast.success('Configurações salvas com sucesso');
    setOpen(false);
  };

  const handleReset = () => {
    resetThresholds();
    setLocalThresholds(thresholds);
    toast.info('Configurações restauradas para o padrão');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="shrink-0">
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Lastro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fluid Level Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Droplets className="w-4 h-4 text-primary" />
              <span>Nível de Fluido (%)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fluidMin" className="text-xs">Mínimo Ideal</Label>
                <Input
                  id="fluidMin"
                  type="number"
                  value={localThresholds.fluidLevelMin}
                  onChange={(e) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    fluidLevelMin: Number(e.target.value) 
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fluidMax" className="text-xs">Máximo Ideal</Label>
                <Input
                  id="fluidMax"
                  type="number"
                  value={localThresholds.fluidLevelMax}
                  onChange={(e) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    fluidLevelMax: Number(e.target.value) 
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fluidCritLow" className="text-xs text-status-critical">Crítico Baixo</Label>
                <Input
                  id="fluidCritLow"
                  type="number"
                  value={localThresholds.fluidLevelCriticalLow}
                  onChange={(e) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    fluidLevelCriticalLow: Number(e.target.value) 
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fluidCritHigh" className="text-xs text-status-critical">Crítico Alto</Label>
                <Input
                  id="fluidCritHigh"
                  type="number"
                  value={localThresholds.fluidLevelCriticalHigh}
                  onChange={(e) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    fluidLevelCriticalHigh: Number(e.target.value) 
                  }))}
                  className="h-9"
                />
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Temperature Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Thermometer className="w-4 h-4 text-status-warning" />
              <span>Temperatura (°C)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tempMax" className="text-xs">Máxima Alerta</Label>
                <Input
                  id="tempMax"
                  type="number"
                  value={localThresholds.temperatureMax}
                  onChange={(e) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    temperatureMax: Number(e.target.value) 
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempCrit" className="text-xs text-status-critical">Crítica</Label>
                <Input
                  id="tempCrit"
                  type="number"
                  value={localThresholds.temperatureCritical}
                  onChange={(e) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    temperatureCritical: Number(e.target.value) 
                  }))}
                  className="h-9"
                />
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Pressure Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Gauge className="w-4 h-4 text-primary" />
              <span>Pressão (bar)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pressMin" className="text-xs">Mínima</Label>
                <Input
                  id="pressMin"
                  type="number"
                  step="0.1"
                  value={localThresholds.pressureMin}
                  onChange={(e) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    pressureMin: Number(e.target.value) 
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pressMax" className="text-xs">Máxima</Label>
                <Input
                  id="pressMax"
                  type="number"
                  step="0.1"
                  value={localThresholds.pressureMax}
                  onChange={(e) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    pressureMax: Number(e.target.value) 
                  }))}
                  className="h-9"
                />
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Predictive Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell className="w-4 h-4 text-status-ok" />
              <span>Alertas Preditivos</span>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enablePredictive" className="text-sm">
                Ativar alertas preditivos
              </Label>
              <Switch
                id="enablePredictive"
                checked={localThresholds.enablePredictiveAlerts}
                onCheckedChange={(checked) => setLocalThresholds(prev => ({ 
                  ...prev, 
                  enablePredictiveAlerts: checked 
                }))}
              />
            </div>

            {localThresholds.enablePredictiveAlerts && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Limiar de alerta: {localThresholds.predictiveThreshold}%
                  </Label>
                </div>
                <Slider
                  value={[localThresholds.predictiveThreshold]}
                  onValueChange={([value]) => setLocalThresholds(prev => ({ 
                    ...prev, 
                    predictiveThreshold: value 
                  }))}
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Alerta quando valores estiverem a {localThresholds.predictiveThreshold}% dos limites
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
