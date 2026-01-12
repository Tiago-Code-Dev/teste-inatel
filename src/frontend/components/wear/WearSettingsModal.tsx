import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2, RotateCcw, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WearThresholds {
  advanceCritical: number;
  slippageCritical: number;
  slippageWarning: number;
  optimalPressure: number;
  pressureTolerance: number;
  alertsEnabled: boolean;
}

interface WearSettingsModalProps {
  open: boolean;
  onClose: () => void;
  thresholds: WearThresholds;
  onSave: (thresholds: Partial<WearThresholds>) => void;
  onReset: () => void;
}

export function WearSettingsModal({
  open,
  onClose,
  thresholds,
  onSave,
  onReset,
}: WearSettingsModalProps) {
  const [localThresholds, setLocalThresholds] = useState(thresholds);

  useEffect(() => {
    setLocalThresholds(thresholds);
  }, [thresholds, open]);

  const handleSave = () => {
    onSave(localThresholds);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Configurações de Desgaste
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alerts Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-status-warning" />
              <div>
                <Label className="text-sm font-medium">Alertas Preditivos</Label>
                <p className="text-xs text-muted-foreground">Receber notificações de desgaste</p>
              </div>
            </div>
            <Switch
              checked={localThresholds.alertsEnabled}
              onCheckedChange={(checked) =>
                setLocalThresholds((prev) => ({ ...prev, alertsEnabled: checked }))
              }
            />
          </div>

          {/* Advance Threshold */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Limite de Avanço Crítico</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[localThresholds.advanceCritical]}
                onValueChange={([value]) =>
                  setLocalThresholds((prev) => ({ ...prev, advanceCritical: value }))
                }
                min={1000}
                max={10000}
                step={100}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[80px]">
                <Input
                  type="number"
                  value={localThresholds.advanceCritical}
                  onChange={(e) =>
                    setLocalThresholds((prev) => ({
                      ...prev,
                      advanceCritical: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-20 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">km</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Distância máxima antes de manutenção obrigatória
            </p>
          </div>

          {/* Slippage Critical */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Patinagem Crítica</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[localThresholds.slippageCritical]}
                onValueChange={([value]) =>
                  setLocalThresholds((prev) => ({ ...prev, slippageCritical: value }))
                }
                min={10}
                max={50}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <Input
                  type="number"
                  value={localThresholds.slippageCritical}
                  onChange={(e) =>
                    setLocalThresholds((prev) => ({
                      ...prev,
                      slippageCritical: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-16 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Slippage Warning */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Patinagem Alerta</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[localThresholds.slippageWarning]}
                onValueChange={([value]) =>
                  setLocalThresholds((prev) => ({ ...prev, slippageWarning: value }))
                }
                min={5}
                max={30}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <Input
                  type="number"
                  value={localThresholds.slippageWarning}
                  onChange={(e) =>
                    setLocalThresholds((prev) => ({
                      ...prev,
                      slippageWarning: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-16 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Optimal Pressure */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Pressão Ótima</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[localThresholds.optimalPressure]}
                onValueChange={([value]) =>
                  setLocalThresholds((prev) => ({ ...prev, optimalPressure: value }))
                }
                min={20}
                max={40}
                step={0.5}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[70px]">
                <Input
                  type="number"
                  value={localThresholds.optimalPressure}
                  onChange={(e) =>
                    setLocalThresholds((prev) => ({
                      ...prev,
                      optimalPressure: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-16 h-8 text-sm"
                  step="0.1"
                />
                <span className="text-xs text-muted-foreground">PSI</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Pressão ideal para minimizar patinagem e desgaste
            </p>
          </div>

          {/* Pressure Tolerance */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tolerância de Pressão</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[localThresholds.pressureTolerance * 100]}
                onValueChange={([value]) =>
                  setLocalThresholds((prev) => ({ ...prev, pressureTolerance: value / 100 }))
                }
                min={5}
                max={25}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[50px]">
                <span className="text-sm font-medium">
                  {(localThresholds.pressureTolerance * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
