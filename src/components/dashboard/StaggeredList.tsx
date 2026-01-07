import { ReactNode, Children, cloneElement, isValidElement } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  once?: boolean;
}

const getDirectionVariants = (direction: StaggeredListProps['direction']): Variants => {
  const offsets = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
  };
  
  const offset = offsets[direction || 'up'];
  
  return {
    hidden: { 
      opacity: 0, 
      ...offset,
      scale: 0.95,
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      scale: 1,
    },
  };
};

export function StaggeredList({
  children,
  className,
  staggerDelay = 0.08,
  baseDelay = 0,
  direction = 'up',
  duration = 0.5,
  once = true,
}: StaggeredListProps) {
  const variants = getDirectionVariants(direction);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: baseDelay,
      },
    },
  };

  const itemVariants: Variants = {
    ...variants,
    visible: {
      ...variants.visible,
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AnimatePresence mode="popLayout">
        {Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            viewport={{ once }}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Individual staggered item for more control
interface StaggeredItemProps {
  children: ReactNode;
  index: number;
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

export function StaggeredItem({
  children,
  index,
  className,
  staggerDelay = 0.08,
  baseDelay = 0,
  direction = 'up',
  duration = 0.5,
}: StaggeredItemProps) {
  const variants = getDirectionVariants(direction);
  const delay = baseDelay + index * staggerDelay;

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: variants.hidden,
        visible: {
          ...variants.visible,
          transition: {
            duration,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      layout
    >
      {children}
    </motion.div>
  );
}

// Fade stagger specifically for cards
interface StaggeredCardsProps {
  children: ReactNode;
  className?: string;
  columns?: number;
}

export function StaggeredCards({
  children,
  className,
  columns = 2,
}: StaggeredCardsProps) {
  return (
    <StaggeredList
      className={cn(
        'grid gap-4',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
      staggerDelay={0.06}
      baseDelay={0.2}
      direction="up"
    >
      {children}
    </StaggeredList>
  );
}
