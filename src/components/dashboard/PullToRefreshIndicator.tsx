import { motion, useTransform, MotionValue } from 'framer-motion';
import { RefreshCw, Check, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  progress: number;
  isRefreshing: boolean;
  springY: MotionValue<number>;
}

export function PullToRefreshIndicator({ 
  progress, 
  isRefreshing, 
  springY 
}: PullToRefreshIndicatorProps) {
  const opacity = useTransform(springY, [0, 40, 80], [0, 0.5, 1]);
  const scale = useTransform(springY, [0, 80], [0.5, 1]);
  const rotate = useTransform(springY, [0, 80], [0, 180]);

  return (
    <motion.div
      style={{ opacity, scale, y: springY }}
      className={cn(
        'absolute left-1/2 -translate-x-1/2 -top-16 z-50',
        'flex items-center justify-center',
        'w-12 h-12 rounded-full',
        'bg-gradient-to-br from-primary/20 to-primary/10',
        'backdrop-blur-xl border border-primary/20',
        'shadow-lg shadow-primary/10'
      )}
    >
      {isRefreshing ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        >
          <RefreshCw className="w-5 h-5 text-primary" />
        </motion.div>
      ) : progress >= 1 ? (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Check className="w-5 h-5 text-primary" />
        </motion.div>
      ) : (
        <motion.div style={{ rotate }}>
          <ArrowDown className="w-5 h-5 text-primary" />
        </motion.div>
      )}
      
      {/* Progress ring */}
      <svg 
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="hsl(var(--primary) / 0.2)"
          strokeWidth="2"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 20}
          strokeDashoffset={2 * Math.PI * 20 * (1 - progress)}
          style={{ 
            transition: isRefreshing ? 'none' : 'stroke-dashoffset 0.1s ease-out' 
          }}
        />
      </svg>
    </motion.div>
  );
}
