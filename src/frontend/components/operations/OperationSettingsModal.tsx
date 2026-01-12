import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Clock, Timer, Zap } from 'lucide-react';
import { TaskSettings } from '@/types/operations';

interface OperationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: TaskSettings;
  onSave: (settings: TaskSettings) => void;
}

export function OperationSettingsModal({
  open,
  onOpenChange,
  settings,
  onSave
}: OperationSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<TaskSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configurações de Operação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Default SLA Hours */}
          <div className="space-y-2">
            <Label htmlFor="sla-hours" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              SLA Padrão (horas)
            </Label>
            <Input
              id="sla-hours"
              type="number"
              min={1}
              max={48}
              value={localSettings.defaultSlaHours}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                defaultSlaHours: parseInt(e.target.value) || 4
              })}
            />
            <p className="text-xs text-muted-foreground">
              Tempo padrão para novas tarefas
            </p>
          </div>

          {/* Warning Threshold */}
          <div className="space-y-2">
            <Label htmlFor="warning-threshold" className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              Alerta de Vencimento (minutos)
            </Label>
            <Input
              id="warning-threshold"
              type="number"
              min={5}
              max={120}
              value={localSettings.warningThresholdMinutes}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                warningThresholdMinutes: parseInt(e.target.value) || 30
              })}
            />
            <p className="text-xs text-muted-foreground">
              Tempo antes do vencimento para exibir alerta
            </p>
          </div>

          {/* Auto Assign */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <Label htmlFor="auto-assign" className="font-medium">
                  Atribuição Automática
                </Label>
                <p className="text-xs text-muted-foreground">
                  Atribuir automaticamente ao funcionário disponível
                </p>
              </div>
            </div>
            <Switch
              id="auto-assign"
              checked={localSettings.autoAssign}
              onCheckedChange={(checked) => setLocalSettings({
                ...localSettings,
                autoAssign: checked
              })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
