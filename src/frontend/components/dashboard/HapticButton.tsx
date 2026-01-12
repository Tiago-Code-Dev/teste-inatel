import { forwardRef, ReactNode, useCallback } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HapticButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  hapticType?: 'light' | 'medium' | 'heavy';
  showRipple?: boolean;
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(({
  children,
  className,
  variant = 'default',
  size = 'md',
  hapticType = 'medium',
  showRipple = true,
  onClick,
  ...props
}, ref) => {
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[hapticType]);
    }
  }, [hapticType]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic();
    onClick?.(e as any);
  }, [triggerHaptic, onClick]);

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    success: 'bg-status-ok text-white hover:bg-status-ok/90',
    warning: 'bg-status-warning text-white hover:bg-status-warning/90',
    danger: 'bg-status-critical text-white hover:bg-status-critical/90',
    ghost: 'bg-transparent hover:bg-accent text-foreground',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-xl font-medium',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Ripple effect */}
      {showRipple && (
        <motion.span
          className="absolute inset-0 bg-white/20"
          initial={{ scale: 0, opacity: 1 }}
          whileTap={{ 
            scale: 2.5, 
            opacity: 0,
            transition: { duration: 0.5 }
          }}
          style={{ 
            borderRadius: '50%',
            transformOrigin: 'center',
          }}
        />
      )}
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
});

HapticButton.displayName = 'HapticButton';

// Floating Action Button with haptic
interface HapticFABProps extends HapticButtonProps {
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
}

export const HapticFAB = forwardRef<HTMLButtonElement, HapticFABProps>(({
  children,
  className,
  position = 'bottom-right',
  ...props
}, ref) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2',
    'bottom-left': 'fixed bottom-6 left-6',
  };

  return (
    <HapticButton
      ref={ref}
      className={cn(
        'w-14 h-14 rounded-full shadow-lg',
        'flex items-center justify-center',
        positionClasses[position],
        className
      )}
      size="lg"
      hapticType="heavy"
      {...props}
    >
      {children}
    </HapticButton>
  );
});

HapticFAB.displayName = 'HapticFAB';

// Card with haptic press
interface HapticCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function HapticCard({
  children,
  className,
  onClick,
  disabled = false,
}: HapticCardProps) {
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([15]);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    triggerHaptic();
    onClick?.();
  }, [disabled, triggerHaptic, onClick]);

  return (
    <motion.div
      className={cn(
        'cursor-pointer select-none',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}
