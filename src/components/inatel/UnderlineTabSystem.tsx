import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface UnderlineTabSystemProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function UnderlineTabSystem({
  tabs,
  activeTab,
  onTabChange,
  className,
}: UnderlineTabSystemProps) {
  return (
    <div className={cn("border-b border-border", className)}>
      <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium whitespace-nowrap",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              activeTab === tab.id
                ? "text-destructive"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeTab === tab.id
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>

            {/* Underline Indicator */}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-destructive rounded-full"
                style={{
                  animation: "slideIn 0.2s ease-out",
                }}
              />
            )}
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes slideIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
