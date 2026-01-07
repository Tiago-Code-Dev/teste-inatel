import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface GeoSummaryCardProps {
  stats: {
    total: number;
    critical: number;
    warning: number;
    optimal: number;
    avgPerformance: number;
  };
  alertCount: number;
}

export function GeoSummaryCard({ stats, alertCount }: GeoSummaryCardProps) {
  const optimalPercentage = (stats.optimal / (stats.total || 1)) * 100;
  const warningPercentage = (stats.warning / (stats.total || 1)) * 100;
  const criticalPercentage = (stats.critical / (stats.total || 1)) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="w-5 h-5" />
          Resumo de Geolocalização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Localizações</p>
          </div>
          
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{stats.optimal}</p>
            </div>
            <p className="text-xs text-muted-foreground">Ótimo</p>
          </div>
          
          <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
            <p className="text-xs text-muted-foreground">Alerta</p>
          </div>
          
          <div className="p-3 bg-red-500/10 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
            </div>
            <p className="text-xs text-muted-foreground">Crítico</p>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Distribuição de Desempenho</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex bg-muted">
            <div 
              className="bg-green-500 transition-all" 
              style={{ width: `${optimalPercentage}%` }} 
            />
            <div 
              className="bg-yellow-500 transition-all" 
              style={{ width: `${warningPercentage}%` }} 
            />
            <div 
              className="bg-red-500 transition-all" 
              style={{ width: `${criticalPercentage}%` }} 
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{optimalPercentage.toFixed(0)}% ótimo</span>
            <span>{warningPercentage.toFixed(0)}% alerta</span>
            <span>{criticalPercentage.toFixed(0)}% crítico</span>
          </div>
        </div>

        {/* Average Performance */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Performance Média</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={stats.avgPerformance} className="w-24 h-2" />
            <span className="text-sm font-semibold">{stats.avgPerformance.toFixed(0)}%</span>
          </div>
        </div>

        {/* Alert Count */}
        {alertCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Alertas Ativos</span>
            </div>
            <span className="text-lg font-bold text-destructive">{alertCount}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
