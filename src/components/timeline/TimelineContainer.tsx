import { TimelineEvent } from '@/types';
import { TimelineEventCard } from './TimelineEventCard';
import { StateDisplay } from '@/components/shared/StateDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, differenceInDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineContainerProps {
  events: TimelineEvent[];
  isLoading?: boolean;
  isEmpty?: boolean;
  isOffline?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
  showDateSeparators?: boolean;
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Hoje';
  if (isYesterday(date)) return 'Ontem';
  const days = differenceInDays(new Date(), date);
  if (days <= 7) return format(date, 'EEEE', { locale: ptBR });
  return format(date, "dd 'de' MMMM", { locale: ptBR });
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="flex gap-4"
          style={{ 
            animationDelay: `${i * 100}ms`,
            opacity: 0,
            animation: `fade-in 0.5s ease-out ${i * 100}ms forwards`
          }}
        >
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimelineContainer({
  events,
  isLoading,
  isEmpty,
  isOffline,
  error,
  onRetry,
  onEventClick,
  className,
  showDateSeparators = true,
}: TimelineContainerProps) {
  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (error) {
    return (
      <StateDisplay
        state="error"
        title="Erro ao carregar histórico"
        description={error.message || 'Não foi possível carregar os eventos do pneu.'}
        action={onRetry ? { label: 'Tentar novamente', onClick: onRetry } : undefined}
      />
    );
  }

  if (isOffline) {
    return (
      <StateDisplay
        state="offline"
        title="Sem conexão"
        description="Você está offline. Os eventos serão carregados quando a conexão for restaurada."
        action={onRetry ? { label: 'Tentar novamente', onClick: onRetry } : undefined}
      />
    );
  }

  if (isEmpty || events.length === 0) {
    return (
      <StateDisplay
        state="empty"
        title="Nenhum evento registrado"
        description="Não há eventos no histórico deste pneu para o período selecionado. Eventos serão registrados automaticamente conforme o uso."
      />
    );
  }

  // Sort events by timestamp descending (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Group events by date for separators
  let lastDateLabel = '';

  return (
    <div className={cn('relative', className)}>
      {sortedEvents.map((event, index) => {
        const currentDateLabel = getDateLabel(new Date(event.timestamp));
        const showSeparator = showDateSeparators && currentDateLabel !== lastDateLabel;
        lastDateLabel = currentDateLabel;

        return (
          <div key={event.id}>
            {/* Date Separator with animation */}
            {showSeparator && (
              <div 
                className="flex items-center gap-3 mb-4 mt-2 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-1 rounded-full bg-muted/50 capitalize">
                  {currentDateLabel}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            )}

            <TimelineEventCard
              event={event}
              isFirst={index === 0}
              isLast={index === sortedEvents.length - 1}
              onClick={onEventClick ? () => onEventClick(event) : undefined}
              showConnector={!showDateSeparators}
              animationDelay={index * 50}
            />
          </div>
        );
      })}
    </div>
  );
}
