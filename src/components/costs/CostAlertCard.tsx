import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CostAlert, CostCategory } from '@/hooks/useCostManagement';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CostAlertCardProps {
  alert: CostAlert;
  categoryLabel: string;
  onViewDetails?: () => void;
  onDismiss?: () => void;
}

const SEVERITY_CONFIG = {
  critical: { 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10', 
    borderColor: 'border-red-500/30',
    badge: 'destructive' as const
  },
  high: { 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10', 
    borderColor: 'border-orange-500/30',
    badge: 'destructive' as const
  },
  medium: { 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10', 
    borderColor: 'border-amber-500/30',
    badge: 'secondary' as const
  },
  low: { 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10', 
    borderColor: 'border-blue-500/30',
    badge: 'outline' as const
  }
};

const SEVERITY_LABELS = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo'
};

export const CostAlertCard = ({ 
  alert, 
  categoryLabel,
  onViewDetails, 
  onDismiss 
}: CostAlertCardProps) => {
  const config = SEVERITY_CONFIG[alert.severity];
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };
  
  const exceededBy = alert.currentValue - alert.threshold;
  const exceededPercent = Math.round((exceededBy / alert.threshold) * 100);

  return (
    <Card className={cn('border-l-4', config.borderColor)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', config.bgColor)}>
            <AlertTriangle className={cn('h-5 w-5', config.color)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={config.badge} className="text-xs">
                {SEVERITY_LABELS[alert.severity]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {categoryLabel}
              </span>
            </div>
            
            <h4 className="font-medium text-sm">
              {alert.machineName}
            </h4>
            
            <p className="text-sm text-muted-foreground mt-1">
              {alert.message}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-3 w-3 text-destructive" />
              <span className="text-xs text-destructive font-medium">
                +{formatCurrency(exceededBy)} ({exceededPercent}% acima)
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                <span>Atual: <strong>{formatCurrency(alert.currentValue)}</strong></span>
                <span className="mx-2">•</span>
                <span>Limite: {formatCurrency(alert.threshold)}</span>
              </div>
              
              <div className="flex gap-1">
                {onViewDetails && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 px-2"
                    onClick={onViewDetails}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                )}
                {onDismiss && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 px-2 text-muted-foreground"
                    onClick={onDismiss}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
