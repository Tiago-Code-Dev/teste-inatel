import { MainLayout } from '@/components/layout/MainLayout';
import { AlertCard } from '@/components/shared/AlertCard';
import { alerts } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertSeverity, AlertStatus } from '@/types';

const severityFilters: { value: AlertSeverity | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'critical', label: 'Críticos' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
];

const statusFilters: { value: AlertStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abertos' },
  { value: 'acknowledged', label: 'Reconhecidos' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'resolved', label: 'Resolvidos' },
];

const AlertsPage = () => {
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  // Sort by severity and date
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.openedAt.getTime() - a.openedAt.getTime();
  });

  const openCount = alerts.filter(a => a.status === 'open').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <MainLayout 
      title="Alertas" 
      subtitle={`${openCount} alertas abertos · ${criticalCount} críticos`}
    >
      {/* Summary Stats */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-status-critical/10 border border-status-critical/20 whitespace-nowrap">
          <AlertTriangle className="w-4 h-4 text-status-critical" />
          <span className="text-sm font-medium text-status-critical">{criticalCount} Críticos</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-status-warning/10 border border-status-warning/20 whitespace-nowrap">
          <AlertTriangle className="w-4 h-4 text-status-warning" />
          <span className="text-sm font-medium text-status-warning">
            {alerts.filter(a => a.severity === 'high' || a.severity === 'medium').length} Média/Alta
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {alerts.filter(a => a.status === 'resolved').length} Resolvidos
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Severity Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-sm text-muted-foreground mr-2">Severidade:</span>
          {severityFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={severityFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSeverityFilter(filter.value)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-sm text-muted-foreground mr-2">Status:</span>
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {sortedAlerts.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {sortedAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-status-ok mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Nenhum alerta encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            {severityFilter !== 'all' || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros'
              : 'Todos os sistemas estão operando normalmente'
            }
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default AlertsPage;
