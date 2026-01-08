import { motion } from 'framer-motion';
import { Check, PartyPopper, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  variant?: 'check' | 'celebration' | 'sparkle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onComplete?: () => void;
}

const sizeConfig = {
  sm: { container: 'w-12 h-12', icon: 'w-5 h-5' },
  md: { container: 'w-16 h-16', icon: 'w-7 h-7' },
  lg: { container: 'w-24 h-24', icon: 'w-10 h-10' },
};

export function SuccessAnimation({ 
  variant = 'check', 
  size = 'md',
  className,
  onComplete 
}: SuccessAnimationProps) {
  const config = sizeConfig[size];
  const Icon = variant === 'celebration' ? PartyPopper : variant === 'sparkle' ? Sparkles : Check;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Pulse ring */}
      <motion.div
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={cn(
          'absolute rounded-full bg-status-success/20 motion-reduce:animate-none',
          config.container
        )}
      />
      
      {/* Main circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        onAnimationComplete={onComplete}
        className={cn(
          'relative flex items-center justify-center rounded-full bg-status-success shadow-lg shadow-status-success/30 motion-reduce:transition-none',
          config.container
        )}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.1,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <Icon className={cn('text-white', config.icon)} />
        </motion.div>
      </motion.div>
    </div>
  );
}
