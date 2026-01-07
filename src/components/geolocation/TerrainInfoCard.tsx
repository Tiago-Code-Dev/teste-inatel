import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mountain, Cloud, TrendingDown, Gauge, Thermometer } from 'lucide-react';
import { 
  GeoLocationData, 
  TerrainType, 
  ClimateCondition,
  getTerrainLabel, 
  getClimateLabel, 
  getTerrainIcon, 
  getClimateIcon 
} from '@/hooks/useGeolocation';

interface TerrainInfoCardProps {
  location: GeoLocationData;
  terrainImpact: number;
  climateImpact: number;
  onViewDetails?: () => void;
}

export function TerrainInfoCard({ 
  location, 
  terrainImpact, 
  climateImpact,
  onViewDetails 
}: TerrainInfoCardProps) {
  const combinedImpact = terrainImpact * climateImpact;
  const impactLevel = combinedImpact >= 2.5 ? 'critical' : combinedImpact >= 1.5 ? 'warning' : 'optimal';
  const adjustedWear = Math.min(100, location.wearLevel * combinedImpact);

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onViewDetails}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium truncate">
            {location.machineName}
          </CardTitle>
          <Badge 
            variant={impactLevel === 'critical' ? 'destructive' : impactLevel === 'warning' ? 'secondary' : 'outline'}
            className={impactLevel === 'optimal' ? 'bg-green-500/10 text-green-600 border-green-200' : ''}
          >
            {location.performanceScore}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Pneu: {location.tireSerial}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Terrain & Climate */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Mountain className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg">{getTerrainIcon(location.terrainType)}</span>
            <span>{getTerrainLabel(location.terrainType)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            ×{terrainImpact.toFixed(1)}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg">{getClimateIcon(location.climate)}</span>
            <span>{getClimateLabel(location.climate)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            ×{climateImpact.toFixed(1)}
          </Badge>
        </div>

        {/* Performance Impact */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingDown className="w-3 h-3" />
              Desgaste Ajustado
            </span>
            <span className={`font-medium ${
              adjustedWear >= 80 ? 'text-destructive' : 
              adjustedWear >= 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {adjustedWear.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={adjustedWear} 
            className="h-2"
          />
        </div>

        {/* Telemetry Data */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <Gauge className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Pressão</p>
            <p className="text-sm font-medium">{location.pressure.toFixed(0)} psi</p>
          </div>
          <div className="text-center">
            <Thermometer className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Temp</p>
            <p className="text-sm font-medium">{location.temperature.toFixed(0)}°C</p>
          </div>
          <div className="text-center">
            <TrendingDown className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Desgaste</p>
            <p className="text-sm font-medium">{location.wearLevel}%</p>
          </div>
        </div>

        {/* Combined Impact Warning */}
        {combinedImpact >= 1.5 && (
          <div className={`p-2 rounded-lg text-xs ${
            impactLevel === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-700'
          }`}>
            <strong>Impacto combinado:</strong> ×{combinedImpact.toFixed(2)} no desgaste do pneu
          </div>
        )}
      </CardContent>
    </Card>
  );
}
