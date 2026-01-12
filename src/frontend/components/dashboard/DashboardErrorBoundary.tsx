import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-status-critical/10 mb-4">
            <AlertTriangle className="w-8 h-8 text-status-critical" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Algo deu errado
          </h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Não foi possível carregar o dashboard. Tente recarregar a página ou entre em contato com o suporte.
          </p>
          <Button onClick={this.handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
          {this.state.error && (
            <pre className="mt-4 p-4 bg-muted rounded-lg text-xs text-muted-foreground max-w-md overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
}

export function DashboardError({ 
  title = 'Erro ao carregar dados',
  message = 'Não foi possível carregar as informações. Verifique sua conexão.',
  error,
  onRetry 
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 card-elevated">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-status-critical/10 mb-3">
        <AlertTriangle className="w-6 h-6 text-status-critical" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      )}
      {error && (
        <p className="mt-3 text-xs text-muted-foreground">
          Detalhes: {error.message}
        </p>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function DashboardEmptyState({ 
  icon,
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
