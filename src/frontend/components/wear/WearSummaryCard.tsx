import { motion } from 'framer-motion';
import { TrendingUp, Activity, Timer, Gauge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WearCalculation {
  totalDistance: number;
  slippageIndex: number;
  estimatedLifeRemaining: number;
  wearRate: number;
  efficiency: number;
}

interface WearSummaryCardProps {
  calculation: WearCalculation;
  advanceCritical: number;
  className?: string;
}

export function WearSummaryCard({
  calculation,
  advanceCritical,
  className = '',
}: WearSummaryCardProps) {
  const lifePercentage = Math.min(100, (calculation.totalDistance / advanceCritical) * 100);
  
  const getLifeStatus = (remaining: number) => {
    if (remaining < 20) return { color: 'text-status-critical', bg: 'bg-status-critical' };
    if (remaining < 50) return { color: 'text-status-warning', bg: 'bg-status-warning' };
    return { color: 'text-status-ok', bg: 'bg-status-ok' };
  };

  const lifeStatus = getLifeStatus(calculation.estimatedLifeRemaining);

  const metrics = [
    {
      icon: TrendingUp,
      label: 'Avanço Total',
      value: calculation.totalDistance.toFixed(1),
      unit: 'km',
      description: `de ${advanceCritical} km`,
    },
    {
      icon: Activity,
      label: 'Patinagem',
      value: calculation.slippageIndex.toFixed(1),
      unit: '%',
      status: calculation.slippageIndex > 20 ? 'critical' : calculation.slippageIndex > 10 ? 'warning' : 'ok',
    },
    {
      icon: Timer,
      label: 'Vida Útil',
      value: calculation.estimatedLifeRemaining.toFixed(0),
      unit: '%',
      status: calculation.estimatedLifeRemaining < 20 ? 'critical' : calculation.estimatedLifeRemaining < 50 ? 'warning' : 'ok',
    },
    {
      icon: Gauge,
      label: 'Eficiência',
      value: calculation.efficiency.toFixed(0),
      unit: '%',
      status: calculation.efficiency < 70 ? 'warning' : 'ok',
    },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'critical': return 'text-status-critical';
      case 'warning': return 'text-status-warning';
      default: return 'text-status-ok';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          {/* Life Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Desgaste Acumulado</span>
              <span className={`text-sm font-bold ${lifeStatus.color}`}>
                {lifePercentage.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={lifePercentage} 
              className="h-2"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">0 km</span>
              <span className="text-xs text-muted-foreground">{advanceCritical} km</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className={`p-2 rounded-lg bg-primary/10`}>
                  <metric.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-bold tabular-nums ${metric.status ? getStatusColor(metric.status) : ''}`}>
                      {metric.value}
                    </span>
                    <span className="text-xs text-muted-foreground">{metric.unit}</span>
                  </div>
                  {metric.description && (
                    <p className="text-[10px] text-muted-foreground">{metric.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Wear Rate */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxa de Desgaste</span>
              <span className="font-medium">{calculation.wearRate.toFixed(1)} km/h</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
