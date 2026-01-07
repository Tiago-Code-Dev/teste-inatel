import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, RotateCcw } from 'lucide-react';
import { DeformationThresholds } from '@/hooks/useTireDeformation';

interface DeformationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thresholds: DeformationThresholds;
  onSave: (thresholds: Partial<DeformationThresholds>) => void;
  onReset: () => void;
}

export function DeformationSettingsModal({
  open,
  onOpenChange,
  thresholds,
  onSave,
  onReset,
}: DeformationSettingsModalProps) {
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
            Configurações de Amassamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Deformation Thresholds */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Limites de Deformação</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warningLevel" className="text-xs">
                  Nível de Alerta (%)
                </Label>
                <Input
                  id="warningLevel"
                  type="number"
                  min="1"
                  max="15"
                  step="0.5"
                  value={localThresholds.warningLevel}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    warningLevel: parseFloat(e.target.value) || 5,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criticalLevel" className="text-xs">
                  Nível Crítico (%)
                </Label>
                <Input
                  id="criticalLevel"
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={localThresholds.criticalLevel}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    criticalLevel: parseFloat(e.target.value) || 10,
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Impact Factors */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Fatores de Impacto</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pressureImpact" className="text-xs">
                  Fator de Pressão
                </Label>
                <Input
                  id="pressureImpact"
                  type="number"
                  min="1"
                  max="3"
                  step="0.1"
                  value={localThresholds.pressureImpactFactor}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    pressureImpactFactor: parseFloat(e.target.value) || 1.5,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatureImpact" className="text-xs">
                  Fator de Temperatura
                </Label>
                <Input
                  id="temperatureImpact"
                  type="number"
                  min="1"
                  max="3"
                  step="0.1"
                  value={localThresholds.temperatureImpactFactor}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    temperatureImpactFactor: parseFloat(e.target.value) || 1.2,
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Automation Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Automação</h4>
            
            <div className="space-y-3">
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
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Correção Automática</Label>
                  <p className="text-xs text-muted-foreground">
                    Ajustar pressão automaticamente quando possível
                  </p>
                </div>
                <Switch
                  checked={localThresholds.autoCorrection}
                  onCheckedChange={(checked) => setLocalThresholds({
                    ...localThresholds,
                    autoCorrection: checked,
                  })}
                />
              </div>
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
