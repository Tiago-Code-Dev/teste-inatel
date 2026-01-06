import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  FileText, 
  Wrench, 
  Gauge,
  Info,
  Bell,
  X
} from 'lucide-react';
import { TimelineEvent } from '@/types';

export type EventTypeOption = TimelineEvent['type'] | 'telemetry_critical' | 'info' | 'all';

interface EventTypeFilterProps {
  selected: EventTypeOption[];
  onChange: (types: EventTypeOption[]) => void;
  className?: string;
}

const eventTypes: { value: EventTypeOption; label: string; icon: typeof Bell; color: string }[] = [
  { value: 'alert', label: 'Alertas', icon: Bell, color: 'text-status-warning bg-status-warning/10 border-status-warning/30' },
  { value: 'occurrence', label: 'Ocorrências', icon: FileText, color: 'text-primary bg-primary/10 border-primary/30' },
  { value: 'maintenance', label: 'Manutenção', icon: Wrench, color: 'text-status-ok bg-status-ok/10 border-status-ok/30' },
  { value: 'telemetry_critical', label: 'Crítica', icon: Gauge, color: 'text-status-critical bg-status-critical/10 border-status-critical/30' },
  { value: 'info', label: 'Info', icon: Info, color: 'text-muted-foreground bg-muted border-border' },
];

export function EventTypeFilter({ selected, onChange, className }: EventTypeFilterProps) {
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
            Limpar
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={cn(
            'cursor-pointer transition-all duration-200 px-3 py-1.5',
            isAllSelected 
              ? 'bg-primary/10 text-primary border-primary/30' 
              : 'hover:bg-muted'
          )}
          onClick={() => toggleType('all')}
        >
          Todos
        </Badge>
        
        {eventTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selected.includes(type.value);
          
          return (
            <Badge
              key={type.value}
              variant="outline"
              className={cn(
                'cursor-pointer transition-all duration-200 gap-1.5 px-3 py-1.5',
                isSelected ? type.color : 'hover:bg-muted'
              )}
              onClick={() => toggleType(type.value)}
            >
              <Icon className="w-3.5 h-3.5" />
              {type.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
