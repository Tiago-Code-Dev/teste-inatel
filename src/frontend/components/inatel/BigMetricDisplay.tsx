import { cn } from "@/lib/utils";

type MetricStatus = "ok" | "warning" | "critical" | "neutral";

interface BigMetricDisplayProps {
  value: string | number;
  unit: string;
  label?: string;
  status?: MetricStatus;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
}

const getStatusColor = (status: MetricStatus) => {
  switch (status) {
    case "ok":
      return "text-status-ok";
    case "warning":
      return "text-status-warning";
    case "critical":
      return "text-status-critical";
    default:
      return "text-foreground";
  }
};

export function BigMetricDisplay({
  value,
  unit,
  label,
  status = "neutral",
  trend,
  trendValue,
  className,
}: BigMetricDisplayProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* Label */}
      {label && (
        <span className="text-sm text-muted-foreground font-medium mb-1">
          {label}
        </span>
      )}

      {/* Value Container */}
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-4xl font-bold tabular-nums tracking-tight",
            getStatusColor(status),
            status === "critical" && "animate-pulse"
          )}
        >
          {value}
        </span>
        <span className="text-lg font-medium text-muted-foreground">{unit}</span>
      </div>

      {/* Trend */}
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-status-ok",
              trend === "down" && "text-status-critical",
              trend === "stable" && "text-muted-foreground"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "stable" && "→"}
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
