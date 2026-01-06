import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { 
  MachineStatusCard, 
  AlertTriageCard, 
  OccurrenceCard,
  AlertFilters,
  ExportReportModal,
  QuickStatsGrid,
  AlertDetailSheet,
  UserAssignmentModal
} from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';
import { 
  Truck,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  WifiOff,
  RefreshCw,
  Settings,
  Wrench
} from 'lucide-react';
import { subHours, subDays, subMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';

interface Machine {
  id: string;
  name: string;
  model: string;
  unit_id: string;
  status: 'operational' | 'warning' | 'critical' | 'offline';
  last_telemetry_at: string;
}

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
  acknowledged_by: string | null;
  machines: { name: string; model: string } | null;
  tires: { serial: string; position: string | null } | null;
}

interface Occurrence {
  id: string;
  machine_id: string;
  status: 'pending_upload' | 'uploading' | 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  created_at: string;
  is_offline_created: boolean;
  machines: { name: string } | null;
  media_attachments: { id: string; type: 'image' | 'audio' | 'video'; upload_status: string }[];
}

interface Profile {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
}

const OperationalDashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  // Filter state
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<AlertStatus[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  
  // Detail sheet state
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  
  // Assignment modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [alertToAssign, setAlertToAssign] = useState<string | null>(null);

  // Get period date
  const getPeriodDate = (period: string): Date | null => {
    const now = new Date();
    switch (period) {
      case '15m': return subMinutes(now, 15);
      case '1h': return subHours(now, 1);
      case '6h': return subHours(now, 6);
      case '24h': return subHours(now, 24);
      case '7d': return subDays(now, 7);
      default: return null;
    }
  };

  // Fetch machines
  const { data: machines, isLoading: machinesLoading, refetch: refetchMachines } = useQuery({
    queryKey: ['machines-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('status', { ascending: false });
      if (error) throw error;
      return data as Machine[];
    },
    staleTime: 10000,
  });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts-dashboard', selectedPeriod],
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

      const periodDate = getPeriodDate(selectedPeriod);
      if (periodDate) {
        query = query.gte('opened_at', periodDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Alert[];
    },
    staleTime: 5000,
  });

  // Fetch occurrences
  const { data: occurrences, isLoading: occurrencesLoading, refetch: refetchOccurrences } = useQuery({
    queryKey: ['occurrences-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('occurrences')
        .select(`
          *,
          machines (name),
          media_attachments (id, type, upload_status)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Occurrence[];
    },
    staleTime: 10000,
  });

  // Fetch profiles for assignment
  const { data: profiles } = useQuery({
    queryKey: ['profiles-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .order('name');
      if (error) throw error;
      return data as Profile[];
    },
    staleTime: 60000,
  });

  // Acknowledge alert mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('alerts')
        .update({ status: 'acknowledged', updated_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-dashboard'] });
      toast.success('Alerta reconhecido com sucesso');
      setDetailSheetOpen(false);
    },
    onError: () => {
      toast.error('Erro ao reconhecer alerta');
    },
  });

  // Resolve alert mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ alertId, comment }: { alertId: string; comment?: string }) => {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          status: 'resolved', 
          reason: comment || null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-dashboard'] });
      toast.success('Alerta resolvido com sucesso');
      setDetailSheetOpen(false);
    },
    onError: () => {
      toast.error('Erro ao resolver alerta');
    },
  });

  // Assign alert mutation
  const assignMutation = useMutation({
    mutationFn: async ({ alertId, userName }: { alertId: string; userName: string }) => {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          acknowledged_by: userName,
          status: 'acknowledged',
          updated_at: new Date().toISOString() 
        })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-dashboard'] });
      toast.success('Alerta atribuído com sucesso');
      setAssignmentModalOpen(false);
      setAlertToAssign(null);
    },
    onError: () => {
      toast.error('Erro ao atribuir alerta');
    },
  });

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    return alerts.filter(alert => {
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(alert.severity)) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(alert.status)) {
        return false;
      }
      return true;
    });
  }, [alerts, selectedSeverities, selectedStatuses]);

  // Calculate counts
  const counts = useMemo(() => {
    const bySeverity: Record<AlertSeverity, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const byStatus: Record<AlertStatus, number> = { open: 0, acknowledged: 0, in_progress: 0, resolved: 0 };
    
    if (alerts) {
      alerts.forEach(alert => {
        bySeverity[alert.severity]++;
        byStatus[alert.status]++;
      });
    }
    
    return { bySeverity, byStatus };
  }, [alerts]);

  // Sort machines by status
  const sortedMachines = useMemo(() => {
    if (!machines) return [];
    return [...machines].sort((a, b) => {
      const order = { critical: 0, warning: 1, offline: 2, operational: 3 };
      return order[a.status] - order[b.status];
    });
  }, [machines]);

  // Dashboard stats
  const stats = useMemo(() => {
    const operational = machines?.filter(m => m.status === 'operational').length || 0;
    const warning = machines?.filter(m => m.status === 'warning').length || 0;
    const critical = machines?.filter(m => m.status === 'critical').length || 0;
    const offline = machines?.filter(m => m.status === 'offline').length || 0;
    const openAlerts = alerts?.filter(a => a.status === 'open').length || 0;
    const openOccurrences = occurrences?.filter(o => 
      ['open', 'in_progress', 'pending_upload'].includes(o.status)
    ).length || 0;

    return { operational, warning, critical, offline, openAlerts, openOccurrences };
  }, [machines, alerts, occurrences]);

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf'): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (format === 'csv') {
      const headers = ['ID', 'Tipo', 'Severidade', 'Status', 'Mensagem', 'Máquina', 'Data'];
      const rows = filteredAlerts.map(a => [
        a.id,
        a.type,
        a.severity,
        a.status,
        a.message,
        a.machines?.name || '',
        a.opened_at,
      ]);
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-alertas-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
    } else {
      toast.info('Exportação PDF será implementada em breve');
    }
  };

  // Handle filter changes
  const handleSeverityToggle = (severity: AlertSeverity) => {
    setSelectedSeverities(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };

  const handleStatusToggle = (status: AlertStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleClearFilters = () => {
    setSelectedSeverities([]);
    setSelectedStatuses([]);
    setSelectedPeriod('all');
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchMachines();
    refetchAlerts();
    refetchOccurrences();
    toast.success('Dados atualizados');
  };

  // Handle alert detail view
  const handleViewAlertDetails = (alertId: string) => {
    const alert = alerts?.find(a => a.id === alertId);
    if (alert) {
      setSelectedAlert(alert);
      setDetailSheetOpen(true);
    }
  };

  // Handle assignment
  const handleOpenAssignment = (alertId: string) => {
    setAlertToAssign(alertId);
    setAssignmentModalOpen(true);
  };

  const handleAssign = async (userId: string, userName: string) => {
    if (!alertToAssign) return;
    await assignMutation.mutateAsync({ alertId: alertToAssign, userName });
  };

  const isLoading = machinesLoading || alertsLoading || occurrencesLoading;

  if (isLoading && !machines && !alerts) {
    return (
      <MobileLayout title="Painel Operacional" alertCount={stats.openAlerts}>
        <StateDisplay state="loading" className="h-[60vh]" />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      title="Painel Operacional" 
      subtitle={`${sortedMachines.length} máquinas • ${stats.openAlerts} alertas`}
      alertCount={stats.openAlerts}
      showFAB
      fabHref="/occurrences/new"
    >
      <div className="p-4 space-y-6">
        {/* Header Actions */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setExportModalOpen(true)}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <QuickStatsGrid
          columns={2}
          stats={[
            { label: 'Operacionais', value: stats.operational, icon: CheckCircle2, variant: 'success' },
            { label: 'Atenção', value: stats.warning, icon: AlertTriangle, variant: 'warning' },
            { label: 'Críticos', value: stats.critical, icon: XCircle, variant: 'danger' },
            { label: 'Sem Sinal', value: stats.offline, icon: WifiOff, variant: 'default' },
          ]}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Máquinas</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1.5 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
              {stats.openAlerts > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-status-critical text-white">
                  {stats.openAlerts}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="occurrences" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Ocorrências</span>
              {stats.openOccurrences > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                  {stats.openOccurrences}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Machines Tab */}
          <TabsContent value="overview" className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {sortedMachines.length > 0 ? (
                sortedMachines.map((machine, index) => (
                  <motion.div
                    key={machine.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <MachineStatusCard
                      machine={{
                        id: machine.id,
                        name: machine.name,
                        model: machine.model,
                        status: machine.status,
                        lastTelemetryAt: machine.last_telemetry_at,
                      }}
                      alertCount={alerts?.filter(a => a.machine_id === machine.id && a.status === 'open').length}
                      onViewAlerts={() => {
                        setActiveTab('alerts');
                      }}
                    />
                  </motion.div>
                ))
              ) : (
                <StateDisplay
                  state="empty"
                  title="Nenhuma máquina"
                  description="Não há máquinas cadastradas"
                />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-4 space-y-4">
            <AlertFilters
              selectedSeverities={selectedSeverities}
              selectedStatuses={selectedStatuses}
              selectedPeriod={selectedPeriod}
              onSeverityToggle={handleSeverityToggle}
              onStatusToggle={handleStatusToggle}
              onPeriodChange={setSelectedPeriod}
              onClearFilters={handleClearFilters}
              counts={counts}
            />

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <AlertTriageCard
                        alert={{
                          id: alert.id,
                          type: alert.type,
                          severity: alert.severity,
                          status: alert.status,
                          message: alert.message,
                          reason: alert.reason,
                          probable_cause: alert.probable_cause,
                          recommended_action: alert.recommended_action,
                          opened_at: alert.opened_at,
                          machine: alert.machines,
                          tire: alert.tires,
                          assigned_to: alert.acknowledged_by,
                        }}
                        onViewDetails={handleViewAlertDetails}
                        onAssign={handleOpenAssignment}
                        onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
                        onCreateOccurrence={(id) => navigate(`/occurrences/new?alert=${id}`)}
                        loading={acknowledgeMutation.isPending}
                      />
                    </motion.div>
                  ))
                ) : (
                  <StateDisplay
                    state="empty"
                    title="Nenhum alerta"
                    description={selectedSeverities.length > 0 || selectedStatuses.length > 0 
                      ? "Nenhum alerta corresponde aos filtros selecionados"
                      : "Não há alertas no período selecionado"
                    }
                    action={{
                      label: 'Limpar filtros',
                      onClick: handleClearFilters,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Occurrences Tab */}
          <TabsContent value="occurrences" className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {occurrences && occurrences.length > 0 ? (
                occurrences.map((occurrence, index) => (
                  <motion.div
                    key={occurrence.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <OccurrenceCard
                      occurrence={{
                        id: occurrence.id,
                        status: occurrence.status,
                        description: occurrence.description,
                        created_at: occurrence.created_at,
                        machine: occurrence.machines,
                        is_offline_created: occurrence.is_offline_created,
                        media_count: occurrence.media_attachments.length,
                        media_types: occurrence.media_attachments.map(m => m.type),
                      }}
                      onViewDetails={(id) => navigate(`/occurrences/${id}`)}
                    />
                  </motion.div>
                ))
              ) : (
                <StateDisplay
                  state="empty"
                  title="Nenhuma ocorrência"
                  description="Registre uma nova ocorrência quando identificar um problema"
                />
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Modal */}
      <ExportReportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
      />

      {/* Alert Detail Sheet */}
      <AlertDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        alert={selectedAlert ? {
          id: selectedAlert.id,
          type: selectedAlert.type,
          severity: selectedAlert.severity,
          status: selectedAlert.status,
          message: selectedAlert.message,
          reason: selectedAlert.reason,
          probable_cause: selectedAlert.probable_cause,
          recommended_action: selectedAlert.recommended_action,
          opened_at: selectedAlert.opened_at,
          machine: selectedAlert.machines,
          tire: selectedAlert.tires,
          assigned_to: selectedAlert.acknowledged_by,
        } : null}
        onAssign={handleOpenAssignment}
        onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
        onResolve={(id, comment) => resolveMutation.mutate({ alertId: id, comment })}
        onCreateOccurrence={(id) => {
          setDetailSheetOpen(false);
          navigate(`/occurrences/new?alert=${id}`);
        }}
        loading={acknowledgeMutation.isPending || resolveMutation.isPending}
      />

      {/* User Assignment Modal */}
      <UserAssignmentModal
        open={assignmentModalOpen}
        onOpenChange={setAssignmentModalOpen}
        onAssign={handleAssign}
        users={profiles?.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email || undefined,
          avatar_url: p.avatar_url || undefined,
        })) || []}
        loading={assignMutation.isPending}
      />
    </MobileLayout>
  );
};

export default OperationalDashboardPage;
