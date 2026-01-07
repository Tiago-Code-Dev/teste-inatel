import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, Clock, Pause, WifiOff } from 'lucide-react';
import { Employee, EmployeeStatus } from '@/types/operations';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EmployeeCardProps {
  employee: Employee;
  onAssign?: () => void;
  showAssignButton?: boolean;
  isSelected?: boolean;
}

const statusConfig: Record<EmployeeStatus, { label: string; icon: React.ComponentType<any>; className: string }> = {
  available: { label: 'Disponível', icon: CheckCircle, className: 'bg-status-success text-white' },
  busy: { label: 'Ocupado', icon: Clock, className: 'bg-primary text-primary-foreground' },
  paused: { label: 'Pausado', icon: Pause, className: 'bg-status-warning text-status-warning-foreground' },
  offline: { label: 'Offline', icon: WifiOff, className: 'bg-muted text-muted-foreground' }
};

export function EmployeeCard({ employee, onAssign, showAssignButton = false, isSelected = false }: EmployeeCardProps) {
  const status = statusConfig[employee.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      <Card 
        className={cn(
          'transition-all duration-200',
          isSelected && 'ring-2 ring-primary border-primary',
          employee.status === 'available' && showAssignButton && 'hover:border-primary/50 cursor-pointer',
          employee.status !== 'available' && 'opacity-60'
        )}
        onClick={employee.status === 'available' && onAssign ? onAssign : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-medium text-foreground truncate">{employee.name}</h4>
                <Badge className={cn('text-xs', status.className)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
              {employee.activeTasks > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {employee.activeTasks} tarefa{employee.activeTasks > 1 ? 's' : ''} ativa{employee.activeTasks > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {showAssignButton && employee.status === 'available' && (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign?.();
                }}
              >
                Atribuir
              </Button>
            )}
          </div>

          {employee.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
              {employee.skills.slice(0, 3).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {employee.skills.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{employee.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
