import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Gauge, Zap, Bell, RotateCcw, Save } from 'lucide-react';

interface AlertThresholds {
  pressureMin: number;
  pressureMax: number;
  pressureTarget: number;
  speedMax: number;
  predictiveEnabled: boolean;
  predictiveThreshold: number;
}

interface AlertSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thresholds: AlertThresholds;
  onSave: (thresholds: Partial<AlertThresholds>) => void;
  onReset: () => void;
}

export function AlertSettingsModal({
  open,
  onOpenChange,
  thresholds,
  onSave,
  onReset,
}: AlertSettingsModalProps) {
  const [localThresholds, setLocalThresholds] = useState(thresholds);

  useEffect(() => {
    setLocalThresholds(thresholds);
  }, [thresholds]);

  const handleSave = () => {
    onSave(localThresholds);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Configurações de Alertas
          </DialogTitle>
          <DialogDescription>
            Defina os limites para alertas de pressão e velocidade
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          {/* Pressure Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Gauge className="w-4 h-4 text-primary" />
              Limites de Pressão (PSI)
            </div>

            {/* Pressure Min */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Mínimo</Label>
                <span className="text-muted-foreground font-mono">
                  {localThresholds.pressureMin.toFixed(0)} PSI
                </span>
              </div>
              <Slider
                value={[localThresholds.pressureMin]}
                onValueChange={([value]) =>
                  setLocalThresholds(prev => ({ ...prev, pressureMin: value }))
                }
                min={15}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            {/* Pressure Target */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Ideal (Target)</Label>
                <span className="text-status-ok font-mono">
                  {localThresholds.pressureTarget.toFixed(0)} PSI
                </span>
              </div>
              <Slider
                value={[localThresholds.pressureTarget]}
                onValueChange={([value]) =>
                  setLocalThresholds(prev => ({ ...prev, pressureTarget: value }))
                }
                min={20}
                max={35}
                step={1}
                className="w-full"
              />
            </div>

            {/* Pressure Max */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Máximo</Label>
                <span className="text-status-critical font-mono">
                  {localThresholds.pressureMax.toFixed(0)} PSI
                </span>
              </div>
              <Slider
                value={[localThresholds.pressureMax]}
                onValueChange={([value]) =>
                  setLocalThresholds(prev => ({ ...prev, pressureMax: value }))
                }
                min={30}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Visual indicator */}
            <div className="h-3 rounded-full bg-gradient-to-r from-status-critical via-status-ok to-status-critical relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-foreground rounded-full"
                style={{
                  left: `${((localThresholds.pressureMin - 15) / 35) * 100}%`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-6 bg-status-ok rounded-full border-2 border-background"
                style={{
                  left: `${((localThresholds.pressureTarget - 15) / 35) * 100}%`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-foreground rounded-full"
                style={{
                  left: `${((localThresholds.pressureMax - 15) / 35) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Speed Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4 text-status-warning" />
              Limite de Velocidade (km/h)
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Velocidade Máxima</Label>
                <span className="text-status-warning font-mono">
                  {localThresholds.speedMax.toFixed(0)} km/h
                </span>
              </div>
              <Slider
                value={[localThresholds.speedMax]}
                onValueChange={([value]) =>
                  setLocalThresholds(prev => ({ ...prev, speedMax: value }))
                }
                min={20}
                max={80}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Predictive Alerts */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alertas Preditivos</Label>
                <p className="text-xs text-muted-foreground">
                  Receba alertas antes de atingir os limites
                </p>
              </div>
              <Switch
                checked={localThresholds.predictiveEnabled}
                onCheckedChange={(checked) =>
                  setLocalThresholds(prev => ({ ...prev, predictiveEnabled: checked }))
                }
              />
            </div>

            <AnimatePresence>
              {localThresholds.predictiveEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <Label>Antecedência do alerta</Label>
                    <span className="text-muted-foreground font-mono">
                      {(localThresholds.predictiveThreshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[localThresholds.predictiveThreshold * 100]}
                    onValueChange={([value]) =>
                      setLocalThresholds(prev => ({
                        ...prev,
                        predictiveThreshold: value / 100,
                      }))
                    }
                    min={10}
                    max={80}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Alerta quando atingir {(localThresholds.predictiveThreshold * 100).toFixed(0)}% do caminho para o limite
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2 w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
            <Save className="w-4 h-4" />
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
