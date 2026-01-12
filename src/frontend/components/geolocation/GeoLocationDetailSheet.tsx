import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Mountain, 
  Cloud, 
  Gauge, 
  Thermometer, 
  Activity,
  TrendingDown,
  Clock,
  Wrench,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { 
  GeoLocationData, 
  PerformanceStatus,
  getTerrainLabel, 
  getClimateLabel, 
  getTerrainIcon, 
  getClimateIcon 
} from '@/hooks/useGeolocation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GeoLocationDetailSheetProps {
  location: GeoLocationData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getPerformanceStatus: (score: number) => PerformanceStatus;
  terrainImpact: number;
  climateImpact: number;
}

export function GeoLocationDetailSheet({
  location,
  open,
  onOpenChange,
  getPerformanceStatus,
  terrainImpact,
  climateImpact,
}: GeoLocationDetailSheetProps) {
  if (!location) return null;

  const status = getPerformanceStatus(location.performanceScore);
  const combinedImpact = terrainImpact * climateImpact;
  const adjustedWear = Math.min(100, location.wearLevel * combinedImpact);

  const getRecommendations = () => {
    const recommendations: { icon: typeof Wrench; text: string; priority: 'high' | 'medium' | 'low' }[] = [];

    if (combinedImpact >= 2.0) {
      recommendations.push({
        icon: RefreshCw,
        text: 'Considere substituição do pneu devido às condições adversas',
        priority: 'high',
      });
    }

    if (location.pressure < 90) {
      recommendations.push({
        icon: Gauge,
        text: 'Ajuste a pressão do pneu - está abaixo do recomendado',
        priority: combinedImpact >= 1.5 ? 'high' : 'medium',
      });
    }

    if (location.temperature > 45) {
      recommendations.push({
        icon: Thermometer,
        text: 'Monitore a temperatura - considere pausas para resfriamento',
        priority: 'medium',
      });
    }

    if (terrainImpact >= 1.5) {
      recommendations.push({
        icon: Mountain,
        text: 'Reduza a velocidade em terrenos irregulares',
        priority: 'medium',
      });
    }

    if (climateImpact >= 1.3) {
      recommendations.push({
        icon: Cloud,
        text: 'Aumente os intervalos de inspeção em condições climáticas adversas',
        priority: 'low',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Detalhes da Localização
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Machine & Tire Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{location.machineName}</h3>
            <p className="text-sm text-muted-foreground">Pneu: {location.tireSerial}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Última atualização:{' '}
              {formatDistanceToNow(new Date(location.timestamp), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>
          </div>

          <Separator />

          {/* Performance Score */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Desempenho
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score de Performance</span>
              <Badge 
                variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'outline'}
                className={status === 'optimal' ? 'bg-green-500/10 text-green-600 border-green-200' : ''}
              >
                {location.performanceScore}%
              </Badge>
            </div>
            <Progress value={location.performanceScore} className="h-2" />
          </div>

          <Separator />

          {/* Terrain & Climate Analysis */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              Análise Geográfica
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getTerrainIcon(location.terrainType)}</span>
                  <span className="font-medium">{getTerrainLabel(location.terrainType)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Multiplicador de desgaste: <span className="font-medium">×{terrainImpact.toFixed(1)}</span>
                </p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getClimateIcon(location.climate)}</span>
                  <span className="font-medium">{getClimateLabel(location.climate)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Impacto climático: <span className="font-medium">×{climateImpact.toFixed(1)}</span>
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              combinedImpact >= 2.0 ? 'bg-destructive/10 border border-destructive/20' :
              combinedImpact >= 1.5 ? 'bg-yellow-500/10 border border-yellow-500/20' :
              'bg-green-500/10 border border-green-500/20'
            }`}>
              <p className="text-sm font-medium">
                Impacto Combinado: ×{combinedImpact.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Desgaste ajustado: {adjustedWear.toFixed(0)}% (original: {location.wearLevel}%)
              </p>
            </div>
          </div>

          <Separator />

          {/* Telemetry Data */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Dados de Telemetria
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <Gauge className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Pressão</p>
                <p className="text-lg font-semibold">{location.pressure.toFixed(0)} psi</p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <Thermometer className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Temperatura</p>
                <p className="text-lg font-semibold">{location.temperature.toFixed(0)}°C</p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <TrendingDown className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Desgaste</p>
                <p className="text-lg font-semibold">{location.wearLevel}%</p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <Activity className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Velocidade</p>
                <p className="text-lg font-semibold">{location.speed.toFixed(1)} km/h</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Recomendações
              </h4>

              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg flex items-start gap-3 ${
                      rec.priority === 'high' ? 'bg-destructive/10' :
                      rec.priority === 'medium' ? 'bg-yellow-500/10' :
                      'bg-muted/50'
                    }`}
                  >
                    <rec.icon className={`w-4 h-4 mt-0.5 ${
                      rec.priority === 'high' ? 'text-destructive' :
                      rec.priority === 'medium' ? 'text-yellow-600' :
                      'text-muted-foreground'
                    }`} />
                    <span className="text-sm">{rec.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Coordenadas</p>
            <p className="text-sm font-mono">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
