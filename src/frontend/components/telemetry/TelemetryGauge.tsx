import { motion } from 'framer-motion';
import { Gauge, Zap } from 'lucide-react';

interface TelemetryGaugeProps {
  type: 'pressure' | 'speed';
  value: number;
  min: number;
  max: number;
  target?: number;
  unit: string;
  className?: string;
}

export function TelemetryGauge({
  type,
  value,
  min,
  max,
  target,
  unit,
  className = '',
}: TelemetryGaugeProps) {
  const Icon = type === 'pressure' ? Gauge : Zap;
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Determine status color
  let statusColor = 'text-status-ok';
  let bgColor = 'bg-status-ok';
  
  if (type === 'pressure' && target) {
    const deviation = Math.abs(value - target) / target;
    if (deviation > 0.15) {
      statusColor = 'text-status-critical';
      bgColor = 'bg-status-critical';
    } else if (deviation > 0.08) {
      statusColor = 'text-status-warning';
      bgColor = 'bg-status-warning';
    }
  } else if (type === 'speed') {
    const speedRatio = value / max;
    if (speedRatio >= 1) {
      statusColor = 'text-status-critical';
      bgColor = 'bg-status-critical';
    } else if (speedRatio >= 0.8) {
      statusColor = 'text-status-warning';
      bgColor = 'bg-status-warning';
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Gauge background */}
      <div className="relative w-full aspect-[2/1] overflow-hidden">
        <svg
          viewBox="0 0 200 100"
          className="w-full h-full"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className={statusColor}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: '1 1',
            }}
          />
          
          {/* Target marker */}
          {target && (
            <g transform={`rotate(${((target - min) / (max - min)) * 180 - 90}, 100, 100)`}>
              <line
                x1="100"
                y1="28"
                x2="100"
                y2="8"
                stroke="hsl(var(--status-ok))"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className={`p-2 rounded-full ${bgColor}/20 mb-1`}>
            <Icon className={`w-5 h-5 ${statusColor}`} />
          </div>
          <motion.span
            key={value}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-bold tabular-nums ${statusColor}`}
          >
            {value.toFixed(1)}
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {unit}
          </span>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1 px-2">
        <span>{min}</span>
        {target && (
          <span className="text-status-ok font-medium">{target} (ideal)</span>
        )}
        <span>{max}</span>
      </div>
    </div>
  );
}
