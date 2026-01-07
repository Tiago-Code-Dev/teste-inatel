import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ReferenceLine } from 'recharts';
import { FluidReading, FluidThresholds } from '@/hooks/useFluidBallast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FluidTemperatureChartProps {
  data: FluidReading[];
  thresholds: FluidThresholds;
  className?: string;
}

export function FluidTemperatureChart({ data, thresholds, className = '' }: FluidTemperatureChartProps) {
  const chartData = data.map(reading => ({
    time: format(new Date(reading.timestamp), 'HH:mm', { locale: ptBR }),
    fullTime: format(new Date(reading.timestamp), 'dd/MM HH:mm', { locale: ptBR }),
    temperature: reading.temperature,
    pressure: reading.pressure,
  }));

  const chartConfig = {
    temperature: {
      label: 'Temperatura',
      color: 'hsl(var(--status-warning))',
    },
    pressure: {
      label: 'Pressão',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={className}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-status-warning" />
            Temperatura & Pressão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="temp"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => `${value}°`}
              />
              <YAxis 
                yAxisId="pressure"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => `${value}bar`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullTime || label}
              />
              
              {/* Temperature threshold lines */}
              <ReferenceLine 
                yAxisId="temp"
                y={thresholds.temperatureMax} 
                stroke="hsl(var(--status-warning))" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
              <ReferenceLine 
                yAxisId="temp"
                y={thresholds.temperatureCritical} 
                stroke="hsl(var(--status-critical))" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />

              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                stroke="hsl(var(--status-warning))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--status-warning))' }}
              />
              <Line
                yAxisId="pressure"
                type="monotone"
                dataKey="pressure"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 rounded bg-status-warning" />
              <span>Temperatura (°C)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 rounded bg-primary" />
              <span>Pressão (bar)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
