import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { SeverityBadge } from '@/components/shared/StatusBadge';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Clock,
  Truck,
  ChevronRight,
  Filter,
  FileText,
  CheckCircle2,
  CircleDot
} from 'lucide-react';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';

interface Alert {
  id: string;
  machine_id: string;
  tire_id: string | null;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  reason: string | null;
  probable_cause: string | null;
  recommended_action: string | null;
  opened_at: string;
  machines: {
    name: string;
    model: string;
  };
  tires: {
    serial: string;
    position: string;
  } | null;
}

const statusConfig: Record<AlertStatus, { label: string; className: string }> = {
  open: { label: 'Aberto', className: 'bg-status-critical/15 text-status-critical' },
  acknowledged: { label: 'Reconhecido', className: 'bg-status-warning/15 text-status-warning' },
  in_progress: { label: 'Em andamento', className: 'bg-blue-500/15 text-blue-500' },
  resolved: { label: 'Resolvido', className: 'bg-status-ok/15 text-status-ok' },
};

const MobileAlertsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<AlertStatus | 'all'>('all');

  const { data: alerts, isLoading, error, refetch } = useQuery({
    queryKey: ['alerts', filter],
    queryFn: async () => {
      let query = supabase
        .from('alerts')
        .select(`
          *,
          machines (name, model),
          tires (serial, position)
        `)
        .order('severity', { ascending: false })
        .order('opened_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      } else {
        query = query.in('status', ['open', 'acknowledged', 'in_progress']);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Alert[];
    },
  });

  const openCount = alerts?.filter(a => a.status === 'open').length || 0;

  if (isLoading) {
    return (
      <MainLayout title="Alertas" subtitle="Carregando...">
        <StateDisplay state="loading" className="h-[60vh]" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Alertas">
        <StateDisplay 
          state="error" 
          className="h-[60vh]"
          action={{ label: 'Tentar novamente', onClick: () => refetch() }}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Alertas" 
      subtitle={`${openCount} alertas em aberto`}
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'open', label: 'Abertos' },
            { key: 'acknowledged', label: 'Reconhecidos' },
            { key: 'in_progress', label: 'Em andamento' },
          ].map((item) => (
            <Button
              key={item.key}
              variant={filter === item.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(item.key as AlertStatus | 'all')}
              className="shrink-0"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Alerts List */}
        {alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const timeAgo = formatDistanceToNow(new Date(alert.opened_at), {
                addSuffix: true,
                locale: ptBR,
              });

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'card-interactive p-4',
                    alert.severity === 'critical' && 'border-status-critical/50 pulse-critical'
                  )}
                  onClick={() => navigate(`/alerts/${alert.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg',
                        alert.severity === 'critical' && 'bg-status-critical/15',
                        alert.severity === 'high' && 'bg-orange-500/15',
                        alert.severity === 'medium' && 'bg-status-warning/15',
                        alert.severity === 'low' && 'bg-muted'
                      )}>
                        <AlertTriangle className={cn(
                          'w-5 h-5',
                          alert.severity === 'critical' && 'text-status-critical',
                          alert.severity === 'high' && 'text-orange-500',
                          alert.severity === 'medium' && 'text-status-warning',
                          alert.severity === 'low' && 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground line-clamp-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo}
                        </p>
                      </div>
                    </div>
                    <SeverityBadge severity={alert.severity} showLabel={false} size="sm" />
                  </div>

                  {/* Cause & Action */}
                  {alert.probable_cause && (
                    <div className="mb-3 p-2 rounded-lg bg-muted/50 text-sm">
                      <p className="text-xs text-muted-foreground mb-0.5">Causa provável:</p>
                      <p className="text-foreground line-clamp-2">{alert.probable_cause}</p>
                    </div>
                  )}

                  {alert.recommended_action && (
                    <div className="mb-3 p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                      <p className="text-xs text-primary mb-0.5">Ação recomendada:</p>
                      <p className="text-foreground line-clamp-2">{alert.recommended_action}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        {alert.machines?.name}
                      </span>
                      {alert.tires && (
                        <span className="flex items-center gap-1">
                          <CircleDot className="w-3.5 h-3.5" />
                          {alert.tires.position}
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 h-8">
                      <FileText className="w-3.5 h-3.5" />
                      Ocorrência
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <StateDisplay
            state="empty"
            title="Nenhum alerta"
            description={filter === 'all' 
              ? 'Não há alertas ativos no momento'
              : `Não há alertas ${statusConfig[filter as AlertStatus]?.label.toLowerCase()}`
            }
            action={{
              label: 'Ver todos',
              onClick: () => setFilter('all'),
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default MobileAlertsPage;
