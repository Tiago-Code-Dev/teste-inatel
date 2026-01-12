import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sun, Sunset, Moon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

type ShiftType = 'morning' | 'afternoon' | 'night';

interface ShiftPerformanceChartProps {
  data: Record<ShiftType, number>;
  className?: string;
}

const shiftConfig: Record<ShiftType, { label: string; color: string; icon: any }> = {
  morning: { label: 'Manhã', color: '#fbbf24', icon: Sun },
  afternoon: { label: 'Tarde', color: '#f97316', icon: Sunset },
  night: { label: 'Noite', color: '#6366f1', icon: Moon },
};

export function ShiftPerformanceChart({ data, className }: ShiftPerformanceChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(data).map(([shift, count]) => ({
      shift: shift as ShiftType,
      label: shiftConfig[shift as ShiftType].label,
      count,
      color: shiftConfig[shift as ShiftType].color,
    }));
  }, [data]);

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">{item.label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {item.count} alertas ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sun className="w-4 h-4" />
          Alertas por Turno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis 
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Shift cards */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
          {chartData.map((item, index) => {
            const Icon = shiftConfig[item.shift].icon;
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            
            return (
              <motion.div
                key={item.shift}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center p-3 rounded-lg bg-muted/50"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="text-lg font-bold">{item.count}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-[10px] text-muted-foreground/70">{percentage}%</span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
