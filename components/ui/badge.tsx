import type { ReactNode } from "react";

type Tone = "default" | "success" | "warning" | "danger" | "info" | "primary";

const TONE_CLASSES: Record<Tone, string> = {
  default: "bg-surface-muted text-muted",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  primary: "bg-primary-soft text-primary",
};

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
