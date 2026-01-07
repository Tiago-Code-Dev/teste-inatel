import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TelemetrySparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showArea?: boolean;
  animate?: boolean;
  className?: string;
}

const colorMap = {
  primary: {
    stroke: 'hsl(var(--primary))',
    fill: 'hsl(var(--primary) / 0.1)',
  },
  success: {
    stroke: 'hsl(var(--status-ok))',
    fill: 'hsl(var(--status-ok) / 0.1)',
  },
  warning: {
    stroke: 'hsl(var(--status-warning))',
    fill: 'hsl(var(--status-warning) / 0.1)',
  },
  danger: {
    stroke: 'hsl(var(--status-critical))',
    fill: 'hsl(var(--status-critical) / 0.1)',
  },
};

export function TelemetrySparkline({
  data,
  width = 80,
  height = 32,
  color = 'primary',
  showArea = true,
  animate = true,
  className,
}: TelemetrySparklineProps) {
  const colors = colorMap[color];
  const padding = 2;
  
  // Normalize data to fit in the SVG
  const normalizedData = useMemo(() => {
    if (data.length === 0) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    return data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * (width - padding * 2),
      y: height - padding - ((value - min) / range) * (height - padding * 2),
    }));
  }, [data, width, height]);

  // Create path string
  const pathD = useMemo(() => {
    if (normalizedData.length < 2) return '';
    
    // Smooth curve using quadratic bezier
    let path = `M ${normalizedData[0].x} ${normalizedData[0].y}`;
    
    for (let i = 1; i < normalizedData.length; i++) {
      const prev = normalizedData[i - 1];
      const curr = normalizedData[i];
      const cpx = (prev.x + curr.x) / 2;
      
      path += ` Q ${prev.x + (curr.x - prev.x) / 4} ${prev.y}, ${cpx} ${(prev.y + curr.y) / 2}`;
      path += ` Q ${cpx + (curr.x - cpx) / 2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  }, [normalizedData]);

  // Area path
  const areaPathD = useMemo(() => {
    if (!showArea || normalizedData.length < 2) return '';
    return `${pathD} L ${normalizedData[normalizedData.length - 1].x} ${height - padding} L ${normalizedData[0].x} ${height - padding} Z`;
  }, [pathD, normalizedData, height, showArea]);

  // Current value indicator
  const currentPoint = normalizedData[normalizedData.length - 1];

  if (data.length < 2) {
    return (
      <div 
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <span className="text-xs text-muted-foreground">-</span>
      </div>
    );
  }

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn('overflow-visible', className)}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <motion.path
          d={areaPathD}
          fill={`url(#sparkline-gradient-${color})`}
          initial={animate ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      )}

      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Current value dot */}
      {currentPoint && (
        <motion.circle
          cx={currentPoint.x}
          cy={currentPoint.y}
          r={3}
          fill={colors.stroke}
          initial={animate ? { scale: 0 } : undefined}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
        />
      )}

      {/* Pulsing effect on current dot */}
      {currentPoint && (
        <motion.circle
          cx={currentPoint.x}
          cy={currentPoint.y}
          r={3}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={1}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </svg>
  );
}

interface LiveSparklineProps {
  machineId: string;
  metric: 'pressure' | 'speed';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

// Simulated live data hook (will be replaced with real telemetry)
function useLiveTelemetry(machineId: string, metric: string) {
  const dataRef = useRef<number[]>([]);
  
  // Generate initial data based on machine ID for consistency
  useEffect(() => {
    const hash = machineId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseValue = metric === 'pressure' ? 25 + (hash % 10) : 12 + (hash % 15);
    
    // Initialize with 20 data points
    dataRef.current = Array.from({ length: 20 }, (_, i) => 
      baseValue + Math.sin(i / 3) * 3 + (Math.random() - 0.5) * 2
    );
  }, [machineId, metric]);

  return dataRef.current;
}

export function LiveSparkline({ machineId, metric, color = 'primary', className }: LiveSparklineProps) {
  const data = useLiveTelemetry(machineId, metric);
  
  return (
    <TelemetrySparkline
      data={data}
      color={color}
      className={className}
    />
  );
}
