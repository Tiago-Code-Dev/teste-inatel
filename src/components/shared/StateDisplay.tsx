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

type StateType = 'loading' | 'empty' | 'error' | 'offline' | 'syncing' | 'success';

interface StateDisplayProps {
  state: StateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
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
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      <Icon className={cn('w-12 h-12 mb-4', config.iconClassName)} />
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        {description || config.defaultDescription}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
