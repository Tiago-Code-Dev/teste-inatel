import { TelemetryReading } from '@/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TelemetryChartProps {
  data: TelemetryReading[];
  type: 'pressure' | 'speed';
  thresholds?: {
    min?: number;
    max?: number;
    target?: number;
  };
}

export function TelemetryChart({ data, type, thresholds }: TelemetryChartProps) {
  const chartData = data.map(reading => ({
    time: format(reading.timestamp, 'HH:mm:ss'),
    value: type === 'pressure' ? reading.pressure : reading.speed,
    timestamp: reading.timestamp,
  }));

  const config = {
    pressure: {
      label: 'Pressão (PSI)',
      color: 'hsl(var(--primary))',
      unit: 'PSI',
    },
    speed: {
      label: 'Velocidade (km/h)',
      color: 'hsl(45 93% 47%)',
      unit: 'km/h',
    },
  };

  const chartConfig = config[type];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            vertical={false}
          />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px hsl(var(--foreground) / 0.1)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`${value.toFixed(1)} ${chartConfig.unit}`, chartConfig.label]}
            labelFormatter={(label) => `Horário: ${label}`}
          />
          {thresholds?.target && (
            <ReferenceLine 
              y={thresholds.target} 
              stroke="hsl(var(--status-ok))" 
              strokeDasharray="5 5"
              label={{ 
                value: 'Ideal', 
                fill: 'hsl(var(--status-ok))',
                fontSize: 11 
              }}
            />
          )}
          {thresholds?.min && (
            <ReferenceLine 
              y={thresholds.min} 
              stroke="hsl(var(--status-warning))" 
              strokeDasharray="3 3"
            />
          )}
          {thresholds?.max && (
            <ReferenceLine 
              y={thresholds.max} 
              stroke="hsl(var(--status-critical))" 
              strokeDasharray="3 3"
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={chartConfig.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartConfig.color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
