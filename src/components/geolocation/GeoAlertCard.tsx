import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Mountain, 
  Cloud, 
  Activity, 
  TrendingDown,
  ChevronRight,
  Wrench
} from 'lucide-react';
import { GeoAlert } from '@/hooks/useGeolocation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GeoAlertCardProps {
  alert: GeoAlert;
  onViewDetails?: () => void;
  onDismiss?: () => void;
}

export function GeoAlertCard({ alert, onViewDetails, onDismiss }: GeoAlertCardProps) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'terrain': return Mountain;
      case 'climate': return Cloud;
      case 'performance': return Activity;
      case 'wear': return TrendingDown;
      default: return AlertTriangle;
    }
  };

  const getAlertTypeLabel = () => {
    switch (alert.type) {
      case 'terrain': return 'Terreno';
      case 'climate': return 'Clima';
      case 'performance': return 'Desempenho';
      case 'wear': return 'Desgaste';
      default: return 'Alerta';
    }
  };

  const Icon = getAlertIcon();

  return (
    <Card className={`border-l-4 ${
      alert.severity === 'high' ? 'border-l-destructive bg-destructive/5' :
      alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-500/5' :
      'border-l-blue-500 bg-blue-500/5'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            alert.severity === 'high' ? 'bg-destructive/10' :
            alert.severity === 'medium' ? 'bg-yellow-500/10' :
            'bg-blue-500/10'
          }`}>
            <Icon className={`w-5 h-5 ${
              alert.severity === 'high' ? 'text-destructive' :
              alert.severity === 'medium' ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant={
                  alert.severity === 'high' ? 'destructive' : 
                  alert.severity === 'medium' ? 'secondary' : 
                  'outline'
                }
                className="text-xs"
              >
                {getAlertTypeLabel()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(alert.timestamp), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>

            <p className="text-sm font-medium mb-2">{alert.message}</p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Wrench className="w-3 h-3" />
              <span>{alert.recommendation}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={onViewDetails}
              >
                Ver no Mapa
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs"
                  onClick={onDismiss}
                >
                  Dispensar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
