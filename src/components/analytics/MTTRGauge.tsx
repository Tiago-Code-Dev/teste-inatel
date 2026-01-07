import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface MTTRGaugeProps {
  mttrMinutes: number;
  targetMinutes?: number;
  previousMttr?: number;
  className?: string;
}

export function MTTRGauge({ 
  mttrMinutes, 
  targetMinutes = 60, 
  previousMttr,
  className 
}: MTTRGaugeProps) {
  const { hours, minutes } = useMemo(() => {
    const h = Math.floor(mttrMinutes / 60);
    const m = mttrMinutes % 60;
    return { hours: h, minutes: m };
  }, [mttrMinutes]);

  const percentage = useMemo(() => {
    return Math.min((mttrMinutes / targetMinutes) * 100, 100);
  }, [mttrMinutes, targetMinutes]);

  const isGood = mttrMinutes <= targetMinutes;
  const isWarning = mttrMinutes > targetMinutes && mttrMinutes <= targetMinutes * 1.5;
  const isCritical = mttrMinutes > targetMinutes * 1.5;

  const getStatusColor = () => {
    if (isGood) return 'text-status-ok';
    if (isWarning) return 'text-status-warning';
    return 'text-status-critical';
  };

  const getGaugeColor = () => {
    if (isGood) return '#22c55e'; // green
    if (isWarning) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const change = previousMttr ? Math.round(((mttrMinutes - previousMttr) / previousMttr) * 100) : 0;

  // SVG gauge dimensions
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-4 h-4" />
          MTTR
          <span className="text-xs font-normal text-muted-foreground">
            (Tempo Médio de Resolução)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Gauge */}
          <div className="relative">
            <svg width={size} height={size / 2 + 20} className="overflow-visible">
              {/* Background arc */}
              <path
                d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Progress arc */}
              <motion.path
                d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                fill="none"
                stroke={getGaugeColor()}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              {/* Target indicator */}
              <circle
                cx={strokeWidth / 2 + (size - strokeWidth) * (100 / 100)}
                cy={size / 2}
                r={4}
                fill="hsl(var(--muted-foreground))"
              />
            </svg>
            
            {/* Center value */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              <motion.div 
                className={cn('text-3xl font-bold', getStatusColor())}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
              </motion.div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between w-full mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Meta</p>
              <p className="text-sm font-medium">
                {Math.floor(targetMinutes / 60)}h {targetMinutes % 60}m
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={cn('text-sm font-medium', getStatusColor())}>
                {isGood ? 'Dentro da meta' : isWarning ? 'Atenção' : 'Acima da meta'}
              </p>
            </div>

            {change !== 0 && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Variação</p>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  change < 0 ? 'text-status-ok' : 'text-status-critical'
                )}>
                  {change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  <span>{Math.abs(change)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
