import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
          },
        }}
        exit={{ 
          opacity: 0, 
          y: -8,
          transition: {
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
          },
        }}
        className="motion-reduce:transition-none motion-reduce:animate-none"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
