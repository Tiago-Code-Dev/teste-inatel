import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TelemetrySparklineProps {
  data: number[];
  min?: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'warning' | 'critical';
  height?: number;
}

export function TelemetrySparkline({ 
  data, 
  min: propMin, 
  max: propMax, 
  className,
  color = 'primary',
  height = 32
}: TelemetrySparklineProps) {
  const { path, min, max } = useMemo(() => {
    if (data.length === 0) return { path: '', min: 0, max: 0 };
    
    const minVal = propMin ?? Math.min(...data);
    const maxVal = propMax ?? Math.max(...data);
    const range = maxVal - minVal || 1;
    
    const width = 100;
    const stepX = width / (data.length - 1);
    
    const points = data.map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - minVal) / range) * height;
      return `${x},${y}`;
    });
    
    return {
      path: `M ${points.join(' L ')}`,
      min: minVal,
      max: maxVal,
    };
  }, [data, propMin, propMax, height]);

  const colorClasses = {
    primary: 'stroke-primary',
    warning: 'stroke-status-warning',
    critical: 'stroke-status-critical',
  };

  if (data.length < 2) {
    return (
      <div className={cn('flex items-center justify-center text-xs text-muted-foreground', className)} style={{ height }}>
        Sem dados
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <svg 
        viewBox={`0 0 100 ${height}`} 
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <path
          d={path}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={colorClasses[color]}
        />
      </svg>
    </div>
  );
}
