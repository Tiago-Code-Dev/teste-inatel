import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  AlertTriangle, 
  WifiOff, 
  RefreshCw,
  Inbox,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type StateType = 'loading' | 'empty' | 'error' | 'offline' | 'syncing' | 'success';

interface StateDisplayProps {
  state: StateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  className?: string;
}

const stateConfig: Record<StateType, {
  icon: typeof Loader2;
  defaultTitle: string;
  defaultDescription: string;
  iconClassName: string;
}> = {
  loading: {
    icon: Loader2,
    defaultTitle: 'Carregando...',
    defaultDescription: 'Aguarde enquanto buscamos os dados',
    iconClassName: 'text-primary animate-spin',
  },
  empty: {
    icon: Inbox,
    defaultTitle: 'Nenhum resultado',
    defaultDescription: 'Não há dados para exibir',
    iconClassName: 'text-muted-foreground',
  },
  error: {
    icon: AlertTriangle,
    defaultTitle: 'Erro ao carregar',
    defaultDescription: 'Ocorreu um problema ao buscar os dados',
    iconClassName: 'text-status-critical',
  },
  offline: {
    icon: WifiOff,
    defaultTitle: 'Sem conexão',
    defaultDescription: 'Verifique sua conexão com a internet',
    iconClassName: 'text-status-offline',
  },
  syncing: {
    icon: RefreshCw,
    defaultTitle: 'Sincronizando...',
    defaultDescription: 'Enviando dados para o servidor',
    iconClassName: 'text-primary animate-spin',
  },
  success: {
    icon: CheckCircle2,
    defaultTitle: 'Concluído!',
    defaultDescription: 'Operação realizada com sucesso',
    iconClassName: 'text-status-ok',
  },
};

export function StateDisplay({ 
  state, 
  title, 
  description, 
  action, 
  className 
}: StateDisplayProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={state}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center',
          className
        )}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <Icon className={cn('w-12 h-12 mb-4', config.iconClassName)} />
        </motion.div>
        <motion.h3 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-lg font-semibold text-foreground mb-1"
        >
          {title || config.defaultTitle}
        </motion.h3>
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground mb-4 max-w-xs"
        >
          {description || config.defaultDescription}
        </motion.p>
        {action && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Button 
              onClick={action.onClick} 
              variant="outline" 
              className="gap-2"
              loading={action.loading}
            >
              {!action.loading && <RefreshCw className="w-4 h-4" />}
              {action.label}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
