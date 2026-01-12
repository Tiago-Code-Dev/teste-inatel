import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  TimelineContainer, 
  TimeRangeSelector, 
  EventTypeFilter, 
  ExportButton,
  EventDetailSheet
} from '@/components/timeline';
import { useTireTimeline } from '@/hooks/useTireTimeline';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { 
  CircleDot, 
  ArrowLeft, 
  Gauge, 
  Truck,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { TimelineEvent } from '@/types';

const lifecycleLabels: Record<string, { label: string; className: string }> = {
  new: { label: 'Novo', className: 'bg-status-ok/15 text-status-ok' },
  in_use: { label: 'Em uso', className: 'bg-primary/15 text-primary' },
  maintenance: { label: 'Manutenção', className: 'bg-status-warning/15 text-status-warning' },
  retired: { label: 'Descartado', className: 'bg-muted text-muted-foreground' },
};

export default function TireHistoryPage() {
  const { id: tireId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);

  // Fetch tire details
  const { data: tire, isLoading: tireLoading, error: tireError } = useQuery({
    queryKey: ['tire', tireId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tires')
        .select('*, machines(id, name, model)')
        .eq('id', tireId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!tireId,
  });

  // Use timeline hook
  const {
    filteredEvents,
    isLoading: timelineLoading,
    error: timelineError,
    isOffline,
    timeRange,
    customRange,
    eventTypeFilter,
    eventCounts,
    setTimeRange,
    setEventTypeFilter,
    refetch,
    isRefetching,
  } = useTireTimeline({ tireId: tireId || '' });

  const handleBack = () => navigate(-1);

  const handleEventClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  }, []);

  const handleCreateOccurrence = useCallback((event: TimelineEvent) => {
    const alertId = event.id.startsWith('alert-') ? event.id.replace('alert-', '') : undefined;
    navigate(`/occurrences/new?tireId=${tireId}&alertId=${alertId}`);
  }, [navigate, tireId]);

  if (tireLoading) {
    return (
      <MainLayout title="Carregando...">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (tireError || !tire) {
    return (
      <MainLayout title="Erro">
        <StateDisplay
          state="error"
          title="Pneu não encontrado"
          description="O pneu solicitado não existe ou você não tem permissão para acessá-lo."
          action={{ label: 'Voltar', onClick: handleBack }}
        />
      </MainLayout>
    );
  }

  const lifecycle = lifecycleLabels[tire.lifecycle_status] || lifecycleLabels.in_use;
  const isLowPressure = tire.current_pressure && tire.current_pressure < tire.recommended_pressure * 0.85;

  // Tire info card component
  const TireInfoCard = () => (
    <Card className={cn(
      'p-5',
      isLowPressure && 'border-status-critical/50'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            isLowPressure ? 'bg-status-critical/10' : 'bg-primary/10'
          )}>
            <CircleDot className={cn(
              'w-6 h-6',
              isLowPressure ? 'text-status-critical' : 'text-primary'
            )} />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">{tire.serial}</h2>
            <p className="text-sm text-muted-foreground">{tire.position || 'Posição não definida'}</p>
          </div>
        </div>
        <Badge className={cn('font-medium', lifecycle.className)}>
          {lifecycle.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pressure */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Gauge className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Pressão atual</p>
            <p className={cn(
              'font-semibold',
              isLowPressure ? 'text-status-critical' : 'text-foreground'
            )}>
              {tire.current_pressure?.toFixed(1) || '--'} / {tire.recommended_pressure} PSI
            </p>
          </div>
        </div>

        {/* Machine */}
        {tire.machines && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Truck className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Máquina</p>
              <p className="font-semibold text-foreground truncate">
                {(tire.machines as { name: string }).name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Install date */}
      {tire.installed_at && (
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Instalado em {format(new Date(tire.installed_at), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      )}
    </Card>
  );

  // Filters section
  const FiltersSection = ({ className }: { className?: string }) => (
    <div className={cn('space-y-4', className)}>
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        customRange={customRange}
      />
      <EventTypeFilter
        selected={eventTypeFilter}
        onChange={setEventTypeFilter}
        eventCounts={eventCounts}
      />
    </div>
  );

  // Actions bar
  const ActionsBar = () => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refetch}
          disabled={timelineLoading || isRefetching}
        >
          <RefreshCw className={cn('w-4 h-4', (timelineLoading || isRefetching) && 'animate-spin')} />
        </Button>
      </div>
      <ExportButton 
        events={filteredEvents} 
        tireSerial={tire.serial}
        disabled={filteredEvents.length === 0}
      />
    </div>
  );

  // Desktop/Web Layout
  return (
    <MainLayout 
      title={`Histórico do Pneu`}
      subtitle={tire.serial}
    >
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Column - Tire Info & Filters */}
        <div className="space-y-4">
          <TireInfoCard />
          
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Filtros</h3>
            <FiltersSection />
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Linha do Tempo</h3>
              <ActionsBar />
            </div>

            <TimelineContainer
              events={filteredEvents}
              isLoading={timelineLoading}
              isEmpty={filteredEvents.length === 0}
              isOffline={isOffline}
              error={timelineError}
              onRetry={refetch}
              onEventClick={handleEventClick}
              showDateSeparators
            />
          </Card>
        </div>
      </div>

      <EventDetailSheet
        event={selectedEvent}
        open={isEventDetailOpen}
        onOpenChange={setIsEventDetailOpen}
        onCreateOccurrence={handleCreateOccurrence}
      />
    </MainLayout>
  );
}
