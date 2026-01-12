import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Fuel, Wrench, Package, DollarSign, Clock, Save } from 'lucide-react';
import { CostThresholds } from '@/hooks/useCostManagement';

interface CostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: CostThresholds;
  onSave: (thresholds: CostThresholds) => void;
}

export const CostSettingsModal = ({
  isOpen,
  onClose,
  thresholds,
  onSave
}: CostSettingsModalProps) => {
  const [localThresholds, setLocalThresholds] = useState<CostThresholds>(thresholds);

  const handleSave = () => {
    onSave(localThresholds);
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const thresholdFields = [
    { 
      key: 'fuelLimit' as const, 
      label: 'Limite de Combustível', 
      icon: Fuel, 
      color: 'text-amber-500',
      max: 20000 
    },
    { 
      key: 'maintenanceLimit' as const, 
      label: 'Limite de Manutenção', 
      icon: Wrench, 
      color: 'text-blue-500',
      max: 15000 
    },
    { 
      key: 'partsLimit' as const, 
      label: 'Limite de Peças', 
      icon: Package, 
      color: 'text-purple-500',
      max: 10000 
    },
    { 
      key: 'totalLimit' as const, 
      label: 'Limite Total', 
      icon: DollarSign, 
      color: 'text-foreground',
      max: 50000 
    },
    { 
      key: 'costPerHourLimit' as const, 
      label: 'Limite Custo/Hora', 
      icon: Clock, 
      color: 'text-cyan-500',
      max: 500 
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Custos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {thresholdFields.map((field) => (
            <Card key={field.key}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <field.icon className={`h-4 w-4 ${field.color}`} />
                    <Label className="text-sm">{field.label}</Label>
                  </div>
                  <span className="text-sm font-medium">
                    {field.key === 'costPerHourLimit' 
                      ? `${formatCurrency(localThresholds[field.key])}/h`
                      : formatCurrency(localThresholds[field.key])
                    }
                  </span>
                </div>
                
                <Slider
                  value={[localThresholds[field.key]]}
                  max={field.max}
                  step={field.key === 'costPerHourLimit' ? 10 : 100}
                  onValueChange={([value]) => 
                    setLocalThresholds(prev => ({ ...prev, [field.key]: value }))
                  }
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(0)}</span>
                  <span>{formatCurrency(field.max)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
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
