import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

interface PerformanceDataPoint {
  timestamp: string;
  hour: string;
  uptime: number;
  downtime: number;
  efficiency: number;
  alertCount: number;
  resourceUsage: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  type?: 'uptime' | 'efficiency' | 'alerts' | 'resources';
  height?: number;
  className?: string;
}

export function PerformanceChart({
  data,
  type = 'uptime',
  height = 300,
  className,
}: PerformanceChartProps) {
  const getChartConfig = () => {
    switch (type) {
      case 'uptime':
        return {
          title: 'Tempo de Operação vs Inatividade',
          areas: [
            { dataKey: 'uptime', name: 'Operação', stroke: 'hsl(var(--chart-2))', fill: 'hsl(var(--chart-2))' },
            { dataKey: 'downtime', name: 'Inatividade', stroke: 'hsl(var(--chart-1))', fill: 'hsl(var(--chart-1))' },
          ],
        };
      case 'efficiency':
        return {
          title: 'Eficiência Operacional',
          areas: [
            { dataKey: 'efficiency', name: 'Eficiência', stroke: 'hsl(var(--chart-3))', fill: 'hsl(var(--chart-3))' },
          ],
        };
      case 'alerts':
        return {
          title: 'Alertas ao Longo do Tempo',
          areas: [
            { dataKey: 'alertCount', name: 'Alertas', stroke: 'hsl(var(--chart-1))', fill: 'hsl(var(--chart-1))' },
          ],
        };
      case 'resources':
        return {
          title: 'Uso de Recursos',
          areas: [
            { dataKey: 'resourceUsage', name: 'Utilização', stroke: 'hsl(var(--chart-4))', fill: 'hsl(var(--chart-4))' },
          ],
        };
    }
  };

  const config = getChartConfig();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-5 h-5" />
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {config.areas.map((area, index) => (
                <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={area.fill} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={area.fill} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              domain={type === 'alerts' ? ['auto', 'auto'] : [0, 100]}
              tickFormatter={(value) => type === 'alerts' ? value : `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                type === 'alerts' ? value : `${value}%`,
                name,
              ]}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
            />
            {config.areas.map((area) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={area.stroke}
                fill={`url(#gradient-${area.dataKey})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
