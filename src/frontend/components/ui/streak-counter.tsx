import { motion } from 'framer-motion';
import { Flame, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  count: number;
  label?: string;
  variant?: 'flame' | 'lightning' | 'trophy';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { container: 'gap-1 px-2 py-1', icon: 'w-3.5 h-3.5', text: 'text-xs' },
  md: { container: 'gap-1.5 px-3 py-1.5', icon: 'w-4 h-4', text: 'text-sm' },
  lg: { container: 'gap-2 px-4 py-2', icon: 'w-5 h-5', text: 'text-base' },
};

const variantConfig = {
  flame: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  lightning: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  trophy: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

export function StreakCounter({ 
  count, 
  label = 'dias',
  variant = 'flame',
  size = 'md',
  className 
}: StreakCounterProps) {
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];
  const Icon = variantStyles.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center rounded-full font-medium motion-reduce:transition-none',
        variantStyles.bg,
        sizeStyles.container,
        className
      )}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 0.6, 
          repeat: Infinity, 
          repeatDelay: 2,
          ease: 'easeInOut' 
        }}
        className="motion-reduce:animate-none"
      >
        <Icon className={cn(sizeStyles.icon, variantStyles.color)} />
      </motion.div>
      <span className={cn(sizeStyles.text, variantStyles.color, 'font-bold')}>
        {count}
      </span>
      {label && (
        <span className={cn(sizeStyles.text, 'text-muted-foreground')}>
          {label}
        </span>
      )}
    </motion.div>
  );
}
