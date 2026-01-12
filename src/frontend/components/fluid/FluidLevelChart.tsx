import { motion } from 'framer-motion';
import { Droplets, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';
import { FluidReading, FluidThresholds } from '@/hooks/useFluidBallast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FluidLevelChartProps {
  data: FluidReading[];
  thresholds: FluidThresholds;
  className?: string;
}

export function FluidLevelChart({ data, thresholds, className = '' }: FluidLevelChartProps) {
  const chartData = data.map(reading => ({
    time: format(new Date(reading.timestamp), 'HH:mm', { locale: ptBR }),
    fullTime: format(new Date(reading.timestamp), 'dd/MM HH:mm', { locale: ptBR }),
    fluidLevel: reading.fluidLevel,
    temperature: reading.temperature,
  }));

  // Calculate trend
  const trend = data.length >= 2 
    ? data[data.length - 1].fluidLevel - data[0].fluidLevel 
    : 0;

  const chartConfig = {
    fluidLevel: {
      label: 'Nível de Fluido',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" />
              Nível de Fluido
            </CardTitle>
            <div className="flex items-center gap-1 text-sm">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-status-ok" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-status-warning" />
              ) : null}
              <span className={trend >= 0 ? 'text-status-ok' : 'text-status-warning'}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fluidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullTime || label}
              />
              
              {/* Reference lines for thresholds */}
              <ReferenceLine 
                y={thresholds.fluidLevelCriticalLow} 
                stroke="hsl(var(--status-critical))" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
              <ReferenceLine 
                y={thresholds.fluidLevelMin} 
                stroke="hsl(var(--status-warning))" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
              <ReferenceLine 
                y={thresholds.fluidLevelMax} 
                stroke="hsl(var(--status-warning))" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
              <ReferenceLine 
                y={thresholds.fluidLevelCriticalHigh} 
                stroke="hsl(var(--status-critical))" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />

              <Area
                type="monotone"
                dataKey="fluidLevel"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#fluidGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-status-critical opacity-70" style={{ borderStyle: 'dashed' }} />
              <span>Crítico ({thresholds.fluidLevelCriticalLow}%-{thresholds.fluidLevelCriticalHigh}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-status-warning opacity-70" style={{ borderStyle: 'dashed' }} />
              <span>Alerta ({thresholds.fluidLevelMin}%-{thresholds.fluidLevelMax}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
