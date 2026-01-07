import { cn } from "@/lib/utils";

interface TireStatus {
  position: number;
  status: "ok" | "warning" | "critical" | "offline";
  pressure?: number;
  label?: string;
}

interface TirePositionGridProps {
  tires: TireStatus[];
  selectedPosition?: number;
  onSelectPosition?: (position: number) => void;
  className?: string;
}

const getStatusClasses = (status: TireStatus["status"]) => {
  switch (status) {
    case "ok":
      return "bg-status-ok text-primary-foreground";
    case "warning":
      return "bg-status-warning text-primary-foreground";
    case "critical":
      return "bg-status-critical text-primary-foreground animate-pulse";
    case "offline":
      return "bg-status-offline text-primary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function TirePositionGrid({
  tires,
  selectedPosition,
  onSelectPosition,
  className,
}: TirePositionGridProps) {
  // Ensure we have 4 positions (2x2 grid)
  const gridTires = [1, 2, 3, 4].map((pos) => {
    const tire = tires.find((t) => t.position === pos);
    return tire || { position: pos, status: "offline" as const };
  });

  return (
    <div className={cn("grid grid-cols-2 gap-3 p-4", className)}>
      {gridTires.map((tire) => (
        <button
          key={tire.position}
          onClick={() => onSelectPosition?.(tire.position)}
          className={cn(
            "relative flex flex-col items-center justify-center",
            "w-full aspect-square rounded-xl",
            "transition-all duration-200",
            "border-2",
            selectedPosition === tire.position
              ? "border-primary ring-2 ring-primary/30 scale-105"
              : "border-border hover:border-primary/50",
            "bg-card shadow-sm"
          )}
        >
          {/* Position Circle */}
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              "text-lg font-bold shadow-md",
              getStatusClasses(tire.status)
            )}
          >
            {tire.position}
          </div>

          {/* Pressure Value */}
          {tire.pressure !== undefined && (
            <span className="mt-2 text-sm font-medium text-foreground">
              {tire.pressure} PSI
            </span>
          )}

          {/* Label */}
          {tire.label && (
            <span className="mt-1 text-xs text-muted-foreground">
              {tire.label}
            </span>
          )}

          {/* Critical Indicator */}
          {tire.status === "critical" && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-status-critical rounded-full pulse-dot" />
          )}
        </button>
      ))}
    </div>
  );
}
