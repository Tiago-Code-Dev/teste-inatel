import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface OperationData {
  time: string;
  value: number;
  operation?: string;
}

interface OperationHistoryChartProps {
  data: OperationData[];
  currentTime?: string;
  className?: string;
}

const operationColors: Record<string, string> = {
  idle: "hsl(var(--muted))",
  working: "hsl(var(--primary))",
  transport: "hsl(var(--status-warning))",
  maintenance: "hsl(var(--status-critical))",
};

export function OperationHistoryChart({
  data,
  currentTime,
  className,
}: OperationHistoryChartProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Histórico de Operações
        </span>
        {currentTime && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            AGORA: {currentTime}
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="operationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 100]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />

            <Area
              type="stepAfter"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#operationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Operation Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-muted-foreground">Trabalhando</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-status-warning" />
          <span className="text-muted-foreground">Transporte</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-muted-foreground">Parado</span>
        </div>
      </div>
    </div>
  );
}
