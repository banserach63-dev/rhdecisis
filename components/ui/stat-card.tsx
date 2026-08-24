import type { LucideIcon } from "lucide-react";

type Trend = "up" | "down" | "flat";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: Trend;
  trendLabel?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
  };

  const trendClasses: Record<Trend, string> = {
    up: "text-success",
    down: "text-danger",
    flat: "text-muted",
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-foreground">{value}</div>
      {trend && trendLabel && (
        <div className={`mt-1 text-xs font-medium ${trendClasses[trend]}`}>{trendLabel}</div>
      )}
    </div>
  );
}
