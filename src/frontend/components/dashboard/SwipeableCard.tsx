import { ReactNode, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Check, X, MoreHorizontal, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = {
    icon: <Check className="w-5 h-5" />,
    label: 'Confirmar',
    color: 'text-white',
    bgColor: 'bg-status-ok',
    onClick: () => {},
  },
  rightAction = {
    icon: <Eye className="w-5 h-5" />,
    label: 'Ver',
    color: 'text-white',
    bgColor: 'bg-primary',
    onClick: () => {},
  },
  threshold = 100,
  className,
  disabled = false,
}: SwipeableCardProps) {
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  const [isSwipedRight, setIsSwipedRight] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  
  // Transform for background actions
  const leftBgOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightBgOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const leftIconScale = useTransform(x, [0, threshold / 2, threshold], [0.5, 0.8, 1.2]);
  const rightIconScale = useTransform(x, [-threshold, -threshold / 2, 0], [1.2, 0.8, 0.5]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (disabled) return;
    
    const { offset, velocity } = info;
    const swipeThreshold = threshold * 0.5;
    const velocityThreshold = 500;
    
    // Right swipe (positive x)
    if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      setIsSwipedRight(true);
      leftAction.onClick();
      onSwipeRight?.();
      
      // Reset after animation
      setTimeout(() => setIsSwipedRight(false), 300);
    }
    // Left swipe (negative x)
    else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      setIsSwipedLeft(true);
      rightAction.onClick();
      onSwipeLeft?.();
      
      // Reset after animation
      setTimeout(() => setIsSwipedLeft(false), 300);
    }
  }, [disabled, threshold, leftAction, rightAction, onSwipeLeft, onSwipeRight]);

  return (
    <div ref={constraintsRef} className={cn('relative overflow-hidden rounded-xl', className)}>
      {/* Left action background (revealed on right swipe) */}
      <motion.div 
        style={{ opacity: leftBgOpacity }}
        className={cn(
          'absolute inset-y-0 left-0 w-24 flex items-center justify-center',
          leftAction.bgColor
        )}
      >
        <motion.div 
          style={{ scale: leftIconScale }}
          className={cn('flex flex-col items-center gap-1', leftAction.color)}
        >
          {leftAction.icon}
          <span className="text-xs font-medium">{leftAction.label}</span>
        </motion.div>
      </motion.div>
      
      {/* Right action background (revealed on left swipe) */}
      <motion.div 
        style={{ opacity: rightBgOpacity }}
        className={cn(
          'absolute inset-y-0 right-0 w-24 flex items-center justify-center',
          rightAction.bgColor
        )}
      >
        <motion.div 
          style={{ scale: rightIconScale }}
          className={cn('flex flex-col items-center gap-1', rightAction.color)}
        >
          {rightAction.icon}
          <span className="text-xs font-medium">{rightAction.label}</span>
        </motion.div>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        style={{ x }}
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: -threshold * 1.2, right: threshold * 1.2 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{
          x: isSwipedLeft ? -threshold : isSwipedRight ? threshold : 0,
          scale: isSwipedLeft || isSwipedRight ? 0.98 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative z-10 bg-background cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Haptic feedback simulation
export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    // Use Vibration API if available
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { triggerHaptic };
}
