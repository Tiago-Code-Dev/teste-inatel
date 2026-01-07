import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Gauge, Thermometer, Zap, Bell, Save } from 'lucide-react';
import { CalibrationThresholds } from '@/hooks/useTireCalibration';

interface CalibrationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: CalibrationThresholds;
  onSave: (thresholds: CalibrationThresholds) => void;
}

export const CalibrationSettingsModal = ({
  isOpen,
  onClose,
  thresholds,
  onSave
}: CalibrationSettingsModalProps) => {
  const [local, setLocal] = useState<CalibrationThresholds>(thresholds);

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Calibração</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Pressure Limits */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-500" />
                <Label className="font-medium">Limites de Pressão (psi)</Label>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Mínimo</span>
                    <span className="font-medium">{local.pressureLowerLimit} psi</span>
                  </div>
                  <Slider
                    value={[local.pressureLowerLimit]}
                    min={15}
                    max={35}
                    step={1}
                    onValueChange={([value]) => 
                      setLocal(prev => ({ ...prev, pressureLowerLimit: value }))
                    }
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Máximo</span>
                    <span className="font-medium">{local.pressureUpperLimit} psi</span>
                  </div>
                  <Slider
                    value={[local.pressureUpperLimit]}
                    min={30}
                    max={50}
                    step={1}
                    onValueChange={([value]) => 
                      setLocal(prev => ({ ...prev, pressureUpperLimit: value }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Limits */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <Label className="font-medium">Limites de Temperatura (°C)</Label>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Mínimo</span>
                    <span className="font-medium">{local.temperatureLowerLimit}°C</span>
                  </div>
                  <Slider
                    value={[local.temperatureLowerLimit]}
                    min={-10}
                    max={30}
                    step={1}
                    onValueChange={([value]) => 
                      setLocal(prev => ({ ...prev, temperatureLowerLimit: value }))
                    }
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Máximo</span>
                    <span className="font-medium">{local.temperatureUpperLimit}°C</span>
                  </div>
                  <Slider
                    value={[local.temperatureUpperLimit]}
                    min={50}
                    max={100}
                    step={1}
                    onValueChange={([value]) => 
                      setLocal(prev => ({ ...prev, temperatureUpperLimit: value }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Toggle Settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <div>
                    <Label className="font-medium">Calibração Automática</Label>
                    <p className="text-xs text-muted-foreground">
                      Ajusta pressão automaticamente
                    </p>
                  </div>
                </div>
                <Switch
                  checked={local.autoAdjustEnabled}
                  onCheckedChange={(checked) => 
                    setLocal(prev => ({ ...prev, autoAdjustEnabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  <div>
                    <Label className="font-medium">Notificações</Label>
                    <p className="text-xs text-muted-foreground">
                      Alertas de calibração
                    </p>
                  </div>
                </div>
                <Switch
                  checked={local.notificationsEnabled}
                  onCheckedChange={(checked) => 
                    setLocal(prev => ({ ...prev, notificationsEnabled: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
