import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PressureDataPoint {
  time: string;
  pressure: number;
}

interface Pressure24hChartProps {
  data: PressureDataPoint[];
  currentPressure?: number;
  recommendedPressure?: number;
  className?: string;
}

export function Pressure24hChart({
  data,
  currentPressure,
  recommendedPressure = 32,
  className,
}: Pressure24hChartProps) {
  // Calculate min and max for Y axis with some padding
  const pressures = data.map((d) => d.pressure);
  const minPressure = Math.min(...pressures, recommendedPressure - 5);
  const maxPressure = Math.max(...pressures, recommendedPressure + 5);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Últimas 24h
        </span>
        {currentPressure !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Atual:</span>
            <span className="text-sm font-bold text-foreground">
              {currentPressure} PSI
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={[minPressure, maxPressure]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${value}`}
            />

            {/* Recommended Pressure Line */}
            <ReferenceLine
              y={recommendedPressure}
              stroke="hsl(var(--status-ok))"
              strokeDasharray="4 4"
              strokeWidth={1}
            />

            <Area
              type="monotone"
              dataKey="pressure"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#pressureGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-primary rounded" />
          <span className="text-muted-foreground">Pressão atual</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-status-ok rounded border-dashed" style={{ borderStyle: 'dashed' }} />
          <span className="text-muted-foreground">Recomendado ({recommendedPressure} PSI)</span>
        </div>
      </div>
    </div>
  );
}
