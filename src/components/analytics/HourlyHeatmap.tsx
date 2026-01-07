import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HourlyHeatmapProps {
  data: { hour: number; count: number }[];
  className?: string;
}

export function HourlyHeatmap({ data, className }: HourlyHeatmapProps) {
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted';
    const ratio = count / maxCount;
    if (ratio < 0.25) return 'bg-status-ok/30';
    if (ratio < 0.5) return 'bg-status-warning/40';
    if (ratio < 0.75) return 'bg-orange-500/50';
    return 'bg-status-critical/60';
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Group hours into 4 rows of 6
  const rows = [
    data.slice(0, 6),
    data.slice(6, 12),
    data.slice(12, 18),
    data.slice(18, 24),
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="w-4 h-4" />
          Alertas por Hora do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-2">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((item, index) => (
                  <Tooltip key={item.hour}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: (rowIndex * 6 + index) * 0.02 }}
                        className={cn(
                          'flex-1 h-10 rounded-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105',
                          getIntensity(item.count)
                        )}
                      >
                        <span className="text-xs font-medium">
                          {item.count > 0 ? item.count : ''}
                        </span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{formatHour(item.hour)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} {item.count === 1 ? 'alerta' : 'alertas'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>

          {/* Hour labels */}
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
            <span className="text-xs text-muted-foreground">Menos</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-muted" />
              <div className="w-4 h-4 rounded bg-status-ok/30" />
              <div className="w-4 h-4 rounded bg-status-warning/40" />
              <div className="w-4 h-4 rounded bg-orange-500/50" />
              <div className="w-4 h-4 rounded bg-status-critical/60" />
            </div>
            <span className="text-xs text-muted-foreground">Mais</span>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
