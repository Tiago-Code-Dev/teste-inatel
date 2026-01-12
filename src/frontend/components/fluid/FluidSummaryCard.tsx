import { motion } from 'framer-motion';
import { Droplets, Thermometer, Gauge, Activity, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FluidCalculation } from '@/hooks/useFluidBallast';

interface FluidSummaryCardProps {
  calculation: FluidCalculation;
  className?: string;
}

export function FluidSummaryCard({ calculation, className = '' }: FluidSummaryCardProps) {
  const getFluidStatusColor = () => {
    switch (calculation.fluidStatus) {
      case 'ideal':
        return 'text-status-ok';
      case 'low':
      case 'high':
        return 'text-status-warning';
      case 'critical_low':
      case 'critical_high':
        return 'text-status-critical';
      default:
        return 'text-muted-foreground';
    }
  };

  const getFluidStatusLabel = () => {
    switch (calculation.fluidStatus) {
      case 'ideal':
        return 'Ideal';
      case 'low':
        return 'Baixo';
      case 'high':
        return 'Alto';
      case 'critical_low':
        return 'Crítico Baixo';
      case 'critical_high':
        return 'Crítico Alto';
      default:
        return 'Desconhecido';
    }
  };

  const getTemperatureStatusColor = () => {
    switch (calculation.temperatureStatus) {
      case 'normal':
        return 'text-status-ok';
      case 'elevated':
        return 'text-status-warning';
      case 'critical':
        return 'text-status-critical';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPressureStatusColor = () => {
    switch (calculation.pressureStatus) {
      case 'normal':
        return 'text-status-ok';
      case 'low':
      case 'high':
        return 'text-status-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getEfficiencyColor = () => {
    if (calculation.efficiency >= 80) return 'bg-status-ok';
    if (calculation.efficiency >= 60) return 'bg-status-warning';
    return 'bg-status-critical';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Resumo do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center p-3 rounded-lg bg-muted/30"
            >
              <div className={`p-2 rounded-lg mb-2 ${
                calculation.fluidStatus === 'ideal' 
                  ? 'bg-status-ok/10' 
                  : calculation.fluidStatus.includes('critical') 
                    ? 'bg-status-critical/10' 
                    : 'bg-status-warning/10'
              }`}>
                <Droplets className={`w-5 h-5 ${getFluidStatusColor()}`} />
              </div>
              <span className="text-xs text-muted-foreground mb-1">Fluido</span>
              <span className="text-lg font-bold tabular-nums">{calculation.currentLevel}%</span>
              <span className={`text-xs font-medium ${getFluidStatusColor()}`}>
                {getFluidStatusLabel()}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col items-center p-3 rounded-lg bg-muted/30"
            >
              <div className={`p-2 rounded-lg mb-2 ${
                calculation.temperatureStatus === 'normal' 
                  ? 'bg-status-ok/10' 
                  : calculation.temperatureStatus === 'critical' 
                    ? 'bg-status-critical/10' 
                    : 'bg-status-warning/10'
              }`}>
                <Thermometer className={`w-5 h-5 ${getTemperatureStatusColor()}`} />
              </div>
              <span className="text-xs text-muted-foreground mb-1">Temperatura</span>
              <span className="text-lg font-bold tabular-nums">{calculation.currentTemperature}°C</span>
              <span className={`text-xs font-medium capitalize ${getTemperatureStatusColor()}`}>
                {calculation.temperatureStatus === 'normal' ? 'Normal' : 
                 calculation.temperatureStatus === 'elevated' ? 'Elevada' : 'Crítica'}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center p-3 rounded-lg bg-muted/30"
            >
              <div className={`p-2 rounded-lg mb-2 ${
                calculation.pressureStatus === 'normal' 
                  ? 'bg-status-ok/10' 
                  : 'bg-status-warning/10'
              }`}>
                <Gauge className={`w-5 h-5 ${getPressureStatusColor()}`} />
              </div>
              <span className="text-xs text-muted-foreground mb-1">Pressão</span>
              <span className="text-lg font-bold tabular-nums">{calculation.currentPressure} bar</span>
              <span className={`text-xs font-medium capitalize ${getPressureStatusColor()}`}>
                {calculation.pressureStatus === 'normal' ? 'Normal' : 
                 calculation.pressureStatus === 'low' ? 'Baixa' : 'Alta'}
              </span>
            </motion.div>
          </div>

          {/* Efficiency Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Eficiência do Sistema</span>
              </div>
              <span className="font-bold">{calculation.efficiency}%</span>
            </div>
            <Progress 
              value={calculation.efficiency} 
              className="h-2"
            />
          </motion.div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Droplets className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Desgaste</p>
                <p className="text-sm font-semibold">{calculation.fluidWearPercent}%</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
            >
              <div className="p-2 rounded-lg bg-status-ok/10">
                <Calendar className="w-4 h-4 text-status-ok" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Reabast.</p>
                <p className="text-sm font-semibold">
                  {calculation.estimatedRefillDays > 30 ? '30+ dias' : `${calculation.estimatedRefillDays} dias`}
                </p>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
