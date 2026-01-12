import { cn } from "@/lib/utils";

interface StatusIndicatorBarProps {
  value: number; // 0-100
  label: string;
  showValue?: boolean;
  className?: string;
}

export function StatusIndicatorBar({
  value,
  label,
  showValue = true,
  className,
}: StatusIndicatorBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  // Determine color zone based on value
  const getMarkerColor = () => {
    if (clampedValue <= 33) return "bg-status-ok";
    if (clampedValue <= 66) return "bg-status-warning";
    return "bg-status-critical";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {showValue && (
          <span className="text-sm font-bold text-foreground">{clampedValue}%</span>
        )}
      </div>

      {/* Bar Container */}
      <div className="relative h-3 rounded-full overflow-hidden">
        {/* Gradient Background: Green -> Yellow -> Red */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right, 
              hsl(var(--status-ok)) 0%, 
              hsl(var(--status-ok)) 25%,
              hsl(var(--status-warning)) 50%, 
              hsl(var(--status-critical)) 75%,
              hsl(var(--status-critical)) 100%
            )`,
          }}
        />

        {/* Marker */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full",
            "border-2 border-background shadow-md transition-all duration-300",
            getMarkerColor()
          )}
          style={{ left: `calc(${clampedValue}% - 8px)` }}
        />
      </div>

      {/* Zone Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Normal</span>
        <span>Atenção</span>
        <span>Crítico</span>
      </div>
    </div>
  );
}
