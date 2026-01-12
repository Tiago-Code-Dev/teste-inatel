import { motion } from 'framer-motion';
import { Droplets, Thermometer, Gauge, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FluidTelemetryCardProps {
  fluidLevel: number;
  temperature: number;
  pressure: number;
  onClick?: () => void;
  className?: string;
}

export function FluidTelemetryCard({
  fluidLevel,
  temperature,
  pressure,
  onClick,
  className = '',
}: FluidTelemetryCardProps) {
  // Calculate status for each metric
  const getFluidStatus = () => {
    if (fluidLevel <= 25 || fluidLevel >= 95) return 'critical';
    if (fluidLevel < 40 || fluidLevel > 90) return 'warning';
    return 'ok';
  };

  const getTempStatus = () => {
    if (temperature >= 55) return 'critical';
    if (temperature >= 45) return 'warning';
    return 'ok';
  };

  const getPressureStatus = () => {
    if (pressure < 1.5 || pressure > 4.0) return 'warning';
    return 'ok';
  };

  const metrics = [
    {
      icon: Droplets,
      label: 'Fluido',
      value: fluidLevel.toFixed(1),
      unit: '%',
      status: getFluidStatus(),
    },
    {
      icon: Thermometer,
      label: 'Temp.',
      value: temperature.toFixed(1),
      unit: '°C',
      status: getTempStatus(),
    },
    {
      icon: Gauge,
      label: 'Pressão',
      value: pressure.toFixed(1),
      unit: 'bar',
      status: getPressureStatus(),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-status-critical bg-status-critical/10';
      case 'warning': return 'text-status-warning bg-status-warning/10';
      default: return 'text-status-ok bg-status-ok/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        className={`bg-card/50 backdrop-blur-sm border-border/50 ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Dados em Tempo Real</h3>
            {onClick && (
              <span className="text-xs text-muted-foreground ml-auto">Toque para detalhes</span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)} mb-2`}>
                  <metric.icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-muted-foreground mb-0.5">{metric.label}</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold tabular-nums">{metric.value}</span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
