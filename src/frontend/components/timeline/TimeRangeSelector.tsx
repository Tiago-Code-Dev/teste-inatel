import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export type TimeRangeOption = '6h' | '24h' | '7d' | '30d' | 'custom';

interface TimeRangeSelectorProps {
  value: TimeRangeOption;
  onChange: (value: TimeRangeOption, customRange?: { from: Date; to: Date }) => void;
  customRange?: { from: Date; to: Date };
  className?: string;
}

const rangeOptions: { value: TimeRangeOption; label: string }[] = [
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'custom', label: 'Período' },
];

export function TimeRangeSelector({ 
  value, 
  onChange, 
  customRange,
  className 
}: TimeRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    customRange ? { from: customRange.from, to: customRange.to } : undefined
  );

  const handleRangeSelect = (option: TimeRangeOption) => {
    if (option === 'custom') {
      setIsCalendarOpen(true);
    } else {
      onChange(option);
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onChange('custom', { from: range.from, to: range.to });
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {rangeOptions.map((option) => (
        option.value === 'custom' ? (
          <Popover key={option.value} open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={value === 'custom' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'gap-1.5 transition-all duration-200',
                  value === 'custom' && 'shadow-sm'
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                {value === 'custom' && customRange ? (
                  <span className="text-xs">
                    {format(customRange.from, 'dd/MM', { locale: ptBR })} - {format(customRange.to, 'dd/MM', { locale: ptBR })}
                  </span>
                ) : (
                  option.label
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                locale={ptBR}
                disabled={{ after: new Date() }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ) : (
          <Button
            key={option.value}
            variant={value === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRangeSelect(option.value)}
            className={cn(
              'transition-all duration-200',
              value === option.value && 'shadow-sm'
            )}
          >
            {option.label}
          </Button>
        )
      ))}
    </div>
  );
}
