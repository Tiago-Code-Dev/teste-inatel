import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { differenceInSeconds, differenceInMinutes, differenceInHours } from 'date-fns';

interface SlaCountdownProps {
  dueAt: Date | string;
  className?: string;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function SlaCountdown({ dueAt, className, onExpire, size = 'md' }: SlaCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  function calculateTimeLeft() {
    const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
    const now = new Date();
    const totalSeconds = differenceInSeconds(due, now);
    
    if (totalSeconds <= 0) {
      return { expired: true, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { expired: false, hours, minutes, seconds, totalSeconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.expired && !timeLeft.expired) {
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dueAt, onExpire, timeLeft.expired]);

  const getStatus = () => {
    if (timeLeft.expired) return 'expired';
    if (timeLeft.totalSeconds <= 30 * 60) return 'critical'; // 30 min
    if (timeLeft.totalSeconds <= 60 * 60) return 'warning'; // 1 hour
    return 'ok';
  };

  const status = getStatus();
  
  const config = {
    ok: {
      bg: 'bg-status-ok/10',
      text: 'text-status-ok',
      border: 'border-status-ok/30',
      icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-status-warning/10',
      text: 'text-status-warning',
      border: 'border-status-warning/30',
      icon: Clock,
    },
    critical: {
      bg: 'bg-status-critical/10',
      text: 'text-status-critical',
      border: 'border-status-critical/30',
      icon: AlertTriangle,
    },
    expired: {
      bg: 'bg-status-critical/20',
      text: 'text-status-critical',
      border: 'border-status-critical/50',
      icon: AlertTriangle,
    },
  };

  const { bg, text, border, icon: Icon } = config[status];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-base gap-3',
  };

  const digitSizeClasses = {
    sm: 'w-5 h-6 text-xs',
    md: 'w-7 h-8 text-sm',
    lg: 'w-10 h-12 text-lg',
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (timeLeft.expired) {
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className={cn(
          'flex items-center rounded-lg border',
          bg, border, sizeClasses[size],
          className
        )}
      >
        <Icon className={cn('w-4 h-4', text)} />
        <span className={cn('font-bold', text)}>SLA VENCIDO</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center rounded-lg border',
        bg, border, sizeClasses[size],
        status === 'critical' && 'animate-pulse',
        className
      )}
    >
      <Icon className={cn('w-4 h-4 shrink-0', text)} />
      
      <div className="flex items-center gap-0.5 font-mono">
        {/* Hours */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`h-${timeLeft.hours}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'flex items-center justify-center rounded font-bold',
              bg, text, digitSizeClasses[size]
            )}
          >
            {pad(timeLeft.hours)}
          </motion.div>
        </AnimatePresence>
        
        <span className={cn('font-bold', text)}>:</span>
        
        {/* Minutes */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`m-${timeLeft.minutes}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'flex items-center justify-center rounded font-bold',
              bg, text, digitSizeClasses[size]
            )}
          >
            {pad(timeLeft.minutes)}
          </motion.div>
        </AnimatePresence>
        
        <span className={cn('font-bold', text)}>:</span>
        
        {/* Seconds */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`s-${timeLeft.seconds}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'flex items-center justify-center rounded font-bold',
              bg, text, digitSizeClasses[size]
            )}
          >
            {pad(timeLeft.seconds)}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
