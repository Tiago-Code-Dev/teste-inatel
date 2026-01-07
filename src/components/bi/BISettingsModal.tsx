import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, RotateCcw } from 'lucide-react';
import { BIThresholds } from '@/hooks/useBusinessIntelligence';

interface BISettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thresholds: BIThresholds;
  onSave: (thresholds: Partial<BIThresholds>) => void;
  onReset: () => void;
}

export function BISettingsModal({
  open,
  onOpenChange,
  thresholds,
  onSave,
  onReset,
}: BISettingsModalProps) {
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
            Configurações de BI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cost Thresholds */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Limites de Custo</h4>
            
            <div className="space-y-2">
              <Label htmlFor="costThreshold" className="text-xs">
                Alerta de Custo Diário (R$)
              </Label>
              <Input
                id="costThreshold"
                type="number"
                min="100"
                step="100"
                value={localThresholds.costAlertThreshold}
                onChange={(e) => setLocalThresholds({
                  ...localThresholds,
                  costAlertThreshold: parseFloat(e.target.value) || 5000,
                })}
              />
            </div>
          </div>

          <Separator />

          {/* Performance Thresholds */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Limites de Desempenho</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="efficiencyMin" className="text-xs">
                  Eficiência Mínima (%)
                </Label>
                <Input
                  id="efficiencyMin"
                  type="number"
                  min="50"
                  max="100"
                  value={localThresholds.efficiencyMinThreshold}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    efficiencyMinThreshold: parseFloat(e.target.value) || 70,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downtimeMax" className="text-xs">
                  Inatividade Máxima (h)
                </Label>
                <Input
                  id="downtimeMax"
                  type="number"
                  min="1"
                  value={localThresholds.downtimeMaxHours}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    downtimeMaxHours: parseFloat(e.target.value) || 48,
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Alert Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Alertas</h4>
            
            <div className="space-y-2">
              <Label htmlFor="alertsMax" className="text-xs">
                Máximo de Alertas
              </Label>
              <Input
                id="alertsMax"
                type="number"
                min="1"
                value={localThresholds.alertsMaxCount}
                onChange={(e) => setLocalThresholds({
                  ...localThresholds,
                  alertsMaxCount: parseInt(e.target.value) || 10,
                })}
              />
            </div>
          </div>

          <Separator />

          {/* Automation Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Automação</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Notificações Automáticas</Label>
                <p className="text-xs text-muted-foreground">
                  Enviar alertas quando limites forem atingidos
                </p>
              </div>
              <Switch
                checked={localThresholds.autoNotifications}
                onCheckedChange={(checked) => setLocalThresholds({
                  ...localThresholds,
                  autoNotifications: checked,
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
