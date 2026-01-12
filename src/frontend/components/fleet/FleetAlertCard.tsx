import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Eye, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VehicleAlert, AlertSeverity } from '@/hooks/useFleetManagement';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FleetAlertCardProps {
  alert: VehicleAlert;
  onViewVehicle?: () => void;
  onResolve?: () => void;
}

const SEVERITY_CONFIG: Record<AlertSeverity, { 
  color: string; 
  bgColor: string; 
  borderColor: string;
  label: string;
}> = {
  critical: { 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10', 
    borderColor: 'border-red-500/30',
    label: 'Crítico'
  },
  high: { 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10', 
    borderColor: 'border-orange-500/30',
    label: 'Alto'
  },
  medium: { 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10', 
    borderColor: 'border-amber-500/30',
    label: 'Médio'
  },
  low: { 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10', 
    borderColor: 'border-blue-500/30',
    label: 'Baixo'
  }
};

export const FleetAlertCard = ({ alert, onViewVehicle, onResolve }: FleetAlertCardProps) => {
  const config = SEVERITY_CONFIG[alert.severity];
  
  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <Card className={cn('border-l-4', config.borderColor)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', config.bgColor)}>
            <AlertTriangle className={cn('h-5 w-5', config.color)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
            
            <div className="flex items-center gap-1.5 mb-1">
              <Truck className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{alert.vehicleName}</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {alert.message}
            </p>
            
            <div className="flex gap-2 mt-3">
              {onViewVehicle && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewVehicle();
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Veículo
                </Button>
              )}
              {onResolve && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs text-emerald-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve();
                  }}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolver
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
