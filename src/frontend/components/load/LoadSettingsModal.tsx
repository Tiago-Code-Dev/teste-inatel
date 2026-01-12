import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, RotateCcw } from 'lucide-react';
import { LoadThresholds } from '@/hooks/useLoadAnalysis';

interface LoadSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thresholds: LoadThresholds;
  onSave: (thresholds: Partial<LoadThresholds>) => void;
  onReset: () => void;
}

export function LoadSettingsModal({
  open,
  onOpenChange,
  thresholds,
  onSave,
  onReset,
}: LoadSettingsModalProps) {
  const [localThresholds, setLocalThresholds] = useState(thresholds);

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
            <Settings className="w-5 h-5" />
            Configurações de Carga
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Load Limits */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Limites de Carga</h4>
            
            <div className="space-y-2">
              <Label htmlFor="maxLoad" className="text-xs">
                Carga Máxima por Pneu (kg)
              </Label>
              <Input
                id="maxLoad"
                type="number"
                min="1000"
                step="100"
                value={localThresholds.maxLoadKg}
                onChange={(e) => setLocalThresholds({
                  ...localThresholds,
                  maxLoadKg: parseFloat(e.target.value) || 5000,
                })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warningPercent" className="text-xs">
                  Nível de Alerta (%)
                </Label>
                <Input
                  id="warningPercent"
                  type="number"
                  min="50"
                  max="100"
                  value={localThresholds.warningPercent}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    warningPercent: parseFloat(e.target.value) || 80,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criticalPercent" className="text-xs">
                  Nível Crítico (%)
                </Label>
                <Input
                  id="criticalPercent"
                  type="number"
                  min="80"
                  max="150"
                  value={localThresholds.criticalPercent}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    criticalPercent: parseFloat(e.target.value) || 100,
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Impact Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Fator de Impacto</h4>
            
            <div className="space-y-2">
              <Label htmlFor="wearFactor" className="text-xs">
                Fator de Impacto no Desgaste
              </Label>
              <Input
                id="wearFactor"
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={localThresholds.wearImpactFactor}
                onChange={(e) => setLocalThresholds({
                  ...localThresholds,
                  wearImpactFactor: parseFloat(e.target.value) || 1.5,
                })}
              />
              <p className="text-xs text-muted-foreground">
                Multiplicador aplicado ao cálculo de impacto no desgaste
              </p>
            </div>
          </div>

          <Separator />

          {/* Automation */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Automação</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Alertas Automáticos</Label>
                <p className="text-xs text-muted-foreground">
                  Gerar alertas quando limites forem atingidos
                </p>
              </div>
              <Switch
                checked={localThresholds.autoAlerts}
                onCheckedChange={(checked) => setLocalThresholds({
                  ...localThresholds,
                  autoAlerts: checked,
                })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
