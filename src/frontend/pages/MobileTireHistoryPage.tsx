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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  CircleDot, 
  Gauge, 
  Truck,
  Calendar,
  RefreshCw,
  SlidersHorizontal,
  AlertTriangle,
  ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState, useCallback, useRef, useEffect } from 'react';
import { TimelineEvent } from '@/types';

const lifecycleLabels: Record<string, { label: string; className: string }> = {
  new: { label: 'Novo', className: 'bg-status-ok/15 text-status-ok' },
  in_use: { label: 'Em uso', className: 'bg-primary/15 text-primary' },
  maintenance: { label: 'Manutenção', className: 'bg-status-warning/15 text-status-warning' },
  retired: { label: 'Descartado', className: 'bg-muted text-muted-foreground' },
};

export default function MobileTireHistoryPage() {
  const { id: tireId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

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
    // Extract machine ID from the event if available
    const alertId = event.id.startsWith('alert-') ? event.id.replace('alert-', '') : undefined;
    navigate(`/occurrences/new?tireId=${tireId}&alertId=${alertId}`);
  }, [navigate, tireId]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return;
    
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, Math.min(100, currentY - startY.current));
      setPullDistance(distance);
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      refetch();
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, refetch]);

  if (tireLoading) {
    return (
      <MainLayout title="Carregando...">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
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
  const activeFiltersCount = eventTypeFilter.length;

  return (
    <MainLayout 
      title="Histórico"
      subtitle={tire.serial}
    >
      <div className="flex flex-col h-full">
        {/* Pull-to-refresh indicator */}
        <div 
          className={cn(
            'flex items-center justify-center overflow-hidden transition-all duration-200',
            pullDistance > 0 ? 'opacity-100' : 'opacity-0'
          )}
          style={{ height: pullDistance }}
        >
          <div className={cn(
            'flex items-center gap-2 text-muted-foreground',
            pullDistance > 60 && 'text-primary'
          )}>
            <ArrowDown className={cn(
              'w-4 h-4 transition-transform',
              pullDistance > 60 && 'rotate-180'
            )} />
            <span className="text-sm">
              {pullDistance > 60 ? 'Solte para atualizar' : 'Puxe para atualizar'}
            </span>
          </div>
        </div>

        {/* Compact Tire Info Header */}
        <div className={cn(
          'p-4 border-b bg-card rounded-lg mb-4',
          isLowPressure && 'border-status-critical/50'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg',
              isLowPressure ? 'bg-status-critical/10' : 'bg-primary/10'
            )}>
              <CircleDot className={cn(
                'w-5 h-5',
                isLowPressure ? 'text-status-critical' : 'text-primary'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground truncate">{tire.serial}</h2>
                <Badge className={cn('text-xs', lifecycle.className)}>
                  {lifecycle.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {tire.position && <span>{tire.position}</span>}
                {tire.machines && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {(tire.machines as { name: string }).name}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Pressure indicator */}
            <div className={cn(
              'flex flex-col items-end',
              isLowPressure && 'text-status-critical'
            )}>
              {isLowPressure && <AlertTriangle className="w-4 h-4 mb-1 animate-pulse" />}
              <span className="text-lg font-bold tabular-nums">
                {tire.current_pressure?.toFixed(0) || '--'}
              </span>
              <span className="text-xs text-muted-foreground">PSI</span>
            </div>
          </div>
        </div>

        {/* Quick Time Range + Filter Button */}
        <div className="p-3 border rounded-lg bg-background flex items-center justify-between gap-3 mb-4">
          <TimeRangeSelector
            value={timeRange}
            onChange={setTimeRange}
            customRange={customRange}
            className="flex-1 overflow-x-auto"
          />
          
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0 relative">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center animate-scale-in">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[70vh]">
              <SheetHeader>
                <SheetTitle>Filtrar eventos</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <EventTypeFilter
                  selected={eventTypeFilter}
                  onChange={(types) => {
                    setEventTypeFilter(types);
                  }}
                  eventCounts={eventCounts}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => setIsFilterOpen(false)}
              >
                Aplicar filtros
              </Button>
            </SheetContent>
          </Sheet>
        </div>

        {/* Actions Bar */}
        <div className="px-4 py-2 flex items-center justify-between bg-muted/30 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
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

        {/* Timeline with pull-to-refresh */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto pb-24"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
        </div>
      </div>

      {/* Event Detail Sheet */}
      <EventDetailSheet
        event={selectedEvent}
        open={isEventDetailOpen}
        onOpenChange={setIsEventDetailOpen}
        onCreateOccurrence={handleCreateOccurrence}
      />
    </MainLayout>
  );
}
