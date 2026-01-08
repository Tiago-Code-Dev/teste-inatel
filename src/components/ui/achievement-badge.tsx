import { motion } from 'framer-motion';
import { Trophy, Star, Shield, Zap, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

type AchievementType = 'gold' | 'silver' | 'bronze' | 'special';

interface AchievementBadgeProps {
  title: string;
  description?: string;
  type?: AchievementType;
  icon?: 'trophy' | 'star' | 'shield' | 'zap' | 'target' | 'award';
  unlocked?: boolean;
  className?: string;
}

const typeConfig: Record<AchievementType, { gradient: string; glow: string }> = {
  gold: {
    gradient: 'from-amber-400 to-yellow-600',
    glow: 'shadow-amber-500/30',
  },
  silver: {
    gradient: 'from-slate-300 to-slate-500',
    glow: 'shadow-slate-400/30',
  },
  bronze: {
    gradient: 'from-orange-400 to-amber-700',
    glow: 'shadow-orange-500/30',
  },
  special: {
    gradient: 'from-purple-400 to-pink-600',
    glow: 'shadow-purple-500/30',
  },
};

const iconMap = {
  trophy: Trophy,
  star: Star,
  shield: Shield,
  zap: Zap,
  target: Target,
  award: Award,
};

export function AchievementBadge({
  title,
  description,
  type = 'gold',
  icon = 'trophy',
  unlocked = true,
  className,
}: AchievementBadgeProps) {
  const config = typeConfig[type];
  const Icon = iconMap[icon];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      className={cn(
        'relative flex flex-col items-center gap-2 p-4 rounded-xl motion-reduce:transition-none',
        unlocked ? 'cursor-pointer' : 'opacity-40 grayscale',
        className
      )}
    >
      {/* Badge circle */}
      <div
        className={cn(
          'relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden',
          'bg-gradient-to-br shadow-lg',
          config.gradient,
          config.glow
        )}
      >
        {/* Shine effect */}
        {unlocked && (
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent motion-reduce:hidden"
          />
        )}
        <Icon className="w-8 h-8 text-white drop-shadow-md" />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
