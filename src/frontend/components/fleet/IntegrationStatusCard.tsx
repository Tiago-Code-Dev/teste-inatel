import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Link2, Link2Off, RefreshCw, Settings, 
  Satellite, Wrench, Bell, Fuel, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExternalIntegration, IntegrationStatus } from '@/hooks/useFleetManagement';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IntegrationStatusCardProps {
  integration: ExternalIntegration;
  onTest?: () => void;
  onToggle?: () => void;
  onConfigure?: () => void;
}

const STATUS_CONFIG: Record<IntegrationStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: typeof Link2;
}> = {
  connected: { 
    label: 'Conectado', 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10',
    icon: CheckCircle2
  },
  disconnected: { 
    label: 'Desconectado', 
    color: 'text-gray-500', 
    bgColor: 'bg-gray-500/10',
    icon: Link2Off
  },
  error: { 
    label: 'Erro', 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    icon: AlertCircle
  },
  syncing: { 
    label: 'Sincronizando', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    icon: RefreshCw
  }
};

const TYPE_ICONS = {
  telemetry: Satellite,
  maintenance: Wrench,
  alerts: Bell,
  fuel: Fuel
};

export const IntegrationStatusCard = ({ 
  integration, 
  onTest, 
  onToggle,
  onConfigure 
}: IntegrationStatusCardProps) => {
  const statusConfig = STATUS_CONFIG[integration.status];
  const StatusIcon = statusConfig.icon;
  const TypeIcon = TYPE_ICONS[integration.type];
  
  const lastSync = formatDistanceToNow(new Date(integration.lastSync), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <Card className={cn(
      integration.status === 'error' && 'border-red-500/50',
      integration.status === 'connected' && 'border-emerald-500/30'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2.5 rounded-lg', statusConfig.bgColor)}>
            <TypeIcon className={cn('h-5 w-5', statusConfig.color)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm">{integration.name}</h4>
              <Badge 
                variant={integration.status === 'connected' ? 'secondary' : 'outline'}
                className={cn('text-xs gap-1', statusConfig.color)}
              >
                <StatusIcon className={cn(
                  'h-3 w-3',
                  integration.status === 'syncing' && 'animate-spin'
                )} />
                {statusConfig.label}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {integration.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Última sync: <span className="font-medium">{lastSync}</span>
              </div>
              
              <div className="flex gap-1">
                {onTest && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 px-2"
                    onClick={onTest}
                    disabled={integration.status === 'syncing'}
                  >
                    <RefreshCw className={cn(
                      'h-3 w-3',
                      integration.status === 'syncing' && 'animate-spin'
                    )} />
                  </Button>
                )}
                {onToggle && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      'h-7 px-2',
                      integration.status === 'connected' ? 'text-red-500' : 'text-emerald-500'
                    )}
                    onClick={onToggle}
                  >
                    {integration.status === 'connected' ? (
                      <Link2Off className="h-3 w-3" />
                    ) : (
                      <Link2 className="h-3 w-3" />
                    )}
                  </Button>
                )}
                {onConfigure && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 px-2"
                    onClick={onConfigure}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
