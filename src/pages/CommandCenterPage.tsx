import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { CommandCenterSkeleton } from '@/components/shared/PageSkeletons';
import { 
  OccurrenceCard,
  AlertDetailSheet,
  UserAssignmentModal
} from '@/components/dashboard';
import { QuickStat } from '@/components/dashboard/QuickStats';
import { 
  FiltersBottomSheet,
  ActiveFiltersChips,
  LastUpdatedIndicator,
  ResolveAlertModal,
  getSlaStatus,
  SwipeableAlertCard,
  TeamPresence,
  LiveActivityFeed,
  CommandStats,
  SlaCountdown
} from '@/components/command-center';
import type { ActivityItem } from '@/components/command-center';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { useRealtimeMachines } from '@/hooks/useRealtimeMachines';
import { useRealtimeOccurrences } from '@/hooks/useRealtimeOccurrences';
import { toast } from 'sonner';
import { 
  AlertTriangle,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  UserX,
  AlertCircle,
  Search,
  History,
  Target,
  Users
} from 'lucide-react';
import { subHours, subDays, subMinutes, addHours } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';
type OccurrenceStatus = 'open' | 'in_progress' | 'paused' | 'closed';
type SlaFilter = 'all' | 'expired' | 'warning' | 'ok';

interface FiltersState {
  severities: AlertSeverity[];
  alertStatuses: AlertStatus[];
  occurrenceStatuses: OccurrenceStatus[];
  period: string;
  assignee: string;
  sla: SlaFilter;
  machineId: string;
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
  updated_at: string;
  acknowledged_by: string | null;
  machines: { name: string; model: string } | null;
  tires: { serial: string; position: string | null } | null;
  sla_due_at?: string | null;
}

interface Occurrence {
  id: string;
  machine_id: string;
  status: 'pending_upload' | 'uploading' | 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  created_at: string;
  updated_at: string;
  is_offline_created: boolean;
  machines: { name: string } | null;
  media_attachments: { id: string; type: 'image' | 'audio' | 'video'; upload_status: string }[];
  sla_due_at?: string | null;
}

interface Profile {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
}

const defaultFilters: FiltersState = {
  severities: [],
  alertStatuses: [],
  occurrenceStatuses: [],
  period: '24h',
  assignee: 'all',
  sla: 'all',
  machineId: 'all',
};

const CommandCenterPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  // Real-time subscriptions
  useRealtimeAlerts();
  useRealtimeMachines();
  useRealtimeOccurrences();

  // State
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [activeTab, setActiveTab] = useState('alerts');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Detail sheet state
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  
  // Assignment modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [alertToAssign, setAlertToAssign] = useState<string | null>(null);
  
  // Resolve modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState<Alert | null>(null);

  // Activity feed (mock - in real app would come from audit_events table)
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Get period date
  const getPeriodDate = useCallback((period: string): Date | null => {
    const now = new Date();
    switch (period) {
      case '15m': return subMinutes(now, 15);
      case '1h': return subHours(now, 1);
      case '6h': return subHours(now, 6);
      case '24h': return subHours(now, 24);
      case '7d': return subDays(now, 7);
      default: return null;
    }
  }, []);

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['command-center-alerts', filters.period],
    queryFn: async () => {
      let query = supabase
        .from('alerts')
        .select(`
          *,
          machines (name, model),
          tires (serial, position)
        `)
        .order('opened_at', { ascending: false });

      const periodDate = getPeriodDate(filters.period);
      if (periodDate) {
        query = query.gte('opened_at', periodDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Add mock SLA for demo
      return (data as Alert[]).map(alert => ({
        ...alert,
        sla_due_at: alert.status !== 'resolved' 
          ? addHours(new Date(alert.opened_at), alert.severity === 'critical' ? 1 : 4).toISOString()
          : null,
      }));
    },
    staleTime: 5000,
  });

  // Fetch occurrences
  const { data: occurrences, isLoading: occurrencesLoading, refetch: refetchOccurrences } = useQuery({
    queryKey: ['command-center-occurrences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('occurrences')
        .select(`
          *,
          machines (name),
          media_attachments (id, type, upload_status)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      
      // Add mock SLA for demo
      return (data as Occurrence[]).map(occ => ({
        ...occ,
        sla_due_at: !['closed', 'resolved'].includes(occ.status)
          ? addHours(new Date(occ.created_at), 8).toISOString()
          : null,
      }));
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

  // Fetch machines for filters
  const { data: machines } = useQuery({
    queryKey: ['machines-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
    staleTime: 60000,
  });

  // Update lastUpdated when data changes
  useEffect(() => {
    if (alerts || occurrences) {
      setLastUpdated(new Date());
    }
  }, [alerts, occurrences]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isOnline]);

  // Add activity helper
  const addActivity = useCallback((item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...item,
      id: `activity-${Date.now()}`,
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  }, []);

  // Acknowledge alert mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('alerts')
        .update({ status: 'acknowledged', updated_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) throw error;
    },
    onMutate: async (alertId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['command-center-alerts'] });
      const previousAlerts = queryClient.getQueryData(['command-center-alerts', filters.period]);
      
      queryClient.setQueryData(['command-center-alerts', filters.period], (old: Alert[] | undefined) =>
        old?.map(a => a.id === alertId ? { ...a, status: 'acknowledged' as AlertStatus } : a)
      );
      
      return { previousAlerts };
    },
    onSuccess: (_, alertId) => {
      const alert = alerts?.find(a => a.id === alertId);
      addActivity({
        type: 'alert_acknowledged',
        actorName: 'Você',
        targetId: alertId,
        targetType: 'alert',
        targetLabel: alert?.message?.substring(0, 30) || alertId.substring(0, 8),
      });
      toast.success('Alerta reconhecido');
      setDetailSheetOpen(false);
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['command-center-alerts', filters.period], context?.previousAlerts);
      toast.error('Erro ao reconhecer alerta');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['command-center-alerts'] });
    },
  });

  // Resolve alert mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ alertId, note }: { alertId: string; note: string }) => {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          status: 'resolved', 
          reason: note,
          updated_at: new Date().toISOString() 
        })
        .eq('id', alertId);
      if (error) throw error;
    },
    onMutate: async ({ alertId }) => {
      await queryClient.cancelQueries({ queryKey: ['command-center-alerts'] });
      const previousAlerts = queryClient.getQueryData(['command-center-alerts', filters.period]);
      
      queryClient.setQueryData(['command-center-alerts', filters.period], (old: Alert[] | undefined) =>
        old?.map(a => a.id === alertId ? { ...a, status: 'resolved' as AlertStatus } : a)
      );
      
      return { previousAlerts };
    },
    onSuccess: (_, { alertId, note }) => {
      const alert = alerts?.find(a => a.id === alertId);
      addActivity({
        type: 'alert_resolved',
        actorName: 'Você',
        targetId: alertId,
        targetType: 'alert',
        targetLabel: alert?.message?.substring(0, 30) || alertId.substring(0, 8),
        metadata: { comment: note },
      });
      toast.success('Alerta resolvido com sucesso');
      setResolveModalOpen(false);
      setAlertToResolve(null);
      setDetailSheetOpen(false);
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['command-center-alerts', filters.period], context?.previousAlerts);
      toast.error('Erro ao resolver alerta');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['command-center-alerts'] });
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
    onSuccess: (_, { alertId, userName }) => {
      const alert = alerts?.find(a => a.id === alertId);
      addActivity({
        type: 'alert_assigned',
        actorName: 'Você',
        targetId: alertId,
        targetType: 'alert',
        targetLabel: alert?.message?.substring(0, 30) || alertId.substring(0, 8),
        metadata: { assignedTo: userName },
      });
      queryClient.invalidateQueries({ queryKey: ['command-center-alerts'] });
      toast.success(`Alerta atribuído para ${userName}`);
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
      // Severity filter
      if (filters.severities.length > 0 && !filters.severities.includes(alert.severity)) {
        return false;
      }
      // Status filter
      if (filters.alertStatuses.length > 0 && !filters.alertStatuses.includes(alert.status)) {
        return false;
      }
      // SLA filter
      if (filters.sla !== 'all') {
        const slaStatus = getSlaStatus(alert.sla_due_at);
        if (filters.sla !== slaStatus) return false;
      }
      // Assignee filter
      if (filters.assignee === 'unassigned' && alert.acknowledged_by) {
        return false;
      }
      // Machine filter
      if (filters.machineId !== 'all' && alert.machine_id !== filters.machineId) {
        return false;
      }
      // Search
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        if (
          !alert.message.toLowerCase().includes(search) &&
          !alert.machines?.name.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, filters, searchQuery]);

  // Sort alerts by priority
  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      // Priority: Critical unassigned > Critical SLA expiring > High unassigned > In progress > Recent
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      
      // Unassigned critical first
      if (a.severity === 'critical' && !a.acknowledged_by && !(b.severity === 'critical' && !b.acknowledged_by)) {
        return -1;
      }
      if (b.severity === 'critical' && !b.acknowledged_by && !(a.severity === 'critical' && !a.acknowledged_by)) {
        return 1;
      }
      
      // Then by SLA status
      const aSla = getSlaStatus(a.sla_due_at);
      const bSla = getSlaStatus(b.sla_due_at);
      const slaOrder = { expired: 0, warning: 1, ok: 2 };
      if (slaOrder[aSla] !== slaOrder[bSla]) {
        return slaOrder[aSla] - slaOrder[bSla];
      }
      
      // Then by severity
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      
      // Then by date
      return new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime();
    });
  }, [filteredAlerts]);

  // Filter occurrences
  const filteredOccurrences = useMemo(() => {
    if (!occurrences) return [];
    
    return occurrences.filter(occ => {
      // Status filter
      if (filters.occurrenceStatuses.length > 0) {
        const mappedStatus = occ.status === 'resolved' ? 'closed' : occ.status;
        if (!filters.occurrenceStatuses.includes(mappedStatus as OccurrenceStatus)) {
          return false;
        }
      }
      // Machine filter
      if (filters.machineId !== 'all' && occ.machine_id !== filters.machineId) {
        return false;
      }
      // Search
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        if (
          !occ.description.toLowerCase().includes(search) &&
          !occ.machines?.name.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [occurrences, filters, searchQuery]);

  // Calculate counts
  const counts = useMemo(() => {
    const bySeverity: Record<AlertSeverity, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const byAlertStatus: Record<AlertStatus, number> = { open: 0, acknowledged: 0, in_progress: 0, resolved: 0 };
    const byOccurrenceStatus: Record<OccurrenceStatus, number> = { open: 0, in_progress: 0, paused: 0, closed: 0 };
    
    if (alerts) {
      alerts.forEach(alert => {
        bySeverity[alert.severity]++;
        byAlertStatus[alert.status]++;
      });
    }
    
    if (occurrences) {
      occurrences.forEach(occ => {
        const status = occ.status === 'resolved' ? 'closed' : occ.status;
        if (status in byOccurrenceStatus) {
          byOccurrenceStatus[status as OccurrenceStatus]++;
        }
      });
    }
    
    return { bySeverity, byAlertStatus, byOccurrenceStatus };
  }, [alerts, occurrences]);

  // Stats
  const stats = useMemo(() => {
    const critical = alerts?.filter(a => a.severity === 'critical' && a.status !== 'resolved').length || 0;
    const inProgress = alerts?.filter(a => a.status === 'in_progress').length || 0;
    const unassigned = alerts?.filter(a => !a.acknowledged_by && a.status === 'open').length || 0;
    const slaExpiring = alerts?.filter(a => getSlaStatus(a.sla_due_at) === 'warning').length || 0;
    const resolvedToday = alerts?.filter(a => {
      if (a.status !== 'resolved') return false;
      const today = new Date();
      const resolved = new Date(a.updated_at);
      return resolved.toDateString() === today.toDateString();
    }).length || 0;

    return { critical, inProgress, unassigned, slaExpiring, resolvedToday };
  }, [alerts]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      await Promise.all([refetchAlerts(), refetchOccurrences()]);
      setLastUpdated(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [refetchAlerts, refetchOccurrences]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  const handleRemoveFilter = (type: string, value?: string) => {
    setFilters(prev => {
      const updated = { ...prev };
      switch (type) {
        case 'severity':
          updated.severities = prev.severities.filter(s => s !== value);
          break;
        case 'alertStatus':
          updated.alertStatuses = prev.alertStatuses.filter(s => s !== value);
          break;
        case 'occurrenceStatus':
          updated.occurrenceStatuses = prev.occurrenceStatuses.filter(s => s !== value);
          break;
        case 'period':
          updated.period = 'all';
          break;
        case 'sla':
          updated.sla = 'all';
          break;
        case 'assignee':
          updated.assignee = 'all';
          break;
      }
      return updated;
    });
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
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

  // Handle resolve
  const handleOpenResolve = (alertId: string) => {
    const alert = alerts?.find(a => a.id === alertId);
    if (alert) {
      setAlertToResolve(alert);
      setResolveModalOpen(true);
    }
  };

  const handleResolve = async (note: string) => {
    if (!alertToResolve) return;
    await resolveMutation.mutateAsync({ alertId: alertToResolve.id, note });
  };

  // Handle create occurrence
  const handleCreateOccurrence = (alertId: string) => {
    navigate(`/occurrences/new?alertId=${alertId}`);
  };

  const isLoading = alertsLoading || occurrencesLoading;

  if (isLoading && !alerts && !occurrences) {
    return (
      <MainLayout title="Centro de Operações" subtitle="Carregando...">
        <div className="p-4">
          <CommandCenterSkeleton />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Centro de Operações" 
      subtitle={`${stats.critical} críticos • ${filteredAlerts.length} alertas • ${filteredOccurrences.filter(o => !['closed', 'resolved'].includes(o.status)).length} ocorrências`}
    >
      <div className="p-4 space-y-4 pb-20 lg:pb-6">
        {/* Header with Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alertas e ocorrências..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <FiltersBottomSheet
            filters={filters}
            onFiltersChange={handleFiltersChange}
            assignees={profiles?.map(p => ({ id: p.id, name: p.name })) || []}
            machines={machines || []}
            counts={counts}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => toast.info('Exportação será implementada em breve')}
          >
            <Download className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Last Updated & Active Filters */}
        <div className="flex items-center justify-between">
          <LastUpdatedIndicator
            lastUpdated={lastUpdated}
            isOnline={isOnline}
            isSyncing={isSyncing}
            onRefresh={handleRefresh}
          />
        </div>

        <ActiveFiltersChips
          filters={filters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearFilters}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <QuickStat
            label="Críticos"
            value={stats.critical}
            icon={AlertCircle}
            variant="danger"
            onClick={() => setFilters(prev => ({ ...prev, severities: ['critical'] }))}
          />
          <QuickStat
            label="Em andamento"
            value={stats.inProgress}
            icon={Target}
            variant="info"
            onClick={() => setFilters(prev => ({ ...prev, alertStatuses: ['in_progress'] }))}
          />
          <QuickStat
            label="Sem responsável"
            value={stats.unassigned}
            icon={UserX}
            variant="warning"
            onClick={() => setFilters(prev => ({ ...prev, assignee: 'unassigned' }))}
          />
          <QuickStat
            label="SLA Vencendo"
            value={stats.slaExpiring}
            icon={Clock}
            variant={stats.slaExpiring > 0 ? 'warning' : 'default'}
            onClick={() => setFilters(prev => ({ ...prev, sla: 'warning' }))}
          />
          <QuickStat
            label="Resolvidos hoje"
            value={stats.resolvedToday}
            icon={CheckCircle2}
            variant="success"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Alerts & Occurrences Queue */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10">
                <TabsTrigger value="alerts" className="gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas
                  {sortedAlerts.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-status-critical text-white">
                      {sortedAlerts.filter(a => a.status !== 'resolved').length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="occurrences" className="gap-1.5">
                  <FileText className="w-4 h-4" />
                  Ocorrências
                  {filteredOccurrences.filter(o => !['closed', 'resolved'].includes(o.status)).length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                      {filteredOccurrences.filter(o => !['closed', 'resolved'].includes(o.status)).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Alerts Tab */}
              <TabsContent value="alerts" className="mt-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {sortedAlerts.length > 0 ? (
                    sortedAlerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100, scale: 0.9 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <SwipeableAlertCard
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
                            sla_due_at: alert.sla_due_at,
                          }}
                          onViewDetails={handleViewAlertDetails}
                          onAssign={handleOpenAssignment}
                          onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
                          onResolve={handleOpenResolve}
                          onEscalate={(id) => {
                            toast.info('Alerta escalado para supervisão');
                          }}
                          loading={acknowledgeMutation.isPending || resolveMutation.isPending}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <StateDisplay
                      state="empty"
                      title="Nenhum alerta encontrado 🎉"
                      description={
                        filters.severities.length > 0 || filters.alertStatuses.length > 0
                          ? 'Tente ajustar os filtros'
                          : 'Todos os sistemas operando normalmente'
                      }
                      className="py-16"
                    />
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Occurrences Tab */}
              <TabsContent value="occurrences" className="mt-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredOccurrences.length > 0 ? (
                    filteredOccurrences.map((occurrence, index) => (
                      <motion.div
                        key={occurrence.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <OccurrenceCard
                          occurrence={{
                            id: occurrence.id,
                            status: occurrence.status,
                            description: occurrence.description,
                            created_at: occurrence.created_at,
                            machine: occurrence.machines,
                            is_offline_created: occurrence.is_offline_created,
                            media_count: occurrence.media_attachments?.length || 0,
                            media_types: occurrence.media_attachments?.map(m => m.type) || [],
                          }}
                          onViewDetails={(id) => navigate(`/occurrences/${id}`)}
                          onAssign={(id) => toast.info('Atribuição de ocorrência em breve')}
                          onClose={(id) => toast.info('Fechamento de ocorrência em breve')}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <StateDisplay
                      state="empty"
                      title="Nenhuma ocorrência encontrada"
                      description={
                        filters.occurrenceStatuses.length > 0
                          ? 'Tente ajustar os filtros'
                          : 'Crie uma nova ocorrência para começar'
                      }
                      action={{
                        label: 'Nova Ocorrência',
                        onClick: () => navigate('/occurrences/new'),
                      }}
                      className="py-16"
                    />
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Activity Feed & Team Presence */}
          <div className="hidden lg:flex lg:flex-col gap-4">
            {/* Team Presence */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4" />
                  Equipe Online
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <TeamPresence maxVisible={5} />
              </CardContent>
            </Card>

            {/* Live Activity Feed */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="w-4 h-4" />
                  Atividade em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <LiveActivityFeed activities={activities} />
              </CardContent>
            </Card>

            {/* SLA Countdown for most urgent */}
            {sortedAlerts.length > 0 && sortedAlerts[0].sla_due_at && getSlaStatus(sortedAlerts[0].sla_due_at) !== 'ok' && (
              <Card className="border-status-warning/50 bg-status-warning/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-status-warning" />
                    Próximo SLA Vencendo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {sortedAlerts[0].message}
                  </p>
                  <SlaCountdown
                    dueAt={sortedAlerts[0].sla_due_at}
                    onExpire={() => toast.error('SLA expirado!')}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

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
        onResolve={(id, comment) => resolveMutation.mutate({ alertId: id, note: comment })}
        onCreateOccurrence={handleCreateOccurrence}
        loading={acknowledgeMutation.isPending || resolveMutation.isPending}
      />

      {/* Assignment Modal */}
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

      {/* Resolve Modal */}
      <ResolveAlertModal
        open={resolveModalOpen}
        onOpenChange={setResolveModalOpen}
        onConfirm={handleResolve}
        alertMessage={alertToResolve?.message}
        loading={resolveMutation.isPending}
      />
    </MainLayout>
  );
};

export default CommandCenterPage;
