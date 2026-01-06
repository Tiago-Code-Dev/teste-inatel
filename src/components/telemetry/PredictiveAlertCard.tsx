import { motion } from 'framer-motion';
import { AlertTriangle, Gauge, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PredictiveAlert {
  type: 'pressure' | 'speed';
  level: 'warning' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
}

interface PredictiveAlertCardProps {
  alert: PredictiveAlert;
  onDismiss: () => void;
}

export function PredictiveAlertCard({ alert, onDismiss }: PredictiveAlertCardProps) {
  const isCritical = alert.level === 'critical';
  const Icon = alert.type === 'pressure' ? Gauge : Zap;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className={`
        relative p-4 rounded-xl border
        ${isCritical
          ? 'bg-status-critical/10 border-status-critical/30 shadow-glow-critical'
          : 'bg-status-warning/10 border-status-warning/30 shadow-glow-warning'
        }
      `}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-60 hover:opacity-100"
        onClick={onDismiss}
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="flex items-start gap-3">
        <div
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg
            ${isCritical ? 'bg-status-critical/20' : 'bg-status-warning/20'}
          `}
        >
          <Icon
            className={`w-5 h-5 ${isCritical ? 'text-status-critical' : 'text-status-warning'}`}
          />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              className={`w-4 h-4 ${isCritical ? 'text-status-critical' : 'text-status-warning'}`}
            />
            <span
              className={`text-xs font-medium uppercase tracking-wider ${
                isCritical ? 'text-status-critical' : 'text-status-warning'
              }`}
            >
              {isCritical ? 'Alerta Crítico' : 'Alerta Preditivo'}
            </span>
          </div>

          <p className="text-sm font-medium text-foreground mb-2">
            {alert.message}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {alert.type === 'pressure' ? 'Pressão' : 'Velocidade'}:{' '}
              <span className="font-mono font-medium">
                {alert.currentValue.toFixed(1)}
                {alert.type === 'pressure' ? ' PSI' : ' km/h'}
              </span>
            </span>
            <span>
              {formatDistanceToNow(alert.timestamp, {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(alert.currentValue / alert.threshold) * 100}%` }}
          className={`h-full rounded-full ${
            isCritical ? 'bg-status-critical' : 'bg-status-warning'
          }`}
        />
      </div>
    </motion.div>
  );
}
