import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AlertSeverity = "critical" | "warning" | "info";

interface AlertDeviceCardProps {
  deviceName: string;
  deviceType: "vehicle" | "tire";
  alertMessage: string;
  severity: AlertSeverity;
  timestamp: Date;
  onClick?: () => void;
  className?: string;
}

const getSeverityConfig = (severity: AlertSeverity) => {
  switch (severity) {
    case "critical":
      return {
        borderClass: "border-l-4 border-l-status-critical",
        bgClass: "bg-status-critical/5",
        iconClass: "text-status-critical",
        badgeClass: "bg-status-critical/15 text-status-critical",
        label: "Crítico",
      };
    case "warning":
      return {
        borderClass: "border-l-4 border-l-status-warning",
        bgClass: "bg-status-warning/5",
        iconClass: "text-status-warning",
        badgeClass: "bg-status-warning/15 text-status-warning",
        label: "Atenção",
      };
    case "info":
      return {
        borderClass: "border-l-4 border-l-primary",
        bgClass: "bg-primary/5",
        iconClass: "text-primary",
        badgeClass: "bg-primary/15 text-primary",
        label: "Informação",
      };
  }
};

export function AlertDeviceCard({
  deviceName,
  deviceType,
  alertMessage,
  severity,
  timestamp,
  onClick,
  className,
}: AlertDeviceCardProps) {
  const config = getSeverityConfig(severity);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl",
        "border transition-all duration-200",
        "hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        config.borderClass,
        config.bgClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Alert Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            severity === "critical" && "bg-status-critical/20 animate-pulse"
          )}
        >
          <AlertTriangle className={cn("w-5 h-5", config.iconClass)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {deviceName}
            </h3>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                config.badgeClass
              )}
            >
              {config.label}
            </span>
          </div>

          <p className="text-sm text-foreground mb-2 line-clamp-2">
            {alertMessage}
          </p>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {format(timestamp, "dd/MM 'às' HH:mm", { locale: ptBR })}
            </span>
            <span className="mx-1">•</span>
            <span className="capitalize">{deviceType === "vehicle" ? "Veículo" : "Pneu"}</span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="flex-shrink-0 w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
}
