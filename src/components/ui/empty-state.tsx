import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  PartyPopper, 
  Search, 
  WifiOff, 
  FolderOpen, 
  Sparkles,
  AlertCircle,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type EmptyStateVariant = 'celebration' | 'search' | 'offline' | 'empty' | 'error' | 'onboarding';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: typeof PartyPopper;
  iconClass: string;
  bgClass: string;
}> = {
  celebration: {
    icon: PartyPopper,
    iconClass: 'text-status-success',
    bgClass: 'bg-status-success/10',
  },
  search: {
    icon: Search,
    iconClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
  },
  offline: {
    icon: WifiOff,
    iconClass: 'text-status-warning',
    bgClass: 'bg-status-warning/10',
  },
  empty: {
    icon: FolderOpen,
    iconClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-status-critical',
    bgClass: 'bg-status-critical/10',
  },
  onboarding: {
    icon: Sparkles,
    iconClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
};

export function EmptyState({ 
  variant = 'empty', 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center motion-reduce:transition-none motion-reduce:animate-none',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.1,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-4',
          config.bgClass
        )}
      >
        <motion.div
          animate={variant === 'celebration' ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={variant === 'celebration' ? { delay: 0.3, duration: 0.5, ease: 'easeInOut' } : {}}
        >
          <Icon className={cn('w-8 h-8', config.iconClass)} />
        </motion.div>
      </motion.div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}

      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.icon || <Plus className="w-4 h-4" />}
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
