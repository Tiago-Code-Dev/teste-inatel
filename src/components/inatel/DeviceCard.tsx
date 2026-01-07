import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type DeviceStatus = "em_uso" | "parado" | "sem_comunicacao" | "manutencao";

interface DeviceCardProps {
  title: string;
  subtitle?: string;
  status: DeviceStatus;
  statusLabel?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  hasAlert?: boolean;
}

const getStatusConfig = (status: DeviceStatus) => {
  switch (status) {
    case "em_uso":
      return {
        label: "Em uso",
        bgClass: "bg-status-ok/15",
        textClass: "text-status-ok",
        borderClass: "border-status-ok/30",
      };
    case "parado":
      return {
        label: "Parado",
        bgClass: "bg-muted",
        textClass: "text-muted-foreground",
        borderClass: "border-border",
      };
    case "sem_comunicacao":
      return {
        label: "Sem comunicação",
        bgClass: "bg-status-critical/15",
        textClass: "text-status-critical",
        borderClass: "border-status-critical/30",
      };
    case "manutencao":
      return {
        label: "Manutenção",
        bgClass: "bg-status-warning/15",
        textClass: "text-status-warning",
        borderClass: "border-status-warning/30",
      };
    default:
      return {
        label: "Desconhecido",
        bgClass: "bg-muted",
        textClass: "text-muted-foreground",
        borderClass: "border-border",
      };
  }
};

export function DeviceCard({
  title,
  subtitle,
  status,
  statusLabel,
  onClick,
  icon,
  className,
  hasAlert,
}: DeviceCardProps) {
  const statusConfig = getStatusConfig(status);
  const displayLabel = statusLabel || statusConfig.label;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4",
        "bg-card rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        hasAlert && "border-status-critical/50 bg-status-critical/5",
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      {/* Status Badge */}
      <div
        className={cn(
          "flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium",
          "border",
          statusConfig.bgClass,
          statusConfig.textClass,
          statusConfig.borderClass
        )}
      >
        {displayLabel}
      </div>

      {/* Alert Indicator */}
      {hasAlert && (
        <div className="flex-shrink-0 w-2 h-2 bg-status-critical rounded-full pulse-dot" />
      )}

      {/* Chevron */}
      <ChevronRight className="flex-shrink-0 w-5 h-5 text-muted-foreground" />
    </button>
  );
}
