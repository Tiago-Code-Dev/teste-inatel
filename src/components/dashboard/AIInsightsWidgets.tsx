import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Clock,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AIInsightsWidgetProps {
  insight: string | null;
  timestamp: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
}

export function AIInsightsWidget({
  insight,
  timestamp,
  isLoading,
  onRefresh,
  className,
}: AIInsightsWidgetProps) {
  const timeAgo = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
        'backdrop-blur-xl border border-primary/20',
        'shadow-lg shadow-primary/5',
        className
      )}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20"
              animate={isLoading ? { rotate: 360 } : undefined}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Brain className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Análise Inteligente
                <Sparkles className="w-4 h-4 text-primary" />
              </h3>
              {timeAgo && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Analisando dados da frota...</p>
            </motion.div>
          ) : insight ? (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Clique em atualizar para gerar análise
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Prediction Card
interface PredictionItem {
  machine: string;
  risk: string;
  days: number;
  confidence: 'alta' | 'média' | 'baixa';
  reason: string;
}

interface PredictionsCardProps {
  predictions: PredictionItem[];
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
}

export function PredictionsCard({
  predictions,
  isLoading,
  onRefresh,
  className,
}: PredictionsCardProps) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'alta': return 'text-status-critical bg-status-critical/10';
      case 'média': return 'text-status-warning bg-status-warning/10';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn(
        'rounded-2xl p-5',
        'bg-gradient-to-br from-card/80 to-card/40',
        'backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-warning/20">
            <TrendingUp className="w-5 h-5 text-status-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Previsão de Manutenção</h3>
            <p className="text-xs text-muted-foreground">Análise preditiva</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[0, 1].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </motion.div>
        ) : predictions.length > 0 ? (
          <motion.div
            key="predictions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {predictions.map((pred, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-status-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{pred.machine}</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      getConfidenceColor(pred.confidence)
                    )}>
                      {pred.confidence}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{pred.reason}</p>
                  <p className="text-xs text-primary mt-1">
                    Estimado em {pred.days} dias
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-status-ok/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma manutenção prevista
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Anomaly Card
interface AnomalyItem {
  machine: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
}

interface AnomaliesCardProps {
  anomalies: AnomalyItem[];
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
}

export function AnomaliesCard({
  anomalies,
  isLoading,
  onRefresh,
  className,
}: AnomaliesCardProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return {
        border: 'border-status-critical/30',
        bg: 'bg-status-critical/10',
        text: 'text-status-critical',
      };
      case 'warning': return {
        border: 'border-status-warning/30',
        bg: 'bg-status-warning/10',
        text: 'text-status-warning',
      };
      default: return {
        border: 'border-primary/20',
        bg: 'bg-primary/10',
        text: 'text-primary',
      };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        'rounded-2xl p-5',
        'bg-gradient-to-br from-card/80 to-card/40',
        'backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-critical/20">
            <AlertTriangle className="w-5 h-5 text-status-critical" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Detecção de Anomalias</h3>
            <p className="text-xs text-muted-foreground">Padrões incomuns</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[0, 1].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </motion.div>
        ) : anomalies.length > 0 ? (
          <motion.div
            key="anomalies"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {anomalies.map((anomaly, index) => {
              const styles = getSeverityStyles(anomaly.severity);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'p-3 rounded-xl border',
                    styles.border,
                    styles.bg
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('font-medium text-sm', styles.text)}>
                      {anomaly.machine}
                    </span>
                    <span className="text-xs uppercase tracking-wide opacity-70">
                      {anomaly.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-status-ok/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-status-ok" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma anomalia detectada
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Recommendations Card
interface RecommendationItem {
  action: string;
  impact: string;
  priority: 'alta' | 'média' | 'baixa';
  category: string;
}

interface RecommendationsCardProps {
  recommendations: RecommendationItem[];
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
}

export function RecommendationsCard({
  recommendations,
  isLoading,
  onRefresh,
  className,
}: RecommendationsCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-status-critical text-white';
      case 'média': return 'bg-status-warning text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'manutenção': return '🔧';
      case 'operação': return '⚙️';
      case 'segurança': return '🛡️';
      case 'custo': return '💰';
      default: return '💡';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn(
        'rounded-2xl p-5',
        'bg-gradient-to-br from-card/80 to-card/40',
        'backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-ok/20">
            <Lightbulb className="w-5 h-5 text-status-ok" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Recomendações</h3>
            <p className="text-xs text-muted-foreground">Ações sugeridas</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </motion.div>
        ) : recommendations.length > 0 ? (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="text-lg">{getCategoryIcon(rec.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{rec.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{rec.impact}</p>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full shrink-0',
                  getPriorityColor(rec.priority)
                )}>
                  {rec.priority}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Clique em atualizar para sugestões
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
