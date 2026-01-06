import { motion } from 'framer-motion';
import { Gauge, Zap, Thermometer, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TelemetryDataCardProps {
  pressure: number;
  speed: number;
  temperature?: number;
  optimalPressure?: number;
  onClick?: () => void;
  className?: string;
}

export function TelemetryDataCard({
  pressure,
  speed,
  temperature = 35, // Default simulated temperature
  optimalPressure = 28,
  onClick,
  className = '',
}: TelemetryDataCardProps) {
  // Calculate pressure status
  const pressureDeviation = Math.abs(pressure - optimalPressure) / optimalPressure;
  const pressureStatus = pressureDeviation > 0.15 ? 'critical' : pressureDeviation > 0.08 ? 'warning' : 'ok';
  
  // Simulate temperature based on pressure and speed
  const simulatedTemp = temperature + (speed / 10) + (Math.abs(pressure - optimalPressure) * 2);

  const metrics = [
    {
      icon: Gauge,
      label: 'Pressão',
      value: pressure.toFixed(1),
      unit: 'PSI',
      status: pressureStatus,
      optimal: optimalPressure,
    },
    {
      icon: Zap,
      label: 'Velocidade',
      value: speed.toFixed(0),
      unit: 'km/h',
      status: speed > 35 ? 'warning' : 'ok',
    },
    {
      icon: Thermometer,
      label: 'Temperatura',
      value: simulatedTemp.toFixed(0),
      unit: '°C',
      status: simulatedTemp > 50 ? 'critical' : simulatedTemp > 40 ? 'warning' : 'ok',
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
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Dados de Telemetria</h3>
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
                {metric.optimal && (
                  <span className="text-[10px] text-muted-foreground">
                    ideal: {metric.optimal}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
