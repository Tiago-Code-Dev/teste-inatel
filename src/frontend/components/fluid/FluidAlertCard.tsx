import { motion } from 'framer-motion';
import { AlertTriangle, Droplets, Thermometer, Gauge, X, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FluidAlert } from '@/hooks/useFluidBallast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FluidAlertCardProps {
  alert: FluidAlert;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function FluidAlertCard({ alert, onDismiss, className = '' }: FluidAlertCardProps) {
  const getIcon = () => {
    switch (alert.type) {
      case 'fluid_level':
        return Droplets;
      case 'temperature':
        return Thermometer;
      case 'pressure':
        return Gauge;
      default:
        return AlertTriangle;
    }
  };

  const Icon = getIcon();

  const getTypeLabel = () => {
    switch (alert.type) {
      case 'fluid_level':
        return 'Nível de Fluido';
      case 'temperature':
        return 'Temperatura';
      case 'pressure':
        return 'Pressão';
      default:
        return 'Alerta';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className={`
        border-l-4 overflow-hidden
        ${alert.severity === 'critical' 
          ? 'border-l-status-critical bg-status-critical/5' 
          : 'border-l-status-warning bg-status-warning/5'}
      `}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <motion.div 
              className={`
                p-2 rounded-lg shrink-0
                ${alert.severity === 'critical' 
                  ? 'bg-status-critical/10 text-status-critical' 
                  : 'bg-status-warning/10 text-status-warning'}
              `}
              animate={alert.severity === 'critical' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`
                  text-xs font-medium px-2 py-0.5 rounded-full
                  ${alert.severity === 'critical' 
                    ? 'bg-status-critical/20 text-status-critical' 
                    : 'bg-status-warning/20 text-status-warning'}
                `}>
                  {alert.severity === 'critical' ? 'Crítico' : 'Alerta'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getTypeLabel()}
                </span>
              </div>

              <p className="text-sm font-medium text-foreground mb-1">
                {alert.message}
              </p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(alert.timestamp), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
                <span>Limite: {alert.threshold}</span>
              </div>
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
