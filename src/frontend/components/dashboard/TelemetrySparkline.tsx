import { motion } from 'framer-motion';
import { useMemo, memo } from 'react';
import { cn } from '@/lib/utils';

interface TelemetrySparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showArea?: boolean;
  animate?: boolean;
  showPulse?: boolean;
  className?: string;
}

const colorMap = {
  primary: {
    stroke: 'hsl(var(--primary))',
    fill: 'hsl(var(--primary) / 0.15)',
    glow: 'hsl(var(--primary) / 0.3)',
  },
  success: {
    stroke: 'hsl(var(--status-ok))',
    fill: 'hsl(var(--status-ok) / 0.15)',
    glow: 'hsl(var(--status-ok) / 0.3)',
  },
  warning: {
    stroke: 'hsl(var(--status-warning))',
    fill: 'hsl(var(--status-warning) / 0.15)',
    glow: 'hsl(var(--status-warning) / 0.3)',
  },
  danger: {
    stroke: 'hsl(var(--status-critical))',
    fill: 'hsl(var(--status-critical) / 0.15)',
    glow: 'hsl(var(--status-critical) / 0.3)',
  },
};

export const TelemetrySparkline = memo(function TelemetrySparkline({
  data,
  width = 80,
  height = 32,
  color = 'primary',
  showArea = true,
  animate = true,
  showPulse = true,
  className,
}: TelemetrySparklineProps) {
  const colors = colorMap[color];
  const padding = 2;
  const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  
  // Normalize data to fit in the SVG
  const normalizedData = useMemo(() => {
    if (data.length === 0) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    return data.map((value, index) => ({
      x: padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2),
      y: height - padding - ((value - min) / range) * (height - padding * 2),
      value,
    }));
  }, [data, width, height]);

  // Create smooth curve path using Catmull-Rom spline
  const pathD = useMemo(() => {
    if (normalizedData.length < 2) return '';
    
    const points = normalizedData;
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      // Catmull-Rom to Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    
    return path;
  }, [normalizedData]);

  // Area path
  const areaPathD = useMemo(() => {
    if (!showArea || normalizedData.length < 2) return '';
    const lastPoint = normalizedData[normalizedData.length - 1];
    const firstPoint = normalizedData[0];
    return `${pathD} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
  }, [pathD, normalizedData, height, showArea]);

  // Current value indicator
  const currentPoint = normalizedData[normalizedData.length - 1];

  if (data.length < 2) {
    return (
      <div 
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-muted-foreground/30"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id={`sparkline-gradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id={`sparkline-glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Area fill */}
      {showArea && (
        <motion.path
          d={areaPathD}
          fill={`url(#sparkline-gradient-${uniqueId})`}
          initial={animate ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      )}

      {/* Line with glow */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#sparkline-glow-${uniqueId})`}
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Current value dot */}
      {currentPoint && (
        <>
          {/* Outer glow */}
          <motion.circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r={4}
            fill={colors.glow}
            initial={animate ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
          />
          
          {/* Inner dot */}
          <motion.circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r={2.5}
            fill={colors.stroke}
            initial={animate ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 400 }}
          />

          {/* Pulsing ring */}
          {showPulse && (
            <motion.circle
              cx={currentPoint.x}
              cy={currentPoint.y}
              r={2.5}
              fill="none"
              stroke={colors.stroke}
              strokeWidth={1.5}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </>
      )}
    </svg>
  );
});

// Live sparkline that connects to real telemetry
interface LiveSparklineProps {
  machineId: string;
  metric: 'pressure' | 'speed';
  data?: number[];
  color?: 'primary' | 'success' | 'warning' | 'danger';
  width?: number;
  height?: number;
  className?: string;
}

export const LiveSparkline = memo(function LiveSparkline({ 
  machineId, 
  metric, 
  data,
  color = 'primary', 
  width = 80,
  height = 32,
  className,
}: LiveSparklineProps) {
  // Use provided data or generate placeholder
  const displayData = useMemo(() => {
    if (data && data.length > 0) return data;
    
    // Generate consistent placeholder based on machineId
    const hash = machineId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseValue = metric === 'pressure' ? 25 + (hash % 8) : 12 + (hash % 15);
    
    return Array.from({ length: 20 }, (_, i) => 
      baseValue + Math.sin((i + hash) / 4) * 2 + (Math.random() - 0.5) * 1.5
    );
  }, [data, machineId, metric]);
  
  return (
    <TelemetrySparkline
      data={displayData}
      color={color}
      width={width}
      height={height}
      className={className}
      showPulse={!!data && data.length > 0}
    />
  );
});

// Connection status indicator
interface ConnectionIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionIndicator({ isConnected, className }: ConnectionIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <motion.div
        className={cn(
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-status-ok' : 'bg-muted-foreground'
        )}
        animate={isConnected ? { scale: [1, 1.2, 1] } : undefined}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs text-muted-foreground">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}
