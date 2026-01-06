import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  FileText, 
  Wrench, 
  Gauge,
  Info,
  Bell,
  X,
  Check
} from 'lucide-react';
import { TimelineEvent } from '@/types';

export type EventTypeOption = TimelineEvent['type'] | 'telemetry_critical' | 'info' | 'all';

interface EventTypeFilterProps {
  selected: EventTypeOption[];
  onChange: (types: EventTypeOption[]) => void;
  className?: string;
  eventCounts?: Record<EventTypeOption, number>;
}

const eventTypes: { value: EventTypeOption; label: string; icon: typeof Bell; color: string; activeColor: string }[] = [
  { 
    value: 'telemetry_critical', 
    label: 'Crítica', 
    icon: Gauge, 
    color: 'hover:bg-status-critical/10 hover:border-status-critical/30 hover:text-status-critical',
    activeColor: 'text-status-critical bg-status-critical/10 border-status-critical/30' 
  },
  { 
    value: 'alert', 
    label: 'Alertas', 
    icon: Bell, 
    color: 'hover:bg-status-warning/10 hover:border-status-warning/30 hover:text-status-warning',
    activeColor: 'text-status-warning bg-status-warning/10 border-status-warning/30' 
  },
  { 
    value: 'occurrence', 
    label: 'Ocorrências', 
    icon: FileText, 
    color: 'hover:bg-primary/10 hover:border-primary/30 hover:text-primary',
    activeColor: 'text-primary bg-primary/10 border-primary/30' 
  },
  { 
    value: 'maintenance', 
    label: 'Manutenção', 
    icon: Wrench, 
    color: 'hover:bg-status-ok/10 hover:border-status-ok/30 hover:text-status-ok',
    activeColor: 'text-status-ok bg-status-ok/10 border-status-ok/30' 
  },
  { 
    value: 'info', 
    label: 'Info', 
    icon: Info, 
    color: 'hover:bg-muted',
    activeColor: 'text-muted-foreground bg-muted border-border' 
  },
];

export function EventTypeFilter({ selected, onChange, className, eventCounts }: EventTypeFilterProps) {
  const isAllSelected = selected.length === 0 || selected.includes('all');

  const toggleType = (type: EventTypeOption) => {
    if (type === 'all') {
      onChange([]);
      return;
    }

    const newSelected = selected.filter(t => t !== 'all');
    
    if (newSelected.includes(type)) {
      const filtered = newSelected.filter(t => t !== type);
      onChange(filtered.length === 0 ? [] : filtered);
    } else {
      onChange([...newSelected, type]);
    }
  };

  const clearFilters = () => {
    onChange([]);
  };

  const totalEvents = eventCounts 
    ? Object.values(eventCounts).reduce((a, b) => a + b, 0)
    : undefined;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Filtrar por tipo</span>
        {!isAllSelected && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar filtros
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={cn(
            'cursor-pointer transition-all duration-200 px-3 py-1.5 gap-1.5',
            isAllSelected 
              ? 'bg-primary/10 text-primary border-primary/30' 
              : 'hover:bg-muted'
          )}
          onClick={() => toggleType('all')}
        >
          {isAllSelected && <Check className="w-3 h-3" />}
          Todos
          {totalEvents !== undefined && (
            <span className="ml-1 text-xs opacity-70">({totalEvents})</span>
          )}
        </Badge>
        
        {eventTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selected.includes(type.value);
          const count = eventCounts?.[type.value];
          
          return (
            <Badge
              key={type.value}
              variant="outline"
              className={cn(
                'cursor-pointer transition-all duration-200 gap-1.5 px-3 py-1.5',
                isSelected ? type.activeColor : type.color
              )}
              onClick={() => toggleType(type.value)}
            >
              <Icon className="w-3.5 h-3.5" />
              {type.label}
              {count !== undefined && count > 0 && (
                <span className={cn(
                  'ml-0.5 min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs flex items-center justify-center',
                  isSelected ? 'bg-background/30' : 'bg-muted'
                )}>
                  {count}
                </span>
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
