import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FleetHealthGaugeProps {
  score: number;
  previousScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 120, strokeWidth: 8, fontSize: 'text-2xl', iconSize: 16 },
  md: { width: 180, strokeWidth: 12, fontSize: 'text-4xl', iconSize: 24 },
  lg: { width: 240, strokeWidth: 16, fontSize: 'text-5xl', iconSize: 32 },
};

export function FleetHealthGauge({ 
  score, 
  previousScore,
  size = 'md',
  showDetails = true,
  className,
}: FleetHealthGaugeProps) {
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayScore, setDisplayScore] = useState(0);
  
  // Animated score value
  const springScore = useSpring(0, { stiffness: 50, damping: 20 });
  
  useEffect(() => {
    springScore.set(score);
    
    // Update display score through subscription
    const unsubscribe = springScore.on('change', (val) => {
      setDisplayScore(Math.round(val));
    });
    
    return unsubscribe;
  }, [score, springScore]);
  
  useEffect(() => {
    springScore.set(score);
  }, [score, springScore]);
  
  const animatedScore = useTransform(springScore, (val) => Math.round(val));
  
  // Calculate stroke dashoffset for the arc
  const strokeDashoffset = useTransform(
    springScore, 
    (val) => circumference - (val / 100) * circumference * 0.75 // 270 degrees arc
  );

  // Get color based on score
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'hsl(var(--status-ok))';
    if (value >= 60) return 'hsl(var(--status-warning))';
    return 'hsl(var(--status-critical))';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return 'Excelente';
    if (value >= 60) return 'Atenção';
    if (value >= 40) return 'Risco';
    return 'Crítico';
  };

  const getScoreGlow = (value: number) => {
    if (value >= 80) return 'drop-shadow(0 0 20px hsl(var(--status-ok) / 0.5))';
    if (value >= 60) return 'drop-shadow(0 0 20px hsl(var(--status-warning) / 0.5))';
    return 'drop-shadow(0 0 20px hsl(var(--status-critical) / 0.5))';
  };

  const trend = previousScore !== undefined ? score - previousScore : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('relative flex flex-col items-center', className)}
    >
      {/* SVG Gauge */}
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg 
          width={config.width} 
          height={config.width}
          className="transform -rotate-[135deg]"
        >
          {/* Background arc */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25} // 270 degrees
            className="opacity-30"
          />
          
          {/* Animated progress arc */}
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset,
              filter: getScoreGlow(score),
            }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="mb-1"
          >
            <Heart 
              size={config.iconSize}
              className={cn(
                score >= 80 ? 'text-status-ok' : 
                score >= 60 ? 'text-status-warning' : 
                'text-status-critical'
              )}
              fill="currentColor"
            />
          </motion.div>
          
          <motion.span 
            className={cn(
              'font-bold tabular-nums',
              config.fontSize,
              score >= 80 ? 'text-status-ok' : 
              score >= 60 ? 'text-status-warning' : 
              'text-status-critical'
            )}
          >
            {displayScore}
            <span className="text-lg">%</span>
          </motion.span>
          
          {showDetails && (
            <span className="text-xs text-muted-foreground font-medium">
              {getScoreLabel(score)}
            </span>
          )}
        </div>
      </div>

      {/* Trend indicator */}
      {previousScore !== undefined && showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            'flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium',
            trend > 0 ? 'bg-status-ok/10 text-status-ok' :
            trend < 0 ? 'bg-status-critical/10 text-status-critical' :
            'bg-muted text-muted-foreground'
          )}
        >
          <TrendIcon className="w-3 h-3" />
          <span>{trend > 0 ? '+' : ''}{trend}% vs ontem</span>
        </motion.div>
      )}
    </motion.div>
  );
}
