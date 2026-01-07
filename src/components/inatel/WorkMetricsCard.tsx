import { cn } from "@/lib/utils";
import { Clock, Gauge } from "lucide-react";

interface WorkMetricsCardProps {
  hoursWorked: number;
  kmTraveled: number;
  className?: string;
}

export function WorkMetricsCard({
  hoursWorked,
  kmTraveled,
  className,
}: WorkMetricsCardProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 p-4 bg-card rounded-xl border",
        className
      )}
    >
      {/* Hours Worked */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Trabalhou</p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {hoursWorked} <span className="text-sm font-normal text-muted-foreground">Horas</span>
          </p>
        </div>
      </div>

      {/* KM Traveled */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Rodou</p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {kmTraveled} <span className="text-sm font-normal text-muted-foreground">km</span>
          </p>
        </div>
      </div>
    </div>
  );
}
