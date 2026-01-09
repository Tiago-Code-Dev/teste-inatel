import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AnalyticsPageSkeleton } from '@/components/shared/PageSkeletons';
import { useAdvancedAnalytics, useTeamPerformance, TimeRange } from '@/hooks/useAdvancedAnalytics';
import {
  AnalyticsKPICard,
  MTTRGauge,
  AlertTrendChart,
  ShiftPerformanceChart,
  SeverityDistributionChart,
  TeamPerformanceTable,
  HourlyHeatmap,
} from '@/components/analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target,
  RefreshCw,
  Calendar,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24 horas' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
];

const AdvancedAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  
  const { metrics, comparison, isLoading, refetch } = useAdvancedAnalytics(timeRange);
  const { teamData, isLoading: teamLoading } = useTeamPerformance(timeRange);

  if (isLoading && !metrics) {
    return (
      <MainLayout title="Analytics Avançado">
        <div className="p-4">
          <AnalyticsPageSkeleton />
        </div>
      </MainLayout>
    );
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <MainLayout 
      title="Analytics Avançado"
      subtitle="Métricas de performance e insights"
    >
      <div className="space-y-6">
        {/* Header with time range selector */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="font-semibold">Dashboard de Analytics</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="h-8 w-8"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Time range tabs */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList className="grid w-full grid-cols-4 h-9">
            {timeRangeOptions.map(option => (
              <TabsTrigger key={option.value} value={option.value} className="text-xs">
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AnalyticsKPICard
            title="Total de Alertas"
            value={metrics.totalAlerts}
            icon={<AlertTriangle className="w-4 h-4" />}
            trend={comparison.alertChange}
            trendLabel="vs período anterior"
            variant="danger"
          />
          <AnalyticsKPICard
            title="Resolvidos"
            value={metrics.resolvedAlerts}
            subtitle={`${metrics.totalAlerts > 0 ? Math.round((metrics.resolvedAlerts / metrics.totalAlerts) * 100) : 0}% do total`}
            icon={<CheckCircle2 className="w-4 h-4" />}
            trend={comparison.resolutionChange}
            variant="success"
          />
          <AnalyticsKPICard
            title="MTTR"
            value={formatTime(metrics.mttrMinutes)}
            subtitle="Tempo médio de resolução"
            icon={<Clock className="w-4 h-4" />}
            trend={comparison.mttrChange}
            trendInverse // Lower is better
            variant={metrics.mttrMinutes <= 60 ? 'success' : metrics.mttrMinutes <= 120 ? 'warning' : 'danger'}
          />
          <AnalyticsKPICard
            title="SLA Cumprido"
            value={`${metrics.slaCompliance}%`}
            subtitle="Dentro do prazo"
            icon={<Target className="w-4 h-4" />}
            variant={metrics.slaCompliance >= 90 ? 'success' : metrics.slaCompliance >= 75 ? 'warning' : 'danger'}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* MTTR Gauge */}
          <MTTRGauge 
            mttrMinutes={metrics.mttrMinutes}
            targetMinutes={60}
            previousMttr={comparison.mttrChange !== 0 
              ? Math.round(metrics.mttrMinutes / (1 + comparison.mttrChange / 100))
              : undefined
            }
          />

          {/* Severity Distribution */}
          <SeverityDistributionChart data={metrics.alertsBySeverity} />
        </div>

        {/* Alert Trend */}
        <AlertTrendChart data={metrics.alertTrend} />

        {/* Shift Performance + Hourly Heatmap */}
        <div className="grid lg:grid-cols-2 gap-4">
          <ShiftPerformanceChart data={metrics.alertsByShift} />
          <HourlyHeatmap data={metrics.alertsByHour} />
        </div>

        {/* Team Performance */}
        <TeamPerformanceTable data={teamData} />

        {/* Top Machines */}
        {metrics.topMachines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                Máquinas com Mais Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topMachines.map((machine, index) => (
                  <motion.div
                    key={machine.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="font-medium">{machine.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {machine.alertCount} alertas
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              Comparativo com Período Anterior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Alertas</p>
                <div className={`flex items-center justify-center gap-1 ${
                  comparison.alertChange < 0 ? 'text-status-ok' : comparison.alertChange > 0 ? 'text-status-critical' : 'text-muted-foreground'
                }`}>
                  {comparison.alertChange !== 0 && (
                    comparison.alertChange < 0 
                      ? <ArrowDownRight className="w-4 h-4" />
                      : <ArrowUpRight className="w-4 h-4" />
                  )}
                  <span className="text-lg font-bold">{Math.abs(comparison.alertChange)}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Resoluções</p>
                <div className={`flex items-center justify-center gap-1 ${
                  comparison.resolutionChange > 0 ? 'text-status-ok' : comparison.resolutionChange < 0 ? 'text-status-critical' : 'text-muted-foreground'
                }`}>
                  {comparison.resolutionChange !== 0 && (
                    comparison.resolutionChange > 0 
                      ? <ArrowUpRight className="w-4 h-4" />
                      : <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="text-lg font-bold">{Math.abs(comparison.resolutionChange)}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">MTTR</p>
                <div className={`flex items-center justify-center gap-1 ${
                  comparison.mttrChange < 0 ? 'text-status-ok' : comparison.mttrChange > 0 ? 'text-status-critical' : 'text-muted-foreground'
                }`}>
                  {comparison.mttrChange !== 0 && (
                    comparison.mttrChange < 0 
                      ? <ArrowDownRight className="w-4 h-4" />
                      : <ArrowUpRight className="w-4 h-4" />
                  )}
                  <span className="text-lg font-bold">{Math.abs(comparison.mttrChange)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdvancedAnalyticsPage;
