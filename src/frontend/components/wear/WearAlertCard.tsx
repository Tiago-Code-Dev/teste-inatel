import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Activity, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WearAlert {
  type: 'advance' | 'slippage';
  level: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

interface WearAlertCardProps {
  alert: WearAlert;
  onDismiss?: () => void;
  onClick?: () => void;
}

export function WearAlertCard({ alert, onDismiss, onClick }: WearAlertCardProps) {
  const Icon = alert.type === 'advance' ? TrendingUp : Activity;
  const isCritical = alert.level === 'critical';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      <Card 
        className={`border-l-4 ${
          isCritical 
            ? 'border-l-status-critical bg-status-critical/5' 
            : 'border-l-status-warning bg-status-warning/5'
        } ${onClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <motion.div
              animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`p-2 rounded-lg ${
                isCritical ? 'bg-status-critical/20' : 'bg-status-warning/20'
              }`}
            >
              <Icon className={`w-4 h-4 ${
                isCritical ? 'text-status-critical' : 'text-status-warning'
              }`} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold uppercase ${
                  isCritical ? 'text-status-critical' : 'text-status-warning'
                }`}>
                  {isCritical ? 'Crítico' : 'Alerta'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {alert.type === 'advance' ? 'Avanço' : 'Patinagem'}
                </span>
              </div>
              
              <p className="text-sm text-foreground font-medium mb-1">
                {alert.message}
              </p>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Valor: {alert.value.toFixed(1)}</span>
                <span>Limite: {alert.threshold}</span>
                <span>
                  {alert.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
