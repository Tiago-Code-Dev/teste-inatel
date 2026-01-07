import { Progress } from '@/components/ui/progress';
import { TaskStatus } from '@/types/operations';
import { cn } from '@/lib/utils';

interface TaskProgressBarProps {
  progress: number;
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TaskProgressBar({ 
  progress, 
  status, 
  size = 'md', 
  showLabel = true 
}: TaskProgressBarProps) {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const getProgressColor = () => {
    if (status === 'completed') return 'bg-status-success';
    if (status === 'paused') return 'bg-status-warning';
    if (status === 'cancelled') return 'bg-muted';
    if (progress >= 75) return 'bg-status-success';
    if (progress >= 50) return 'bg-primary';
    if (progress >= 25) return 'bg-status-warning';
    return 'bg-muted-foreground';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progresso</span>
          <span className={cn(
            'font-medium',
            status === 'completed' && 'text-status-success',
            status === 'paused' && 'text-status-warning'
          )}>
            {progress}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', heights[size])}>
        <div 
          className={cn('h-full transition-all duration-500 ease-out rounded-full', getProgressColor())}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
