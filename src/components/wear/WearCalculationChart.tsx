import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity } from 'lucide-react';

interface ChartDataPoint {
  timestamp: string;
  time: string;
  advance: number;
  slippage: number;
  pressure: number;
  speed: number;
}

interface WearCalculationChartProps {
  data: ChartDataPoint[];
  type: 'advance' | 'slippage';
  threshold?: number;
  className?: string;
}

export function WearCalculationChart({
  data,
  type,
  threshold,
  className = '',
}: WearCalculationChartProps) {
  const isAdvance = type === 'advance';
  const Icon = isAdvance ? TrendingUp : Activity;
  const title = isAdvance ? 'Avanço (Distância Percorrida)' : 'Índice de Patinagem';
  const unit = isAdvance ? 'km' : '%';
  const dataKey = isAdvance ? 'advance' : 'slippage';
  const gradientId = `gradient-${type}`;
  const color = isAdvance ? 'hsl(var(--primary))' : 'hsl(var(--status-warning))';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-muted-foreground">
              {isAdvance ? 'Distância' : 'Patinagem'}:
            </span>
            <span className="text-sm font-semibold text-foreground">
              {value.toFixed(1)} {unit}
            </span>
          </div>
          {!isAdvance && payload[0].payload && (
            <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
              <p>Pressão: {payload[0].payload.pressure.toFixed(1)} PSI</p>
              <p>Velocidade: {payload[0].payload.speed.toFixed(0)} km/h</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`bg-card/50 backdrop-blur-sm ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.5} 
                />
                <XAxis
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}${unit}`}
                  domain={isAdvance ? ['auto', 'auto'] : [0, 50]}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {threshold && (
                  <ReferenceLine
                    y={threshold}
                    stroke="hsl(var(--status-critical))"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: `Limite: ${threshold}${unit}`,
                      position: 'right',
                      fontSize: 11,
                      fill: 'hsl(var(--status-critical))',
                    }}
                  />
                )}
                
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
